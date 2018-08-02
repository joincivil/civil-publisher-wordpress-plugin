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
	$address = get_option( NEWSROOM_ADDRESS_OPTION_KEY );
	wp_enqueue_script(
		'civil-newsroom-protocol-post-panel',
		plugins_url( 'build/post-panel.build.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);

	$images = array(
		'metamask_confim_modal' => plugins_url( 'assets/images/img-metamask-modalconfirm.png', __FILE__ ),
		'metamask_logo' => plugins_url( 'assets/images/img-metamask-small@2x.png', __FILE__ ),
	);

	wp_localize_script( 'civil-newsroom-protocol-post-panel', 'civilImages', $images );

	wp_add_inline_script( 'civil-newsroom-protocol-post-panel', "window.civilNamespace = window.civilNamespace || {}; window.civilNamespace.newsroomAddress = \"${address}\";" . PHP_EOL, 'before' );
	// Prevent conflict between lodash required by civil packages and underscore used in Gutenberg, see https://github.com/WordPress/gutenberg/issues/4043#issuecomment-361049257.
	wp_add_inline_script( 'civil-newsroom-protocol-post-panel', 'window.lodash = _.noConflict();', 'after' );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_post_panel' );

/**
 * Add Civil admin menu and sub-menu items.
 */
function add_menus() {
	add_menu_page(
		__( 'Civil', 'civil' ),
		__( 'Civil', 'civil' ),
		'edit_posts',
		TOP_LEVEL_MENU
	);

	add_submenu_page(
		TOP_LEVEL_MENU,
		__( 'Newsroom Manager', 'civil' ),
		__( 'Newsroom Manager', 'civil' ),
		'manage_options',
		MANAGEMENT_PAGE,
		__NAMESPACE__ . '\newsroom_manager_content'
	);

	add_submenu_page(
		TOP_LEVEL_MENU,
		__( 'Wallet Addresses', 'civil' ),
		__( 'Wallet Addresses', 'civil' ),
		'edit_posts',
		WALLET_PAGE,
		__NAMESPACE__ . '\wallet_menu_content'
	);

	add_submenu_page(
		TOP_LEVEL_MENU,
		__( 'FAQ and Help', 'civil' ),
		__( 'FAQ and Help', 'civil' ),
		'edit_posts',
		HELP_PAGE,
		__NAMESPACE__ . '\help_menu_content'
	);

	// Remove unneeded "Civil" submenu.
	remove_submenu_page( TOP_LEVEL_MENU, TOP_LEVEL_MENU );
}
add_action( 'admin_menu', __NAMESPACE__ . '\add_menus' );

/**
 * Civil Newsroom Management page content.
 */
function newsroom_manager_content() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
	}
	require_once dirname( __FILE__ ) . '/newsroom-manager.php';
}

/**
 * Wallet Addresses page content.
 */
function wallet_menu_content() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
	}
	require_once dirname( __FILE__ ) . '/wallet-addresses.php';
}

/**
 * FAQ and Help page content.
 */
function help_menu_content() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
	}
	require_once dirname( __FILE__ ) . '/faq-help.php';
}

/**
 * Enqueue Civil Newsroom Management script.
 */
