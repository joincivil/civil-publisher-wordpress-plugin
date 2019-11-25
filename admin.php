<?php
/**
 * Handles hooks and enqueueing for admin page and Gutenberg plugin scripts
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

/**
 * Enqueue Gutenberg editor plugin script.
 */
function enqueue_post_panel() {
	if ( ! current_user_can_sign_posts() || ! in_array( get_post_type(), get_civil_post_types(), true ) ) {
		return;
	}

	wp_enqueue_script(
		'civil-publisher-post-panel',
		plugins_url( 'build/post-panel.build.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);

	common_scripts( 'civil-publisher-post-panel' );
}
if ( is_manager_enabled() ) {
	add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_post_panel' );
}

/**
 * Add Civil admin menu and sub-menu items.
 */
function add_menus() {
	add_menu_page(
		__( 'Civil', 'civil' ),
		__( 'Civil', 'civil' ),
		'edit_posts',
		TOP_LEVEL_MENU,
		null,
		'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjAgMjAiIHdpZHRoPSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGRlZnM+PHBhdGggaWQ9ImEiIGQ9Im02LjEwMjIxNjMyIDIuMjI4NTcxNDNoNy43OTU1NjczOGMxLjQyNjQzIDAgMS45NDM2ODc5LjE0ODUyMDk4IDIuNDY1MTY5NC40Mjc0MTIzMi41MjE0ODE1LjI3ODg5MTM1LjkzMDc0MzIuNjg4MTUzMDcgMS4yMDk2MzQ2IDEuMjA5NjM0NTUuMjc4ODkxMy41MjE0ODE0OC40Mjc0MTIzIDEuMDM4NzM5NDYuNDI3NDEyMyAyLjQ2NTE2OTQ1djcuNzk1NTY3MzVjMCAxLjQyNjQzLS4xNDg1MjEgMS45NDM2ODgtLjQyNzQxMjMgMi40NjUxNjk1LS4yNzg4OTE0LjUyMTQ4MTQtLjY4ODE1MzEuOTMwNzQzMi0xLjIwOTYzNDYgMS4yMDk2MzQ1LS41MjE0ODE1LjI3ODg5MTQtMS4wMzg3Mzk0LjQyNzQxMjMtMi40NjUxNjk0LjQyNzQxMjNoLTcuNzk1NTY3MzhjLTEuNDI2NDI5OTggMC0xLjk0MzY4Nzk2LS4xNDg1MjA5LTIuNDY1MTY5NDUtLjQyNzQxMjMtLjUyMTQ4MTQ4LS4yNzg4OTEzLS45MzA3NDMyLS42ODgxNTMxLTEuMjA5NjM0NTQtMS4yMDk2MzQ1LS4yNzg4OTEzNS0uNTIxNDgxNS0uNDI3NDEyMzMtMS4wMzg3Mzk1LS40Mjc0MTIzMy0yLjQ2NTE2OTV2LTcuNzk1NTY3MzVjMC0xLjQyNjQyOTk5LjE0ODUyMDk4LTEuOTQzNjg3OTcuNDI3NDEyMzMtMi40NjUxNjk0NS4yNzg4OTEzNC0uNTIxNDgxNDguNjg4MTUzMDYtLjkzMDc0MzIgMS4yMDk2MzQ1NC0xLjIwOTYzNDU1LjUyMTQ4MTQ5LS4yNzg4OTEzNCAxLjAzODczOTQ3LS40Mjc0MTIzMiAyLjQ2NTE2OTQ1LS40Mjc0MTIzMnptLS42ODY4MjAyNSA3Ljk5OTk5OTk3YzAgMi43NTU1NzYgMi4wNTM3MzA0NiA0Ljg0NTcxNDMgNC43MTE4NDc5MyA0Ljg0NTcxNDMgMS43NTYzNDM5IDAgMy4wMDgxMzE1LS42MTYzNDA0IDMuOTc0MDczMS0xLjkzMDg2NzFsLjE2NjM1ODctLjIyNjM5MzYtMS41MDc1NTAxLTEuMDUzMDU5NS0uMTU5NjU0MS4yMDgxNDA1Yy0uNjE2MTkwMS44MDMzMjQ4LTEuMzkwMTE5MyAxLjE4NTA5NjctMi40MjYwMTk1IDEuMTg1MDk2Ny0xLjYyNTQ4NTQ5IDAtMi43OTQyNDEzMy0xLjI0OTE2MTctMi43OTQyNDEzMy0zLjAyODYzMTMgMC0xLjc1MTI5NTQ3IDEuMTYzNzk5NzctMy4wMjg2MzEyNCAyLjc0NzAzMzIzLTMuMDI4NjMxMjQgMS4wMzY5NzYxIDAgMS43MDkwMTQyLjM0MzIwNTYzIDIuMjgyMjk4NSAxLjExMDUyNDU3bC4xNjE0MDkyLjIxNjA0MDAyIDEuNTAwNTA2OC0xLjA4MTk1MDQ4LS4xNTU0MzYyLS4yMjE2MzkxOGMtLjg0NDc1NjYtMS4yMDQ1NTM1Mi0yLjA5MTkwMzYtMS44NDAwNTc5NS0zLjc0MTU3MDItMS44NDAwNTc5NS0yLjY4MjI5NDkzIDAtNC43NTkwNTYwMyAyLjA5MDQzNTg2LTQuNzU5MDU2MDMgNC44NDU3MTQyNnoiLz48bWFzayBpZD0iYiIgZmlsbD0iI2ZmZiI+PHVzZSBmaWxsPSJub25lIiB4bGluazpocmVmPSIjYSIvPjwvbWFzaz48L2RlZnM+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48dXNlIGZpbGw9IiNkOGQ4ZDgiIHhsaW5rOmhyZWY9IiNhIi8+PGcgbWFzaz0idXJsKCNiKSI+PHBhdGggZD0ibTAgMGgyMXYyMWgtMjF6IiBmaWxsPSIjNDQ0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtLjUzMiAtLjM2NykiLz48L2c+PC9nPjwvc3ZnPg=='
	);

	if ( is_manager_enabled() ) {
		add_submenu_page(
			TOP_LEVEL_MENU,
			__( 'Newsroom Manager', 'civil' ),
			__( 'Newsroom Manager', 'civil' ),
			'manage_options',
			MANAGEMENT_PAGE,
			__NAMESPACE__ . '\newsroom_manager_content'
		);
	}

	if ( apply_filters( 'civil_enable_credibility_indicators', true ) ) {
		add_submenu_page(
			TOP_LEVEL_MENU,
			__( 'Credibility Indicators', 'civil' ),
			__( 'Credibility Indicators', 'civil' ),
			'manage_options',
			CREDIBILITY_INDICATORS,
			__NAMESPACE__ . '\credibililty_indicators_content'
		);
	}

	// Remove unneeded "Civil" submenu.
	remove_submenu_page( TOP_LEVEL_MENU, TOP_LEVEL_MENU );
}
add_action( 'admin_menu', __NAMESPACE__ . '\add_menus' );

/**
 * Add FAQ link to plugin menu.
 */
function add_faq_link() {
	// phpcs:disable WordPress.WP.GlobalVariablesOverride.OverrideProhibited -- can't find any other way to get external link submenu except redirect headers or crazy url filter shit
	global $submenu;
	$submenu[ TOP_LEVEL_MENU ][] = array( 'Help 🡭', 'edit_posts', 'https://cvlconsensys.zendesk.com/hc/en-us/categories/360001000232-Journalists' );
	// phpcs:enable
}
if ( is_manager_enabled() ) {
	add_action( 'admin_menu', __NAMESPACE__ . '\add_faq_link' );
}

/**
 * Civil Newsroom Manager page content.
 */
function newsroom_manager_content() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
	}
	require_once dirname( __FILE__ ) . '/newsroom-manager.php';
}

