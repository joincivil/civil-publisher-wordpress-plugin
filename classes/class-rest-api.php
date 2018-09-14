<?php
/**
 * Hanldes all logic related to the REST API.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * The REST_API class.
 */
class REST_API {
	use Singleton;

	/**
	 * Setup the class.
	 */
	public function setup() {
		add_action( 'rest_api_init', [ $this, 'register_endpoint' ] );
	}

	/**
	 * Register endpoints.
	 */
	public function register_endpoint() {
		// Endpoint for returning revision payload.
		register_rest_route(
			REST_API_NAMESPACE,
			'/revisions/(?P<revisionID>\d+)',
			[
				'methods'  => 'GET',
				'callback' => [ $this, 'get_revision_payload' ],
			]
		);

		// Endpoint for returning revision content based on hash value.
		register_rest_route(
			REST_API_NAMESPACE,
			'/revisions-content/(?P<hash>\w+)',
			[
				'methods'  => 'GET',
				'callback' => [ $this, 'get_revision_content_from_hash' ],
			]
		);

		// Endpoint for fetching user by given ETH address.
		register_rest_route(
			REST_API_NAMESPACE,
			'/user-by-eth-address/(?P<address>\w+)',
			[
				'methods'  => 'GET',
				'callback' => [ $this, 'get_user_by_eth_address' ],
			]
		);
	}

	/**
	 * Returns revision payload which is used by the smart contract system.
	 *
	 * @param \WP_REST_Request $request The current REST API request.
	 * @return \WP_REST_Response|\WP_Error The REST API response or an error.
	 */
	public function get_revision_payload( \WP_REST_Request $request ) {
		// Get parameters from request.
		$params = $request->get_params();

		// Get the revision ID.
		$revision_id = $params['revisionID'] ?? 0;

		// No revision ID provided.
		if ( empty( $revision_id ) ) {
			return new \WP_Error(
				'no-revision-id-found',
				esc_html__( 'No revision ID provided.' ),
				[
					'status' => 400,
				]
			);
		}

		// Get the revision.
		$revision = get_post( $revision_id );

		// Unable to find a revision.
		if ( ! ( $revision instanceof \WP_Post ) ) {
			return new \WP_Error(
				'no-post-found',
				esc_html__( 'No post found matching the provided revision ID.' ),
				[
					'status' => 400,
				]
			);
		}

		// Only return published revisions.
		if ( ! Post_Hashing::instance()->can_save_hash( $revision->post_parent ) ) {
			return new \WP_Error(
				'post-not-published',
				esc_html__( 'This post revision is not publiushed.' ),
				[
					'status' => 400,
				]
			);
		}

		return rest_ensure_response( $this->clean_item( $revision ) );
	}

	/**
	 * Returns the post revision content, given a hash value.
	 *
	 * @param \WP_REST_Request $request The current REST API request.
	 * @return \WP_REST_Response|\WP_Error The REST API response or an error.
	 */
	public function get_revision_content_from_hash( \WP_REST_Request $request ) {
		// Get parameters from request.
		$params = $request->get_params();

		// Get the hash.
		$hash = $params['hash'];

		// No hash provided.
		if ( empty( $hash ) ) {
			return new \WP_Error(
				'no-hash-found',
				esc_html__( 'No hash provided.' ),
				[
					'status' => 400,
				]
			);
		}

		// Get a the post with the hash.
		$posts = new \WP_Query(
			[
				'post_type'        => [ 'revision' ],
				'post_status'      => 'closed',
				'posts_per_page'   => 1,
				'ignore_sticky'    => true,
				'suppress_filters' => false,
				'meta_query'       => [ // WPCS: slow query ok.
					[
						'key'   => REVISION_HASH_META_KEY,
						'value' => $hash,
					],
				],
			]
		);

		// No post found.
		if ( empty( $posts->posts[0] ) || ! ( $posts->posts[0] instanceof \WP_Post ) ) {
			return new \WP_Error(
				'no-post-found',
				esc_html__( 'No post found matching the provided hash.' ),
				[
					'status' => 400,
				]
			);
		}

		return rest_ensure_response( $posts->posts[0]->post_content );
	}

	/**
	 * Returns user data (just ID, login, name) by given ETH wallet address
	 *
	 * @param \WP_REST_Request $request The current REST API request.
	 * @return \WP_REST_Response|\WP_Error The REST API response or an error.
	 */
	public function get_user_by_eth_address( \WP_REST_Request $request ) {
		$params = $request->get_params();
		$address = $params['address'];

		if ( empty( $address ) ) {
			return new \WP_Error(
				'no-address-found',
				esc_html__( 'No ETH address provided.' ),
				[
					'status' => 400,
				]
			);
		}

		$users = get_users(
			[
				'meta_key' => USER_ETH_ADDRESS_META_KEY,
				'meta_value' => $address,
			]
		);

		if ( empty( $users[0] ) || ! ( $users[0] instanceof \WP_User ) ) {
			return new \WP_Error(
				'no-user-found',
				esc_html__( 'No user found with given address.' ),
				[
					'status' => 400,
				]
			);
		}

		return rest_ensure_response(
			[
				'ID' => $users[0]->data->ID,
				'user_login' => $users[0]->data->user_login,
				'display_name' => $users[0]->data->display_name,
			]
		);
	}

	/**
	 * Cleans a post object to be sent back to the blockchain hash endpoint.
	 *
	 * @param \WP_Post|int $post The post object.
	 * @return array The cleaned post object.
	 */
	public function clean_item( $post ) {
		$post = get_post( $post );

		// No post found.
		if ( ! ( $post instanceof \WP_Post ) ) {
			return [];
		}

		// Get the parent post.
		$parent_post = get_post( $post->post_parent );

		// No parent post found.
		if ( ! ( $parent_post instanceof \WP_Post ) ) {
			return [];
		}

		// Get the JSON payload data.
		$json_payload_data = get_post_meta( $post->ID, REVISION_DATA_META_KEY, true );
		$revision_hash     = get_post_meta( $post->ID, REVISION_HASH_META_KEY, true );

		// Format the revision data.
		return [
			'title'                 => $post->post_title,
			'revisionContentHash'   => $revision_hash,
			'revisionContentUrl'    => home_url( '/wp-json/' . REST_API_NAMESPACE . '/revisions-content/' . $revision_hash . '/' ),
			'canonicalUrl'          => get_permalink( $parent_post->ID ),
			'slug'                  => $parent_post->post_name,
			'description'           => $post->post_excerpt,
			'authors'               => $json_payload_data['authors'] ?? [],
			'images'                => $json_payload_data['images'] ?? [],
			'tags'                  => $json_payload_data['tags'] ?? [],
			'primaryTag'            => $json_payload_data['primaryTag'] ?? '',
			'revisionDate'          => $post->post_date_gmt,
			'originalPublishDate'   => $parent_post->post_date_gmt,
			'credibilityIndicators' => $json_payload_data['credibilityIndicators'] ?? [],
			'opinion'               => false,
			'civilSchemaVersion'    => SCHEMA_VERSION,
		];
	}
}

REST_API::instance();
