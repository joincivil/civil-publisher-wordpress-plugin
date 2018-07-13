<?php
/**
 * Handles added functionality to Users page.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * Add inline style to Users page.
 */
function users_page_styles() {
	?>
	<style>
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
