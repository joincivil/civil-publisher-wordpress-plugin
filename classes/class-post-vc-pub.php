<?php
/**
 * Handles all logic related to generating and publishing VCs for posts.
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

/**
 * The Post_VC_Pub class.
 */
class Post_VC_Pub {
	use Singleton;

	/**
	 * Setup the class.
	 */
	public function setup() {
		add_action( 'save_post', array( $this, 'publish_vc' ), 11 );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
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
		if ( ! in_array( get_post_type( $post_id ), get_civil_post_types(), true ) ) {
			$should_gen = false;
		}

		/**
		 * Filters whether or not to publish a VC.
		 *
		 * @param bool $should_gen Should we publish VC?
		 * @param int  $post_id  The post ID.
		 */
		return apply_filters( 'civil_publisher_should_pub_vc', $should_gen, $post_id );
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

		$is_valid_nonce = isset( $_POST['civil_pub_vc_nonce'] ) && wp_verify_nonce( $_POST['civil_pub_vc_nonce'], 'civil_pub_vc_action' );
		if ( ! $is_valid_nonce || ! isset( $_POST[ PUB_VC_POST_KEY ] ) ) {
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

		$vc_log = get_option( VC_LOG_OPTION_KEY, '' );
		$vc_log .= "generating VC for post $post->ID\ndata: " . json_encode( $vc_data, JSON_UNESCAPED_SLASHES );

		try {
			$jwt = $this->remote_sign_vc( $vc_data );
			$vc_log .= "\nJWT: $jwt\n\n";
		} catch ( \Exception $e ) {
			$vc_log .= "\nFAILED: " . $e->getMessage() . "\n\n";
		}

		update_option( VC_LOG_OPTION_KEY, $vc_log );

		// @TODO/tobek Now actually publish the VC JWT somewhere
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
			'civil-pub-vc',
			__( 'VC Publishing', 'civil' ),
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

		if ( ! get_option( ASSIGNED_DID_OPTION_KEY ) ) {
			_e( 'Cannot publish VC: DID not initialized' );
		} else {
			wp_nonce_field( 'civil_pub_vc_action', 'civil_pub_vc_nonce' );
			?>
			<label>
				<input type="checkbox"
					id="<?php echo esc_attr( PUB_VC_POST_KEY ); ?>"
					name="<?php echo esc_attr( PUB_VC_POST_KEY ); ?>"
					value="true"
					<?php checked( $pub_vc, true ); ?>
				/>
				<?php
				if ( $is_new_post ) {
					_e( 'Publish VC', 'civil' );
				} else {
					// @TODO/tobek Once we're storing info about published VC, check it, and if none, change to "Publish"
					_e( 'Update VC', 'civil' );
				}
				?>
			</label>
		<?php } ?>

		<p><br /><a href="<?php echo esc_url( menu_page_url( DID_SETTINGS_PAGE, false ) ); ?>" target="_blank">Edit settings</a></p>
		<?php
	}
}

if ( get_option( DID_IS_ENABLED_OPTION_KEY ) ) {
	Post_VC_Pub::instance();
}
