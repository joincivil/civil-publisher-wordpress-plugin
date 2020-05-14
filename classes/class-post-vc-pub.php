<?php
/**
 * Handles all logic related to generating and publishing VCs for posts.
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

/**
 * The Post_VC_Pub class.
 */
class Post_VC_Pub {
	use Singleton;

	/**
	 * Setup the class.
	 */
	public function setup() {
		add_action( 'save_post', array( $this, 'publish_vc' ), 100 );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'template_redirect', array( $this, 'post_by_uuid' ) );
	}

	/**
	 * Checks if we should publish a VC for this post
	 *
	 * @param int $post_id The post ID.
	 * @return bool Whether or not to publish a VC.
	 */
	public function should_pub_vc( $post_id ) : bool {
		// Not initialized yet.
		if ( ! get_option( ASSIGNED_DID_OPTION_KEY ) ) {
			return false;
		}

		$should_gen = true;

		// Only publish VCs for supported post types.
		if ( ! in_array( get_post_type( $post_id ), get_plugin_post_types(), true ) ) {
			$should_gen = false;
		}

		/**
		 * Filters whether or not to publish a VC.
		 *
		 * @param bool $should_gen Should we publish VC?
		 * @param int  $post_id  The post ID.
		 */
		return apply_filters( 'consensys_vc_publisher_should_pub_vc', $should_gen, $post_id );
	}

	/**
	 * Publish a VC for this post.
	 *
	 * @param int $post_id The post ID.
	 */
	public function publish_vc( $post_id ) {
		$post = get_post( $post_id );

		if ( ! ( $post instanceof \WP_Post ) ) {
			return;
		} else if ( ! isset( $post->post_status ) || 'publish' != $post->post_status ) {
			return;
		} else if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		} else if ( ! $this->should_pub_vc( $post->ID ) ) {
			return;
		}

		$is_valid_nonce = isset( $_POST['consensys_pub_vc_nonce'] ) && wp_verify_nonce( $_POST['consensys_pub_vc_nonce'], 'consensys_pub_vc_action' );
		if ( ! $is_valid_nonce || ! isset( $_POST[ PUB_VC_POST_FLAG ] ) ) {
			return;
		}

		if ( ! get_post_meta( $post_id, POST_UUID_META_KEY, true ) ) {
			add_post_meta( $post_id, POST_UUID_META_KEY, generate_uuid_v4() );
		}

		$vc_data = $this->generate_vc_metadata( $post );

		$vc_log = get_option( VC_LOG_OPTION_KEY, '' );
		$vc_log .= "generating VC for post $post->ID\ndata: " . json_encode( $vc_data, JSON_UNESCAPED_SLASHES );

		try {
			$jwt = $this->remote_sign_vc( $vc_data );
			$vc_log .= "\nJWT: $jwt\n\n";
			update_post_meta( $post_id, LAST_VC_PUB_DATE_META_KEY, $post->post_modified_gmt );
		} catch ( \Exception $e ) {
			$vc_log .= "\nFAILED: " . $e->getMessage() . "\n\n";
		}

		update_option( VC_LOG_OPTION_KEY, $vc_log );

		// @TODO/tobek Now actually publish the VC JWT somewhere
	}

	/**
	 * Generate post metadata to go inside VC
	 *
	 * @param \WP_Post|int $post The post object.
	 * @return array Associative array of metadata.
	 */
	public function generate_vc_metadata( $post ) {
		$post = get_post( $post );

		$categories = wp_get_post_categories( $post->ID, array( 'fields' => 'slugs' ) );
		$tags = wp_get_post_tags( $post->ID, array( 'fields' => 'slugs' ) );
		$keywords = array_merge( $categories, $tags );

		$image_src = null;
		$thumbnail_id = get_post_thumbnail_id( $post->ID );
		if ( ! empty( $thumbnail_id ) ) {
			$image_src = wp_get_attachment_image_src( $thumbnail_id, 'full' );
			if ( is_array( $image_src ) ) {
				$image_src = $image_src[0];
			}
		}

		$revisions = wp_get_post_revisions( $post->ID );
		if ( ! empty( $revisions ) ) {
			$latest_revision = current( $revisions );
			$revision_post_id = $latest_revision->ID;
		}
		if ( ! $revision_post_id ) {
			$revision_post_id = $post->ID;
		}
		// Depending on settings for this WP install, and depending on what post fields were changed on the save, this might not be a new revision ID. However, if it is a pre-existing post, `add_post_meta` works here just fine to add an additional UUID to associate with this revision that we can use later to retrieve data about it.
		$revision_uuid = generate_uuid_v4();
		add_metadata( 'post', $revision_post_id, POST_UUID_META_KEY, $revision_uuid );

		return array(
			'publishedContent' => array(
				'identifier'        => get_post_meta( $post->ID, POST_UUID_META_KEY, true ),
				'versionIdentifier' => $revision_uuid,
				'headline'          => $post->post_title,
				'description'       => $post->post_excerpt,
				'url'               => get_permalink( $parent_post->ID ),
				'dateModified'      => $post->post_modified_gmt,
				'datePublished'     => $post->post_date_gmt,
				'publisher'         => $this->get_publisher_data(),
				'author'            => $this->get_author_data( $post ),
				'keywords'          => $keywords,
				'image'             => $image_src,
				'rawContentHash'    => $this->hash( $post->post_content ),
				'rawContentURL'     => site_url() . '?' . UUID_PERMALINK_QUERY . "=$revision_uuid&" . RAW_CONTENT_QUERY . '=true',
			),
		);
	}

	/**
	 * Get data about this site in schema.org Organization format.
	 *
	 * @return array Publisher data.
	 */
	public function get_publisher_data() {
		return array(
			'identifier' => get_option( ASSIGNED_DID_OPTION_KEY ),
			'name'       => get_bloginfo( 'name' ),
			'url'        => site_url(),
		);
	}

	/**
	 * Get author data for post in schema.org Person format.
	 *
	 * @param object $post A WP_Post object.
	 * @return array Author data.
	 */
	public function get_author_data( $post ) {
		$author_id = $post->post_author;
		return array(
			'identifier' => get_option( ASSIGNED_DID_OPTION_KEY ) . "#user-$author_id",
			'name'       => get_the_author_meta( 'display_name', $author_id ),
		);
	}

	/**
	 * Hash a string based on the `Keccak-256` hashing algorithm.
	 *
	 * @param  string $content The content to hash.
	 * @return string          The hashed content.
	 */
	public function hash( string $content ) {
		// Include the hashing library.
		require_once dirname( PLUGIN_FILE ) . '/lib/php-keccak/Keccak.php';

		return '0x' . \kornrunner\Keccak::hash( $content, '256' );
	}

	/**
	 * Send metadata to remote service to sign VC.
	 *
	 * @param array $data Associative array of metadata to put in VC body.
	 * @throws \Exception Error messages from sign VC request.
	 * @return string The encoded JWT.
	 */
	public function remote_sign_vc( $data ) {
		$args = array(
			'headers' => 'Content-Type: application/json',
			'body' => json_encode( $data ),
		);
		$res = wp_remote_post( get_option( DID_AGENT_BASE_URL_OPTION_KEY, DID_AGENT_BASE_URL_DEFAULT ) . '/sign-vc', $args );

		if ( is_wp_error( $res ) ) {
			throw new \Exception( 'error making sign VC request: ' . json_encode( $res ) );
		} else if ( 200 != $res['response']['code'] ) {
			throw new \Exception( 'error response from sign VC request: ' . $res['response']['code'] . ': ' . $res['response']['message'] );
		}

		$body = json_decode( $res['body'] );
		if ( $body && $body->data ) {
			return $body->data;
		} else {
			throw new \Exception( 'invalid response body from sign VC request: ' . $res['body'] );
		}
	}

	/**
	 * Set up meta box.
	 */
	public function add_meta_box() {
		add_meta_box(
			'consensys-pub-vc',
			__( 'ConsenSys VC Publishing', 'consensys' ),
			array( $this, 'meta_box_callback' ),
			null,
			'side'
		);
	}

	/**
	 * Output meta box.
	 *
	 * @param WP_Post $post Post object.
	 */
	public function meta_box_callback( $post ) {
		if ( ! $this->should_pub_vc( $post->ID ) ) {
			// Default to not publish VC but user can still manually enable.
			$pub_vc = false;
		} else {
			$screen = get_current_screen();
			$is_new_post = 'add' === $screen->action;
			if ( $is_new_post ) { // a new post as opposed to editing an existing post.
				$pub_vc = boolval( get_option( PUB_VC_BY_DEFAULT_ON_NEW_OPTION_KEY, PUB_VC_BY_DEFAULT_ON_NEW_DEFAULT ) );
			} else {
				$pub_vc = boolval( get_option( PUB_VC_BY_DEFAULT_ON_UPDATE_OPTION_KEY, PUB_VC_BY_DEFAULT_ON_UPDATE_DEFAULT ) );
			}
		}

		$last_pub_date = get_post_meta( $post->ID, LAST_VC_PUB_DATE_META_KEY, true );

		if ( ! get_option( ASSIGNED_DID_OPTION_KEY ) ) {
			_e( 'Cannot publish VC: DID not initialized' );
		} else {
			wp_nonce_field( 'consensys_pub_vc_action', 'consensys_pub_vc_nonce' );
			?>
			<p>
				<label>
					<input type="checkbox"
						id="<?php echo esc_attr( PUB_VC_POST_FLAG ); ?>"
						name="<?php echo esc_attr( PUB_VC_POST_FLAG ); ?>"
						value="true"
						<?php checked( $pub_vc, true ); ?>
					/>
					<?php
					if ( $is_new_post || ! $last_pub_date ) {
						_e( 'Publish VC', 'consensys' );
					} else {
						_e( 'Update VC', 'consensys' );
					}
					?>
				</label>
			</p>
			<?php
		}

		if ( $last_pub_date === $post->post_modified_gmt ) {
			?>
			<p>A VC has been published for the latest revision of this post.</p>
			<?php
		} else if ( $last_pub_date ) {
			$datetime = new \DateTime( $last_pub_date, new \DateTimeZone( 'UTC' ) );
			$datetime->setTimezone( get_site_timezone() );
			$time_string = $datetime->format( 'F j, Y g:ia T' );
			?>
			<p>A VC has not been published for the latest revision of this post. VC last published <?php echo esc_html( $time_string ); ?>.</p>
		<?php } else { ?>
			<p>No VC has been published for this post yet.</p>
		<?php } ?>


		<p><a href="<?php echo esc_url( menu_page_url( DID_SETTINGS_PAGE, false ) ); ?>" target="_blank">Edit settings</a></p>
		<?php
	}

	/**
	 * URL hook to redirect to (or get the content of) a post by UUID.
	 */
	public function post_by_uuid() {
		if ( ! empty( $_GET[ UUID_PERMALINK_QUERY ] ) ) {
			$uuid = $_GET[ UUID_PERMALINK_QUERY ];

			$posts = new \WP_Query(
				array(
					'post_type'        => array_merge( get_plugin_post_types(), array( 'revision' ) ),
					'posts_per_page'   => 1,
					'post_status'      => array( 'closed', 'published' ), // 'closed' in order to include revisions.
					'suppress_filters' => false,
					'meta_query'       => array( // WPCS: slow query ok.
						array(
							'key'   => POST_UUID_META_KEY,
							'value' => $uuid,
						),
					),
				)
			);

			if ( empty( $posts->posts[0] ) || ! ( $posts->posts[0] instanceof \WP_Post ) ) {
				status_header( 404 );
				echo esc_html( "No post or post version found with UUID $uuid. Note that, if this is a version UUID, this site may not be configured to store old revisions of posts." );
				exit();
			}

			$post = $posts->posts[0];
			if ( ! empty( $_GET[ RAW_CONTENT_QUERY ] ) && $_GET[ RAW_CONTENT_QUERY ] ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $post->post_content;
				exit();
			} else {
				wp_redirect( get_permalink( wp_is_post_revision( $post->ID ) ? $post->post_parent : $post ), 302 );
				exit();
			}
		}
	}
}

if ( get_option( DID_IS_ENABLED_OPTION_KEY ) ) {
	Post_VC_Pub::instance();
}
