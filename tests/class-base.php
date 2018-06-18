<?php
/**
 * Class CivilTestCase
 *
 * The base Civil Newsroom phpunit test class.
 *
 * @package Civil_Newsroom_Protocol
 */
class CivilTestCase extends WP_UnitTestCase {
	/**
	 * Returns the latest post revision ID.
	 *
	 * @param int $post_id The parent post ID.
	 * @return int The latest revision ID.
	 */
	public function get_latest_post_revision_id( $post_id ) {
		$revisions = wp_get_post_revisions( $post_id );

		if ( empty( $revisions ) ) {
			return 0;
		}

		// This array is not indexed at 0 so we need to get the last element in the array.
		return array_pop( $revisions )->ID;
	}
}
