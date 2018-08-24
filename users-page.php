<?php
/**
 * Handles added functionality to Users page.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * Enqueue script for Users page.
 */
function users_page_script() {
	if ( get_current_screen()->id !== 'users' ) {
		return;
	}

	wp_enqueue_script(
		'civil-newsroom-protocol-users-page-script',
		plugins_url( 'build/users-page.build.js', __FILE__ ),
		array( 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);
	constants_script( 'civil-newsroom-protocol-users-page-script' );
	lodash_no_conflict( 'civil-newsroom-protocol-users-page-script' );
}
add_action( 'admin_print_scripts', __NAMESPACE__ . '\users_page_script' );

/**
 * Add inline style to Users page.
 */
function users_page_styles() {
	?>
	<style>
		.column-civil_newsroom_protocol_newsroom_role .spinner {
			background: url(/wp-admin/images/wpspin_light.gif) no-repeat;
			visibility: visible;
			float: none;
			opacity: 0.25;
		}
		.column-civil_newsroom_protocol_eth_wallet_address {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.column-civil_newsroom_protocol_eth_wallet_address:hover {
			white-space: normal;
		}
	</style>
	<?php
}
add_action( 'admin_head-users.php', __NAMESPACE__ . '\users_page_styles' );

/**
 * Set up custom user columns.
 *
 * @param array $columns Array of column name => label.
 * @return array Desired columns.
 */
function user_columns( $columns ) {
	if ( get_option( NEWSROOM_ADDRESS_OPTION_KEY ) ) {
		$columns[ USER_NEWSROOM_ROLE_META_KEY ] = esc_html( 'Civil Role', 'civil' );
	}
	$columns[ USER_ETH_ADDRESS_META_KEY ] = esc_html( 'Wallet Address', 'civil' );
	return $columns;
}
add_filter( 'manage_users_columns', __NAMESPACE__ . '\user_columns' );

/**
 * Retrieve output for custom user columns.
 *
 * @param string $output Current output of custom column.
 * @param string $column_name Column name.
 * @param int    $user_id ID of currently-listed user.
 *
 * @return string Desired custom column output.
 */
function user_cells( $output, $column_name, $user_id ) {
	switch ( $column_name ) {
		case USER_NEWSROOM_ROLE_META_KEY:
			if ( ! get_option( NEWSROOM_ADDRESS_OPTION_KEY ) || ! get_the_author_meta( USER_ETH_ADDRESS_META_KEY, $user_id ) ) {
				return null;
			}

			if ( ! metadata_exists( 'user', $user_id, USER_NEWSROOM_ROLE_META_KEY ) ) {
				// Yet to have been loaded, so show spinner while frontend fetches role and saves to meta.
				return '<span class="spinner"></span>';
			}

			return get_the_author_meta( USER_NEWSROOM_ROLE_META_KEY, $user_id );
			break;

		case USER_ETH_ADDRESS_META_KEY:
			$address = get_the_author_meta( USER_ETH_ADDRESS_META_KEY, $user_id );
			if ( $address ) {
				return "<code>$address</code>";
			}
			break;

		default:
	}
	return $output;
}
add_filter( 'manage_users_custom_column', __NAMESPACE__ . '\user_cells', 10, 3 );
