<?php
/**
 * Miscellaneous utility functions.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * Gets the blockchain enabled post types.
 *
 * @return array The supported post types.
 */
function get_blockchain_post_types() {
	/**
	 * Filters the post types available for blockchain support
	 *
	 * @param $post_types The supported post types.
	 */
	return apply_filters( 'get_blockchain_post_types', [ 'post' ] );
}

/**
 * Check if given string is a valid hex ETH wallet address.
 *
 * @param string $addr Address to check.
 * @return bool  Whether or not address is valid hex ETH wallet address.
 */
function is_valid_eth_address( $addr ) {
	return preg_match( '/^(0x)?[0-9a-f]{40}$/i', $addr );
}


/**
 * Check if given string is a valid hex ETH transaction hash.
 *
 * @param string $hash hash to check.
 * @return bool  Whether or not address is valid hex ETH wallet address.
 */
function is_valid_txhash( $hash ) {
	return preg_match( '/^(0x)?[0-9a-f]{64}$/i', $hash );
}

/**
 * Gets subset of WP user data (just ID and display name) from WP_User, or data from WP_User that's linked to coauthors-plus guest author
 *
 * @param object $user A WP_User object or coauthors-plus author object.
 * @return object Data from WP_User object, but any display name set in guest author overrides regular user display name.
 */
function get_user_data( $user ) {
	$data = null;

	if ( ! empty( $user->linked_account ) ) {
		// From co-authors plus.
		$actual_user = get_user_by( 'login', $user->linked_account );
		// TODO See if we can get guest author avatar from here (it's not in the guest user object though)
		if ( ! empty( $actual_user ) ) {
			$data = $actual_user->data;
			if ( ! empty( $user->display_name ) ) {
				// Guest author profile had its own display name, let's prefer that.
				$data->display_name = $user->display_name;
			}
		}
	}

	if ( ! $data ) {
		$data = $user->data;
	}

	return [
		'ID' => $data->ID,
		'display_name' => $data->display_name,
	];
}

/**
 * Gets subset of data (just ID and display name) about post authors.
 *
 * @param int $post_id Post ID.
 * @return array Data from WP_Users who are authors of the post - any coauthors-plus guest authors are dereferenced to their WP_Users.
 */
function get_post_authors_data( $post_id ) {
	$authors = [];
	if ( function_exists( 'get_coauthors' ) ) {
		$authors = get_coauthors( $post_id );
	} else {
		// Support absence of co-authors-plus plugin.
		$post = get_post( $post_id );
		$author = get_user_by( 'id', $post->post_author );
		if ( ! empty( $author ) ) {
			$authors[] = $author;
		}
	}
	return array_map( __NAMESPACE__ . '\get_user_data', $authors );
}
