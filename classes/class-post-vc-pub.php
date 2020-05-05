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
		add_action( 'save_post', array( $this, 'publish_vc' ), 100 );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'template_redirect', array( $this, 'post_uuid_redirect' ) );
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

		$primary_category    = '';
		$primary_category_id = get_post_meta( $post->ID, 'primary_category_id', true );

		if ( ! empty( $primary_category_id ) ) {
			$primary_category_term = get_term_by( 'id', $primary_category_id, 'category' );

			if ( $primary_category_term instanceof \WP_Term ) {
				$primary_category = $primary_category_term->slug;
			}
		}

		$revision_content_hash = $this->hash( $post->post_content );

		$post_uuid = get_post_meta( $post->ID, POST_UUID_META_KEY, true );
		$site_url = site_url();
		if ( false === strpos( $site_url, '?' ) ) {
			$uuid_url = "$site_url?" . UUID_PERMALINK_QUERY . "=$post_uuid";
		} else {
			$uuid_url = "$site_url&" . UUID_PERMALINK_QUERY . "=$post_uuid";
		}

		return array(
			'publishedContent' => array(
				'title'               => $post->post_title,
				'canonicalUrl'        => get_permalink( $parent_post->ID ),
				'slug'                => $post->post_name,
				'description'         => $post->post_excerpt,
				'contributors'        => $this->get_contributor_data( $post ),
				'tags'                => wp_get_post_tags( $post->ID, array( 'fields' => 'slugs' ) ),
				'primaryTag'          => $primary_category,
				'revisionDate'        => $post->post_modified_gmt,
				'originalPublishDate' => $post->post_date_gmt,
				'revisionContentHash' => $revision_content_hash,
				'uuidUrl'             => $uuid_url,
				'postUuid'            => $post_uuid,
				'revisionUuid'        => generate_uuid_v4(),
			),
		);
	}

	/**
	 * Get contributor names for given post. Supports Coauthors Plus plugin.
	 *
	 * @param object $post A WP_Post object.
	 * @return array List of display names for each contributor on post.
	 */
	public function get_contributor_data( $post ) {
		$contributors = array();

		$authors = get_post_authors_data( $post->ID );

		if ( ! empty( $authors ) ) {
			foreach ( $authors as $author ) {
				$contributors[] = $author['display_name'];
			}
		}

		return $contributors;
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

		$last_pub_date = get_post_meta( $post->ID, LAST_VC_PUB_DATE_META_KEY, true );

		if ( ! get_option( ASSIGNED_DID_OPTION_KEY ) ) {
			_e( 'Cannot publish VC: DID not initialized' );
		} else {
			wp_nonce_field( 'civil_pub_vc_action', 'civil_pub_vc_nonce' );
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
						_e( 'Publish VC', 'civil' );
					} else {
						_e( 'Update VC', 'civil' );
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
	 * Redirect to the post given a UUID.
	 */
	public function post_uuid_redirect() {
		if ( ! empty( $_GET[ UUID_PERMALINK_QUERY ] ) ) {
			$uuid = $_GET[ UUID_PERMALINK_QUERY ];

			$posts = new \WP_Query(
				array(
					'posts_per_page'   => 1,
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
				// Most WP installs limit the number of revisions stored so storing revision UUID as post revision meta would be brittle. Other option would be to store an array of revision IDs as meta on the post itself, but that would be an awkward and slow post query to lookup. Unless this feature is needed, will leave unimplemented for now.
				echo esc_html( "No post found with UUID $uuid. Note that retrieval of posts by revision UUID is not currently supported: please use post UUID." );
				exit();
			}

			wp_redirect( get_permalink( $posts->posts[0] ), 302 );
			exit();
		}
	}
}

if ( get_option( DID_IS_ENABLED_OPTION_KEY ) ) {
	Post_VC_Pub::instance();
}
