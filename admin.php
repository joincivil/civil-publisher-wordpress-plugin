<?php
/**
 * Handles hooks and enqueueing for admin page and Gutenberg plugin scripts
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * Enqueue Gutenberg editor plugin script.
 */
function enqueue_post_panel() {
	wp_enqueue_script(
		'civil-post-panel',
		plugins_url( 'build/post-panel.build.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);

	// Prevent conflict between lodash required by civil packages and underscore used in Gutenberg, see https://github.com/WordPress/gutenberg/issues/4043#issuecomment-361049257.
	wp_add_inline_script( 'civil-post-panel', 'window.lodash = _.noConflict();', 'after' );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_post_panel' );

/**
 * Add Tools > Newsroom Contract Management page.
 */
function contract_management_menu() {
	add_management_page(
		__( 'Newsroom Contract Management', 'civil' ),
		__( 'Newsroom Contract Management', 'civil' ),
		'manage_options',
		'newsroom-contract-management',
		__NAMESPACE__ . '\contract_management_menu_content'
	);
}
add_action( 'admin_menu', __NAMESPACE__ . '\contract_management_menu' );

/**
 * Tools > Newsroom Contract Management page content.
 */
function contract_management_menu_content() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Newsroom Contract Management', 'civil' ); ?></h1>
		<div id="civil-newsroom-management"></div>
	</div>
	<?php
}

/**
 * Enqueue Tools > Newsroom Contract Management script.
 */
function contract_management_script() {
	$address = get_option( NEWSROOM_ADDRESS_OPTION_KEY );
	wp_enqueue_script(
		'civil-blockchain-newsroom-management',
		plugins_url( 'build/newsroom-management.build.js', __FILE__ ),
		// Need these deps in order to expose React and wp.apiRequest.
		array( 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);
	wp_add_inline_script( 'civil-blockchain-newsroom-management', "window.civilNamespace = window.civilNamespace || {}; window.civilNamespace.newsroomAddress = \"${address}\";" . PHP_EOL, 'after' );
}
add_action( 'admin_print_scripts-tools_page_newsroom-contract-management', __NAMESPACE__ . '\contract_management_script' );