function contract_management_script() {
	$address = get_option( NEWSROOM_ADDRESS_OPTION_KEY );
	$txhash = get_option( NEWSROOM_TXHASH_OPTION_KEY );
	wp_enqueue_script(
		'civil-newsroom-protocol-newsroom-management',
		plugins_url( 'build/newsroom-management.build.js', __FILE__ ),
		// Need these deps in order to expose React and wp.apiRequest.
		array( 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);
	wp_add_inline_script( 'civil-newsroom-protocol-newsroom-management', "window.civilNamespace = window.civilNamespace || {}; window.civilNamespace.newsroomAddress = \"${address}\"; window.civilNamespace.newsroomTxHash = \"${txhash}\";" . PHP_EOL, 'after' );
}
add_action( 'admin_print_scripts-civil_page_' . MANAGEMENT_PAGE, __NAMESPACE__ . '\contract_management_script' );

/**
 * If necessary, alert user that they need to set up newsroom to use plugin.
 */
function newsroom_setup_nag() {
	// Don't show on newsroom manager page.
	$page_id = get_current_screen()->id;
	if ( 'civil_page_' . MANAGEMENT_PAGE == $page_id ) {
		return;
	}

	if ( current_user_can( 'manage_options' ) && empty( get_option( NEWSROOM_ADDRESS_OPTION_KEY ) ) ) {
		$management_page_url = menu_page_url( MANAGEMENT_PAGE, false );
		civil_notice_open();
		?>
		<h3><?php esc_html_e( 'Civil Newsroom Manager Installed!', 'civil' ); ?></h3>
		<p>
		<?php
			echo sprintf(
				wp_kses(
					/* translators: 1: Management page URL */
					__( 'Please take a few minutes to <a href="%1$s">create your Civil Newsroom contract</a> to start publishing your posts to the Ethereum blockchain.', 'civil' ),
					[ 'a' => [ 'href' => [] ] ]
				),
				esc_url( $management_page_url )
			);
		?>
		</p>
		<p class="civil-buttons-wrap">
			<a href="<?php echo esc_url( $management_page_url ); ?>" class="button button-primary"><?php esc_html_e( 'Set Up Newsroom', 'civil' ); ?></a>
			<a href="<?php echo esc_url( menu_page_url( 'TODO', false ) ); ?>" class="button"><?php esc_html_e( 'FAQ and Help', 'civil' ); ?></a>
		</p>
		<?php
		civil_notice_close();
	}
}
add_action( 'admin_notices', __NAMESPACE__ . '\newsroom_setup_nag' );

/**
 * If necessary, alert user that they need to fill in their ETH wallet address.
 */
function wallet_address_nag() {
	// Don't show on newsroom manager page.
	$page_id = get_current_screen()->id;
	if ( 'civil_page_' . MANAGEMENT_PAGE == $page_id ) {
		return;
	}

	// Don't show both newsroom setup nag and wallet address nag.
	if ( current_user_can( 'manage_options' ) && empty( get_option( NEWSROOM_ADDRESS_OPTION_KEY ) ) ) {
		return;
	}

	if ( current_user_can( 'edit_posts' ) && empty( get_user_meta( get_current_user_id(), USER_ETH_ADDRESS_META_KEY ) ) ) {
		$edit_profile_url = get_edit_user_link() . '#civil_newsroom_protocol_eth_wallet_address';
		civil_notice_open();
		?>
		<h3><?php esc_html_e( 'Civil Newsroom Manager', 'civil' ); ?></h3>
		<p>
		<?php
			echo sprintf(
				wp_kses(
					/* translators: 1: Edit profile URL */
					__( 'You need to <a href="%1$s">add your wallet address to your profile</a> before you can use your newsroom contract features.', 'civil' ),
					[ 'a' => [ 'href' => [] ] ]
				),
				esc_url( $edit_profile_url )
			);
		?>
		</p>
		<p class="civil-buttons-wrap">
			<a href="<?php echo esc_url( $edit_profile_url ); ?>" class="button button-primary"><?php esc_html_e( 'Add Wallet Address', 'civil' ); ?></a>
			<a href="<?php echo esc_url( menu_page_url( 'TODO', false ) ); ?>" class="button"><?php esc_html_e( 'FAQ and Help', 'civil' ); ?></a>
		</p>
		<?php
		civil_notice_close();
	}
}
add_action( 'admin_notices', __NAMESPACE__ . '\wallet_address_nag' );

/** TODO: Remove before deploy to production, but putting here now because it's messing with user tests. */
function no_vaultpress_notice() {
	echo '<style>
		#vp-notice {
			display: none;
		}
	</style>';
}
add_action( 'admin_head', __NAMESPACE__ . '\no_vaultpress_notice' );

/**
 * Output opening HTML for Civil admin notice.
 */
function civil_notice_open() {
	?>
	<style>
		.civil-notice {
			display: flex;
			align-items: center;
			height: 125px;
		}
		.civil-logo-wrap {
			display: table;
			height: calc(100% - 32px);
			margin-right: 15px;
			padding: 15px;
			background: black;
		}
		.civil-logo-wrap-inner {
			display: table-cell;
			vertical-align: middle;
		}
		.civil-notice h3 {
			margin: 8px 0;
		}
		p.civil-buttons-wrap {
			margin-top: 10px;
		}
		p.civil-buttons-wrap .button:last-child {
			margin-left: 8px;
		}
	</style>
	<div class="notice notice-error civil-notice">
		<div class="civil-logo-wrap">
			<div class="civil-logo-wrap-inner">
				<svg xmlns="http://www.w3.org/2000/svg" width="72" height="21" viewBox="0 0 72 21">
					<g fill="#ffffff">
						<path d="M.5 10c0-5.76 4.357-10 9.856-10 3.58 0 6.069 1.414 7.729 3.77L15.75 5.445c-1.297-1.728-2.905-2.67-5.499-2.67-3.838 0-6.64 3.089-6.64 7.225 0 4.24 2.853 7.225 6.744 7.225 2.49 0 4.357-.942 5.81-2.827L18.5 16.02C16.529 18.691 13.987 20 10.252 20 4.805 20 .5 15.76.5 10M22.5 20h3V1h-3zM29 1h3.382l5.782 13.228L43.782 1H47l-8.782 20h-.163zM50.5 20h3V1h-3zM59.5 1h3.175v16.344H71.5V20h-12z" />
					</g>
				</svg>
			</div>
		</div>
		<div class="civil-notice-body">
	<?php
}

/**
 * Output closing HTML for Civil admin notice.
 */
function civil_notice_close() {
	?>
		</div>
	</div>
	<?php
}
