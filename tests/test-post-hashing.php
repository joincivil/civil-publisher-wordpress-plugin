<?php

class CivilPostHashingTest extends CivilTestCase {

	/**
	 * Tests for the hashing of post content.
	 */
	function test_post_hashing() {
		// Create test content.
		$test_content = rand_str();

		// Get the test content hash.
		$expected_hash = \Civil_Newsroom_Protocol\Post_Hashing::instance()->hash( $test_content );

		// Create a post.
		$post_id = self::factory()->post->create( [
			'post_content' => 'revision 1',
		] );

		// Add a revision.
		wp_update_post( [
			'ID' => $post_id,
			'post_content' => $test_content,
		] );

		$this->assertEquals( $expected_hash, get_metadata( 'post', $this->get_latest_post_revision_id( $post_id ), \Civil_Newsroom_Protocol\REVISION_HASH_META_KEY, true ) );
	}

	/**
	 * Tests for the deletion of post revisions when a post is published.
	 */
	function test_purge_revisions() {
		// Create a post.
		$post_id = self::factory()->post->create( [
			'post_status' => 'draft',
		] );

		// Add multiple revisions.
		$revision_count = 5;
		for ( $i = 0; $i < 5; $i++ ) {
			wp_update_post( [
				'ID' => $post_id,
				'post_content' => rand_str(),
			] );
		}

		// Ensure there are 5 revisions for this post.
		$this->assertEquals( $revision_count, count( wp_get_post_revisions( $post_id ) ) );

		// Send post to pending and ensure revisions are kept.
		wp_update_post( [
			'ID' => $post_id,
			'post_status' => 'pending',
		] );
		$this->assertEquals( $revision_count + 1, count( wp_get_post_revisions( $post_id ) ) );

		$post_revisions = wp_get_post_revisions( $post_id );

		// Publish the post.
		wp_update_post( [
			'ID' => $post_id,
			'post_status' => 'publish',
		] );

		// Ensure there is only a single revision.
		$this->assertEquals( 1, count( wp_get_post_revisions( $post_id ) ) );

		// Ensure all post metadata for the revisions are deleted.
		foreach ( $post_revisions as $post_revision ) {
			$this->assertEmpty( get_post_meta( $post_revision->ID ) );
		}
	}
}
