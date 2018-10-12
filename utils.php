<?php
/**
 * Miscellaneous utility functions.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * Gets the post types for which to support publishing on Civil.
 *
 * @return array The supported post types.
 */
function get_civil_post_types() {
	/**
	 * Filters the post types available for blockchain support
	 *
	 * @param $post_types The supported post types.
	 */
	return apply_filters( 'civil_newsroom_post_types', [ 'post', 'page' ] );
}

/**
 * Checks if the currently-logged-in-user can sign posts with the plugin.
 *
 * @return bool Whether or not tthey can sign.
 */
function current_user_can_sign_posts() {
	// If user can't edit published posts, then they can't sign any updates to their posts, so rather than let them sign drafts and have invalid (and removed) signature on anly published updates, don't let them sign at all (until we have some way to add signatures outside of the edit post context).
	return current_user_can( 'edit_published_posts' );
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
 * Gets subset of WP user data (just ID and display name) from given WP_User, or data from WP_User that's linked to given co-authors-plus guest author.
 *
 * @param object $user A WP_User object or co-authors-plus author object.
 * @return array Associative array of data from WP_User object, but any display name set in guest author overrides regular user display name.
 */
function get_user_data( $user ) {
	$data = null;

	if ( ! empty( $user->linked_account ) ) {
		// From co-authors plus.
		$actual_user = get_user_by( 'login', $user->linked_account );
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
 * Gets subset of data (just ID and display name) about all post authors for this post.
 *
 * @param int $post_id Post ID.
 * @return array Data from WP_Users who are authors of the post - any co-authors-plus guest authors are dereferenced to their WP_Users.
 */
function get_post_authors_data( $post_id ) {
	$authors = [];
	if ( function_exists( 'get_coauthors' ) ) {
		$authors = get_coauthors( $post_id );
	} else {
		$post = get_post( $post_id );
		$author = get_user_by( 'id', $post->post_author );
		if ( ! empty( $author ) ) {
			$authors = [ $author ];
		}
	}
	return array_map( __NAMESPACE__ . '\get_user_data', $authors );
}

/**
 * Scripts used for all our plugin scripts.
 *
 * @param string $script_name Name of dependency that will use these constants.
 */
function common_scripts( $script_name ) {
	constants_script( $script_name );

	if ( WP_DEBUG ) {
		wp_enqueue_script(
			'civil-newsroom-protocol-live-reload',
			'http://localhost:35729/livereload.js'
		);
	}
}

/**
 * Insert a JS script to define constants to pass to frontend.
 *
 * @param string $script_name Name of dependency that will use these constants.
 */
function constants_script( $script_name ) {
	$constants_json = json_encode( [
		'newsroomAddress' => get_option( NEWSROOM_ADDRESS_OPTION_KEY ),
		'wpSiteUrl' => site_url(),
		'wpAdminUrl' => get_admin_url(),
		'newsroomTxHash' => get_option( NEWSROOM_TXHASH_OPTION_KEY ),
	] );

	wp_add_inline_script( $script_name, "window.civilNamespace = $constants_json;" . PHP_EOL, 'before' );
}
