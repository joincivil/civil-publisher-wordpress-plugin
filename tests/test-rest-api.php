<?php

class CivilRestApiTest extends CivilTestCase {

	/**
	 * The revisions REST API expected attributes order.
	 *
	 * @var array
	 */
	private $_expected_revision_attributes_order = [
		'title'                 => '',
		'revisionContentHash'   => '',
		'revisionContentUrl'    => '',
		'canonicalUrl'          => '',
		'slug'                  => '',
		'description'           => '',
		'authors'               => '',
		'images'                => '',
		'tags'                  => '',
		'primaryTag'            => '',
		'revisionDate'          => '',
		'originalPublishDate'   => '',
		'credibilityIndicators' => '',
		'opinion'               => '',
		'civilSchemaVersion'    => '',
	];

	/**
	 * Setup the class.
	 */
	public function setUp() {
		parent::setUp();

		/** @var WP_REST_Server $wp_rest_server */
		global $wp_rest_server;
		$this->server = $wp_rest_server = new Spy_REST_Server();
		do_action( 'rest_api_init' );
	}

	/**
	 * Tear down the class.
	 */
	public function tearDown() {
		parent::tearDown();

		/** @var WP_REST_Server $wp_rest_server */
		global $wp_rest_server;
		$wp_rest_server = null;
	}

	/**
	 * Test revisions rest api returns proper post data.
	 */
	function test_rest_api() {
		// Create test content.
		$test_content = rand_str();

		// Create a post.
		$post_id = self::factory()->post->create( [
			'post_content' => $test_content,
			'post_status' => 'draft',
		] );

		// Add a revision.
		wp_update_post( [
			'ID' => $post_id,
			'post_content' => 'revision 1',
		] );

		// Get the revisions.
		$revisions = wp_get_post_revisions( $post_id );

		$request = new WP_REST_Request( 'GET', '/' . \Civil_Newsroom_Protocol\REST_API_NAMESPACE . '/revisions/' . $this->get_latest_post_revision_id( $post_id ) );
		$response = $this->server->dispatch( $request );

		// Drafts are allowed to be hashed.
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( get_the_title( $post_id ), $response->get_data()['title'] );

		// Update post status.
		wp_update_post( [
			'ID' => $post_id,
			'post_status' => 'publish',
			'post_content' => 'revision 2',
		] );

		$request = new WP_REST_Request( 'GET', '/' . \Civil_Newsroom_Protocol\REST_API_NAMESPACE . '/revisions/' . $this->get_latest_post_revision_id( $post_id ) );
		$response = $this->server->dispatch( $request );

		// Check that we have a success status and the hash matches.
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( get_the_title( $post_id ), $response->get_data()['title'] );
	}

	/**
	 * Tests that the revisions REST API meta data is in the correct order.
	 */
	function test_rest_api_revision_attributes_order() {
		// Create test content.
		$test_content = rand_str();

		// Create a post.
		$post_id = self::factory()->post->create( [
			'post_content' => $test_content,
			'post_status' => 'publish',
		] );

		// Add a revision.
		wp_update_post( [
			'ID' => $post_id,
			'post_content' => 'revision 1',
		] );

		$request = new WP_REST_Request( 'GET', '/' . \Civil_Newsroom_Protocol\REST_API_NAMESPACE . '/revisions/' . $this->get_latest_post_revision_id( $post_id ) );
		$response = $this->server->dispatch( $request );

		// Check status.
		$this->assertEquals( 200, $response->get_status() );

		// Ensure there are no removed or extra elements.
		$this->assertEmpty( array_diff_key( $this->_expected_revision_attributes_order, $response->get_data() ) );

		// Check order.
		$index = 0;
		foreach ( array_keys( $response->get_data() ) as $key ) {
			$this->assertEquals( array_keys( $this->_expected_revision_attributes_order )[ $index ], $key );
			$index++;
		}
	}
}
