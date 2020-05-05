<?php
/**
 * Miscellaneous utility functions.
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

/**
 * Check if old manager + post-panel functionality should be enabled.
 *
 * @return bool Whether or not it's enabled.
 */
function is_manager_enabled() {
	// Essentially disable for anyone who doesn't already have it set up.
	return ! empty( get_option( NEWSROOM_ADDRESS_OPTION_KEY ) );
}

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
	return apply_filters( 'civil_publisher_post_types', array( 'post', 'page' ) );
}

/**
 * Checks if the currently-logged-in-user can sign posts with the plugin.
 *
 * @return bool Whether or not they can sign.
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

	return array(
		'ID' => $data->ID,
		'display_name' => $data->display_name,
	);
}

/**
 * Gets subset of data (just ID and display name) about all post authors for this post.
 *
 * @param int $post_id Post ID.
 * @return array Data from WP_Users who are authors of the post - any co-authors-plus guest authors are dereferenced to their WP_Users.
 */
function get_post_authors_data( $post_id ) {
	$authors = array();
	if ( function_exists( 'get_coauthors' ) ) {
		$authors = get_coauthors( $post_id );
	} else {
		$post = get_post( $post_id );
		$author = get_user_by( 'id', $post->post_author );
		if ( ! empty( $author ) ) {
			$authors = array( $author );
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
			'civil-publisher-live-reload',
			'http://localhost:35729/livereload.js',
			array(),
			'1.0',
			true
		);
	}
}

/**
 * Insert a JS script to define constants to pass to frontend.
 *
 * @param string $script_name Name of dependency that will use these constants.
 */
function constants_script( $script_name ) {
	$constants_json = json_encode(
		array(
			'wpDebug' => WP_DEBUG,
			'newsroomAddress' => get_option( NEWSROOM_ADDRESS_OPTION_KEY ),
			'wpSiteUrl' => site_url(),
			'wpAdminUrl' => get_admin_url(),
			'logoUrl' => get_site_icon_url(),
			'adminEmail' => get_bloginfo( 'admin_email' ),
			'newsroomTxHash' => get_option( NEWSROOM_TXHASH_OPTION_KEY ),
			'networkName' => get_option( NETWORK_NAME_OPTION_KEY ),
		)
	);

	wp_add_inline_script( $script_name, "window.civilNamespace = $constants_json;" . PHP_EOL, 'before' );
}

/**
 * Checks if Gutenberg editor is enabled, either by plugin on old WP or by virtue of new WP.
 *
 * @return boolean Whether it's enabled.
 */
function is_gutenberg_enabled() {
	if ( is_gutenberg_disabled_by_classic_editor() ) {
		return false;
	}

	return is_plugin_active( 'gutenberg/gutenberg.php' ) || version_compare( get_bloginfo( 'version' ), '5.0', '>=' );
}

/**
 * Checks if Gutenberg editor is disabled by the standard Classic Editor plugin.
 *
 * @return boolean Whether it's disabled.
 */
function is_gutenberg_disabled_by_classic_editor() {
	if ( is_plugin_active( 'classic-editor/classic-editor.php' ) ) {
		if ( 'block' !== get_option( 'classic-editor-replace' ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Generates a UUID v4 value. Code via https://stackoverflow.com/a/15875555/458614.
 *
 * @throws \Exception If no suitable random bytes generator is available (pre-PHPv7 with neither openssl nor mcrypt).
 * @return string The UUID.
 */
function generate_uuid_v4() {
	if ( function_exists( 'random_bytes' ) ) {
		// PHP v7.
		$data = random_bytes( 16 );
	} else if ( function_exists( 'mcrypt_create_iv' ) ) {
		$data = mcrypt_create_iv( 16, MCRYPT_DEV_URANDOM );
	} else if ( function_exists( 'openssl_random_pseudo_bytes' ) ) {
		$data = openssl_random_pseudo_bytes( 16 );
	} else {
		// Extremely unlikely to have neither openssl or mcrypt enabled but theoretically possible.
		throw new \Exception( 'No suitable method for generating random bytes for UUID' );
	}

	$data[6] = chr( ord( $data[6] ) & 0x0f | 0x40 ); // set version to 0100.
	$data[8] = chr( ord( $data[8] ) & 0x3f | 0x80 ); // set bits 6-7 to 10.

	return vsprintf( '%s%s-%s-%s-%s-%s%s%s', str_split( bin2hex( $data ), 4 ) );
}
