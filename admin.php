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
		'civil-newsroom-protocol-post-panel',
		plugins_url( 'build/post-panel.build.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);

	// Prevent conflict between lodash required by civil packages and underscore used in Gutenberg, see https://github.com/WordPress/gutenberg/issues/4043#issuecomment-361049257.
	wp_add_inline_script( 'civil-newsroom-protocol-post-panel', 'window.lodash = _.noConflict();', 'after' );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_post_panel' );

/**
 * Add Civil Newsroom Management page.
 */
function contract_management_menu() {
	add_menu_page(
		__( 'Civil Newsroom Management', 'civil' ),
		__( 'Civil Newsroom Management', 'civil' ),
		'manage_options',
		MANAGEMENT_PAGE,
		__NAMESPACE__ . '\contract_management_menu_content'
	);
}
add_action( 'admin_menu', __NAMESPACE__ . '\contract_management_menu' );

/**
 * Civil Newsroom Management page content.
 */
function contract_management_menu_content() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Civil Newsroom Management', 'civil' ); ?></h1>
		<div id="civil-newsroom-management"></div>
	</div>
	<?php
}

/**
 * Enqueue Civil Newsroom Management script.
 */
function contract_management_script() {
	$address = get_option( NEWSROOM_ADDRESS_OPTION_KEY );
	wp_enqueue_script(
		'civil-newsroom-protocol-newsroom-management',
		plugins_url( 'build/newsroom-management.build.js', __FILE__ ),
		// Need these deps in order to expose React and wp.apiRequest.
		array( 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);
	wp_add_inline_script( 'civil-newsroom-protocol-newsroom-management', "window.civilNamespace = window.civilNamespace || {}; window.civilNamespace.newsroomAddress = \"${address}\";" . PHP_EOL, 'after' );
}
add_action( 'admin_print_scripts-toplevel_page_' . MANAGEMENT_PAGE, __NAMESPACE__ . '\contract_management_script' );

/**
 * If necessary, alert user that they need to set up newsroom to use plugin.
 */
function newsroom_setup_nag() {
	if ( current_user_can( 'manage_options' ) && empty( get_option( NEWSROOM_ADDRESS_OPTION_KEY ) ) ) {
		?>
		<div class="error notice">
			<p>
			<?php
				echo sprintf(
					wp_kses(
						/* translators: 1: Management page URL */
						__( 'You need to <a href="%1$s">set up your Civil Newsroom</a> before you can publish to the blockchain.', 'civil' ),
						[ 'a' => [ 'href' => [] ] ]
					),
					esc_url( menu_page_url( MANAGEMENT_PAGE, false ) )
				);
			?>
			</p>
		</div>
		<?php
	}
}
add_action( 'admin_notices', __NAMESPACE__ . '\newsroom_setup_nag' );