/**
 * Newsroom content viewer.
 */
function content_viewer_content() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
	}
	require_once dirname( __FILE__ ) . '/content-viewer.php';
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
 * Credibiity Indicators content.
 */
function credibililty_indicators_content() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
	}
	require_once dirname( __FILE__ ) . '/credibililty-indicators.php';
}

/**
 * Enqueue Civil Newsroom Manager script.
 */
function contract_management_script() {
	wp_enqueue_script(
		'civil-publisher-newsroom-management',
		plugins_url( 'build/newsroom-management.build.js', __FILE__ ),
		// Need these deps in order to expose React and wp.apiRequest.
		array( 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);
	common_scripts( 'civil-publisher-newsroom-management' );
}
add_action( 'admin_print_scripts-civil_page_' . MANAGEMENT_PAGE, __NAMESPACE__ . '\contract_management_script' );

/**
 * Enqueue Content Viewer.
 */
function content_viewer_script() {
	wp_enqueue_script(
		'civil-publisher-content-viewer',
		plugins_url( 'build/content-viewer.build.js', __FILE__ ),
		// Need these deps in order to expose React and wp.apiRequest.
		array( 'wp-edit-post', 'wp-data' ),
		ASSETS_VERSION,
		true
	);
	common_scripts( 'civil-publisher-content-viewer' );
}
add_action( 'admin_print_scripts-civil_page_' . CONTENT_VIEWER, __NAMESPACE__ . '\content_viewer_script' );

/**
 * Alert user that Gutenberg plugin is needed if they don't have it activated. Only show on Manager page though so we don't drive them crazy if they mostly use the classic editor.
 */
function gutenberg_nag() {
	$page_id = get_current_screen()->id ?? '';
	if ( 'civil_page_' . MANAGEMENT_PAGE !== $page_id
		|| is_gutenberg_enabled()
	) {
		return;
	}

	if ( is_gutenberg_disabled_by_classic_editor() ) {
		$title = __( 'Gutenberg plugin disabled', 'civil' );
		$body = sprintf(
			wp_kses(
				/* translators: 1: Gutenberg plugin demo URL, 2: Classic Editor settings URL */
				__( 'The Civil Publisher requires WordPress\'s official <a target="_blank" href="%1$s">Gutenberg editor</a> to be active. You currently have Gutenberg disabled via the Classic Editor plugin. Please <a href="%2$s">visit Classic Editor settings</a> and set the default editor to the "Block Editor" in order to continue.', 'civil' ),
				array(
					'a' => array(
						'href' => array(),
						'target' => array(),
					),
				)
			),
			esc_url( 'https://wordpress.org/gutenberg/' ),
			esc_url( admin_url( '/options-writing.php#classic-editor-options' ) )
		);
	} else {
		$title = __( 'Gutenberg plugin missing', 'civil' );
		$body = sprintf(
			wp_kses(
				/* translators: 1: Gutenberg plugin demo URL, 2: Install Gutenberg plugin URL */
				__( 'The Civil Publisher requires WordPress\'s official <a target="_blank" href="%1$s">Gutenberg editor</a> to be installed and activated. Please either <a target="_blank" href="%2$s">install the Gutenberg plugin</a> or upgrade WordPress to the latest version, which includes Gutenberg by default.', 'civil' ),
				array(
					'a' => array(
						'href' => array(),
						'target' => array(),
					),
				)
			),
			esc_url( 'https://wordpress.org/gutenberg/' ),
			esc_url( admin_url( '/plugin-install.php?tab=plugin-information&plugin=gutenberg' ) )
		);
	}

	civil_notice_open();
	?>
	<h3><?php echo esc_html( $title ); ?></h3>
	<p><?php echo esc_html( $body ); ?></p>
	<?php
	civil_notice_close();
}
if ( is_manager_enabled() ) {
	add_action( 'admin_notices', __NAMESPACE__ . '\gutenberg_nag' );
}

/**
 * If necessary, alert user that they need to set up newsroom to use plugin.
 */
function newsroom_setup_nag() {
	// Don't show on newsroom manager page.
	$page_id = get_current_screen()->id ?? '';
	if ( 'civil_page_' . MANAGEMENT_PAGE === $page_id ) {
		return;
	}

	if ( current_user_can( 'manage_options' ) && empty( get_option( NEWSROOM_ADDRESS_OPTION_KEY ) ) ) {
		$management_page_url = menu_page_url( MANAGEMENT_PAGE, false );
		civil_notice_open();
		?>
		<h3><?php esc_html_e( 'Civil Publisher Installed!', 'civil' ); ?></h3>
		<p>
		<?php
			echo sprintf(
				wp_kses(
					/* translators: 1: Management page URL */
					__( 'Please take a few minutes to <a href="%1$s">set up your Civil newsroom</a> to start signing and publishing your posts.', 'civil' ),
					array( 'a' => array( 'href' => array() ) )
				),
				esc_url( $management_page_url )
			);
		?>
		</p>
		<p class="civil-buttons-wrap">
			<a href="<?php echo esc_url( $management_page_url ); ?>" class="button button-primary"><?php esc_html_e( 'Set Up Newsroom', 'civil' ); ?></a>
			<a href="<?php echo esc_url( FAQ_HOME ); ?>" class="button"><?php esc_html_e( 'FAQ and Help', 'civil' ); ?></a>
		</p>
		<?php
		civil_notice_close();
	}
}
if ( is_manager_enabled() ) {
	add_action( 'admin_notices', __NAMESPACE__ . '\newsroom_setup_nag' );
}

/**
 * If necessary, alert user that they need to fill in their ETH wallet address.
 */
function wallet_address_nag() {
	// Don't show on newsroom manager page, or if newsroom setup nag is showing.
	$page_id = get_current_screen()->id ?? '';
	if ( 'civil_page_' . MANAGEMENT_PAGE === $page_id
		|| ( current_user_can( 'manage_options' ) && empty( get_option( NEWSROOM_ADDRESS_OPTION_KEY ) ) )
	) {
		return;
	}

	if ( current_user_can_sign_posts() && empty( get_user_meta( get_current_user_id(), USER_ETH_ADDRESS_META_KEY ) ) ) {
		$edit_profile_url = get_edit_user_link() . '#civil_publisher_eth_wallet_address';
		civil_notice_open();
		?>
		<h3><?php esc_html_e( 'Civil Publisher', 'civil' ); ?></h3>
		<p>
		<?php
			echo sprintf(
				wp_kses(
					/* translators: 1: Edit profile URL */
					__( 'You need to <a href="%1$s">add your wallet address to your profile</a> before you can use your newsroom contract features.', 'civil' ),
					array( 'a' => array( 'href' => array() ) )
				),
				esc_url( $edit_profile_url )
			);
		?>
		</p>
		<p class="civil-buttons-wrap">
			<a href="<?php echo esc_url( $edit_profile_url ); ?>" class="button button-primary"><?php esc_html_e( 'Add Wallet Address', 'civil' ); ?></a>
			<a href="<?php echo esc_url( FAQ_HOME ); ?>" class="button"><?php esc_html_e( 'FAQ and Help', 'civil' ); ?></a>
		</p>
		<?php
		civil_notice_close();
	}
}
if ( is_manager_enabled() ) {
	add_action( 'admin_notices', __NAMESPACE__ . '\wallet_address_nag' );
}

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
	<div class="notice notice-error civil-notice is-dismissible">
		<div class="civil-logo-wrap">
			<div class="civil-logo-wrap-inner">
				<img src="<?php echo esc_url( plugins_url( 'images/civil-logo.svg', __FILE__ ) ); ?>" />
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

/**
 * Dumb script to ensure external help menu link opens in a new tab.
 */
function help_menu_new_tab() {
	?>
	<script>
		var submenu = document.querySelector(".toplevel_page_<?php echo esc_attr( 'TOP_LEVEL_MENU' ); ?> .wp-submenu a[href*=zendesk]");
		submenu && submenu.setAttribute("target", "_blank");
	</script>
	<?php
}
add_action( 'admin_print_footer_scripts', __NAMESPACE__ . '\help_menu_new_tab' );
