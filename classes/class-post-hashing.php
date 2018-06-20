<?php
/**
 * Hanldes all logic related to hasing a post.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * The Post_Hashing class.
 */
class Post_Hashing {
	use Singleton;

	/**
	 * Setup the class.
	 */
	public function setup() {
		add_action( '_wp_put_post_revision', [ $this, 'hash_post_content' ] );

		// Force WordPress to save a new revision for meta data updates.
		add_filter( 'wp_save_post_revision_check_for_changes', '__return_false' );

		// Clean up revisions when a post is published.
		add_action( 'transition_post_status', [ $this, 'purge_revisions' ], 10, 3 );
	}

	/**
	 * Hash a string based on the `Keccak-256` hashing algorithm.
	 *
	 * @param  string $content The content to hash.
	 * @return string          The hashed content.
	 */
	public function hash( string $content ) : string {
		// Include the hashing library.
		require_once PATH . '/lib/php-keccak/Keccak.php';

		return '0x' . \kornrunner\Keccak::hash( $content, '256' );
	}

	/**
	 * Checks if a post is able to save a hash value of its content.
	 *
	 * @param int $post_id The post ID.
	 * @return bool Whether or not the post can save a hash.
	 */
	public function can_save_hash( $post_id ) : bool {
		$can_hash = true;

		// Only save hashes for supported post types.
		if ( ! in_array( get_post_type( $post_id ), get_blockchain_post_types(), true ) ) {
			$can_hash = false;
		}

		/**
		 * Filters whether or not a post hash can be saved.
		 *
		 * @param bool $can_hash Can the post has be saved?
		 * @param int  $post_id  The post ID.
		 */
		return apply_filters( 'blockchain_can_save_hash', $can_hash, $post_id );
	}

	/**
	 * Hash the post content.
	 *
	 * @param int $post_id The post ID.
	 */
	public function hash_post_content( $post_id ) {
		$post = get_post( $post_id );

		// No post found.
		if ( ! ( $post instanceof \WP_Post ) ) {
			return;
		}

		// Ensure we can hash this revision.
		if ( ! $this->can_save_hash( $post->post_parent ) ) {
			return;
		}

		// Hash the post content.
		$revision_hash = $this->hash( $post->post_content );
		update_metadata( 'post', $post_id, REVISION_HASH_META_KEY, $revision_hash );

		// Add authors.
		$authors   = [];
		$coauthors = [];
		if ( function_exists( 'get_coauthors' ) ) {
			$coauthors = get_coauthors( $post->post_parent );
		} else {
			// Support absence of co-authors-plus plugin.
			$author = get_user_by( 'id', $post->post_author );
			if ( ! empty( $author ) ) {
				$coauthors[] = $author;
			}
		}

		$newsroom_address = get_option( NEWSROOM_ADDRESS_OPTION_KEY );
		// $post is a revision, and this meta is stored on post itself, so get from the parent.
		$signatures = get_post_meta( $post->post_parent, SIGNATURES_META_KEY, true );
		$signatures = ! empty( $signatures ) ? json_decode( $signatures, true ) : null;

		if ( ! empty( $coauthors ) ) {
			foreach ( $coauthors as $coauthor ) {
				$author_data = [
					'byline' => $coauthor->display_name,
				];

				if ( ! empty( $signatures[ $coauthor->user_login ] ) ) {
					$sig_data = $signatures[ $coauthor->user_login ];
					// Check signature still valid for current state of post before adding to author data.
					if ( $sig_data['newsroomAddress'] == $newsroom_address && $sig_data['contentHash'] == $revision_hash ) {
						$author_data['address'] = $sig_data['author'];
						$author_data['signature'] = $sig_data['signature'];
					}
				}

				$authors[] = $author_data;
			}
		}

		// Add images.
		$images       = [];
		$thumbnail_id = get_post_thumbnail_id( $post->post_parent );

		if ( ! empty( $thumbnail_id ) ) {
			$image_src = wp_get_attachment_image_src( $thumbnail_id, 'full' );

			// Ensure we have a proper image.
			if ( ! empty( $image_src ) && is_array( $image_src ) ) {
				$images[] = [
					'url'  => $image_src[0],
					'hash' => $this->hash_image( $thumbnail_id ),
					'h'    => $image_src[1],
					'w'    => $image_src[2],
				];
			}
		}

		// Add primary category.
		$primary_category    = '';
		$primary_category_id = get_post_meta( $post->post_parent, 'primary_category_id', true );

		if ( ! empty( $primary_category_id ) ) {
			$primary_category_term = get_term_by( 'id', $primary_category_id, 'category' );

			if ( $primary_category_term instanceof \WP_Term ) {
				$primary_category = $primary_category_term->slug;
			}
		}

		// Create revision JSON payload data.
		$json_payload_data = [
			'authors'               => $authors,
			'images'                => $images,
			'tags'                  => wp_get_post_tags( $post->post_parent, [ 'fields' => 'slugs' ] ),
			'primaryTag'            => $primary_category,
			'credibilityIndicators' => get_post_meta( $post->post_parent, 'credibility_indicators', true ),
		];

		// Save revision JSON payload data.
		update_metadata( 'post', $post_id, REVISION_DATA_META_KEY, $json_payload_data );
	}

	/**
	 * Hash an image.
	 *
	 * @param int $image_id The image ID.
	 * @return string The image Hash.
	 */
	public function hash_image( $image_id ) {
		// Get the image data.
		$image_src      = wp_get_attachment_image_src( $image_id, 'full' );
		$image_contents = '';

		// Get the image binary.
		if ( ! empty( $image_src[0] ) ) {
			$image_contents = wpcom_vip_file_get_contents( $image_src[0] );
		}

		return $this->hash( $image_contents );
	}

	/**
	 * Purges all post revisions, except for the latest one, on post publish.
	 *
	 * The smart contracting system we have needs a new post revision for any change
	 * to a post, not just the title, content or excerpt. This means that there can
	 * be a lot of reivions saved for a post prior to it being published. Also,
	 * Gutenberg saves the current post in set intervals from the edit post page,
	 * which also adds to the number of saved revisions.
	 *
	 * @param string   $new_status The new post status.
	 * @param string   $old_status The old post status.
	 * @param \WP_Post $post       The post object.
	 */
	public function purge_revisions( $new_status, $old_status, $post ) {
		// Only purge revisions on post publish.
		if ( 'publish' !== $old_status && 'publish' === $new_status ) {
			// Get all post revisions.
			$revisions = wp_get_post_revisions( $post->ID );

			// Ensure we have revisions to delete.
			if ( ! empty( $revisions ) && is_array( $revisions ) ) {
				foreach ( $revisions as $revision ) {

					// Delete all meta data.
					$metadata = get_post_meta( $revision->ID );

					if ( ! empty( $metadata ) && is_array( $metadata ) ) {
						foreach ( $metadata as $key => $val ) {
							delete_post_meta( $revision->ID, $key );
						}
					}

					// Delete the revision.
					wp_delete_post( $revision->ID, true );
				}
			}
		}
	}
}

Post_Hashing::instance();
