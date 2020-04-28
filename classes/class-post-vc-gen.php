<?php
/**
 * Hanldes all logic related to generating VCs for posts.
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

/**
 * The Post_VC_Gen class.
 */
class Post_VC_Gen {
	use Singleton;

	/**
	 * Setup the class.
	 */
	public function setup() {
		add_action( 'save_post', array( $this, 'generate_vc' ) );
	}

	/**
	 * Checks if we should generate a VC for this post
	 *
	 * @param int $post_id The post ID.
	 * @return bool Whether or not to generate a VC.
	 */
	public function should_gen_vc( $post_id ) : bool {
		$should_gen = true;

		// Only generate VCs for supported post types.
		if ( ! in_array( get_post_type( $post_id ), get_civil_post_types(), true ) ) {
			$should_gen = false;
		}

		/**
		 * Filters whether or not to generate a VC.
		 *
		 * @param bool $should_gen Should we generate VC?
		 * @param int  $post_id  The post ID.
		 */
		return apply_filters( 'civil_publisher_should_gen_vc', $should_gen, $post_id );
	}

	/**
	 * Generate a VC for this post.
	 *
	 * @param int $post_id The post ID.
	 */
	public function generate_vc( $post_id ) {
		$post = get_post( $post_id );

		if ( ! ( $post instanceof \WP_Post ) ) {
			return;
		} else if ( ! isset( $post->post_status ) || 'publish' != $post->post_status ) {
			return;
		} else if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		} else if ( ! $this->should_gen_vc( $post->ID ) ) {
			return;
		}

		$primary_category    = '';
		$primary_category_id = get_post_meta( $post->ID, 'primary_category_id', true );

		if ( ! empty( $primary_category_id ) ) {
			$primary_category_term = get_term_by( 'id', $primary_category_id, 'category' );

			if ( $primary_category_term instanceof \WP_Term ) {
				$primary_category = $primary_category_term->slug;
			}
		}

		$vc_data = array(
			'publishedContent' => array(
				'url'           => get_permalink( $post ),
				'contributors'  => $this->get_contributor_data( $post ),
				'tags'          => wp_get_post_tags( $post->ID, array( 'fields' => 'slugs' ) ),
				'primaryTag'    => $primary_category,
			),
		);

		$jwt = $this->remote_sign_vc( $vc_data );
	}

	/**
	 * Get contributor (authors, editors, others in the future) data for given post
	 *
	 * @param object $post A WP_Post object.
	 * @return array List of data for each contributor on post.
	 */
	public function get_contributor_data( $post ) {
		$contributors = array();

		$authors = get_post_authors_data( $post->ID );

		if ( ! empty( $authors ) ) {
			foreach ( $authors as $author ) {
				$author_data = array(
					'role' => 'author',
					'name' => $author['display_name'],
				);

				$contributors[] = $author_data;
			}
		}

		$secondary_bylines = get_post_meta( $post->ID, 'secondary_bylines', true );
		if ( ! empty( $secondary_bylines ) ) {
			foreach ( $secondary_bylines as $byline ) {
				if ( empty( $byline['role'] ) || ( empty( $byline['custom_name'] ) && empty( $byline['id'] ) ) ) {
					continue;
				}

				$secondary_contributor = array( 'role' => $byline['role'] );

				if ( ! empty( $byline['id'] ) ) {
					$user = get_user_by( 'id', $byline['id'] );
					if ( $user instanceof \WP_User ) {
						$secondary_contributor['name'] = $user->display_name;
					} else if ( function_exists( 'get_coauthors' ) ) {
						$name = (string) get_post_meta( $byline['id'], 'cap-display_name', true );
						if ( empty( $name ) ) {
							continue;
						}
						$secondary_contributor['name'] = $name;
					} else {
						continue;
					}
				} else {
					$secondary_contributor['name'] = $byline['custom_name'];
				}

				$contributors[] = $secondary_contributor;
			}
		}

		return $contributors;
	}

	/**
	 * Send metadata to remote service to sign VC.
	 *
	 * @param array $data Associative array of metadata to put in VC body.
	 * @return string The encoded JWT.
	 */
	public function remote_sign_vc( $data ) {
		$args = array(
			'headers' => 'Content-Type: application/json',
			'body' => json_encode( $data ),
		);
		$res = wp_remote_post( DID_AGENT_BASE_URL . '/sign-vc', $args );
		$body = json_decode( $res['body'] );
		if ( $body && $body->data ) {
			return $body->data;
		}
	}
}

Post_VC_Gen::instance();
