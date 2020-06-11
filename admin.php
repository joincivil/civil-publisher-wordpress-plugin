<?php
/**
 * Handles hooks and enqueueing for admin page and Gutenberg plugin scripts
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

/**
 * Add admin menu and sub-menu items.
 */
function add_menus() {
	add_menu_page(
		__( 'ConsenSys', 'consensys' ),
		__( 'ConsenSys', 'consensys' ),
		'edit_posts',
		TOP_LEVEL_MENU,
		null
	);

	add_submenu_page(
		TOP_LEVEL_MENU,
		__( 'ConsenSys VC Publisher Settings', 'consensys' ),
		__( 'Settings', 'consensys' ),
		'manage_options',
		DID_SETTINGS_PAGE,
		__NAMESPACE__ . '\did_settings_content'
	);

	// Remove unneeded "ConsenSys" submenu.
	remove_submenu_page( TOP_LEVEL_MENU, TOP_LEVEL_MENU );
}
add_action( 'admin_menu', __NAMESPACE__ . '\add_menus' );

/**
 * Add FAQ link to plugin menu.
 */
function add_faq_link() {
	// phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited -- can't find any other way to get external link submenu except redirect headers or crazy url filter shit
	global $submenu;
	$submenu[ TOP_LEVEL_MENU ][] = array( 'FAQ & Help 🡭', 'edit_posts', FAQ_HOME );
	// phpcs:enable
}
add_action( 'admin_menu', __NAMESPACE__ . '\add_faq_link' );

/**
 * DID Settings content.
 */
function did_settings_content() {
	require_once dirname( __FILE__ ) . '/did-settings.php';
}

/**
 * Onboarding notice.
 */
function onboarding_notice() {
	// Don't show on settings page.
	$page_id = get_current_screen()->id ?? '';
	if ( 'consensys_page_' . DID_SETTINGS_PAGE === $page_id ) {
		return;
	}

	if ( current_user_can( 'manage_options' ) && empty( get_option( ASSIGNED_DID_OPTION_KEY ) ) ) {
		$settings_page_url = menu_page_url( DID_SETTINGS_PAGE, false );
		notice_open();
		?>
		<h3><?php esc_html_e( 'ConsenSys VC Publisher Installed!', 'consensys' ); ?></h3>
		<p>
		<?php
			echo sprintf(
				wp_kses(
					/* translators: 1: Settings page URL */
					__( '@TODO copy TBD. Please take a few minutes to <a href="%1$s">set things up</a> to start doing stuff.', 'consensys' ),
					array( 'a' => array( 'href' => array() ) )
				),
				esc_url( $settings_page_url )
			);
		?>
		</p>
		<p class="consensys-buttons-wrap">
			<a href="<?php echo esc_url( $settings_page_url ); ?>" class="button button-primary"><?php esc_html_e( 'Set Up Stuff', 'consensys' ); ?></a>
			<a href="<?php echo esc_url( FAQ_HOME ); ?>" class="button"><?php esc_html_e( 'FAQ and Help', 'consensys' ); ?></a>
		</p>
		<?php
		notice_close();
	}
}
add_action( 'admin_notices', __NAMESPACE__ . '\onboarding_notice' );

/**
 * Error notice.
 */
function error_notice() {
	if ( current_user_can( 'manage_options' ) && ! empty( get_option( DID_ERROR_OPTION_KEY ) ) ) {
		$page_id = get_current_screen()->id ?? '';
		$is_settings_page = 'consensys_page_' . DID_SETTINGS_PAGE === $page_id;

		$settings_page_url = menu_page_url( DID_SETTINGS_PAGE, false );
		notice_open( 'error' );
		?>
		<h3>
			<?php
			if ( $is_settings_page ) {
				esc_html_e( 'Error', 'consensys' );
			} else {
				esc_html_e( 'ConsenSys VC Publisher Error', 'consensys' );
			}
			?>
		</h3>
		<p>
			<pre style="white-space: pre-wrap; margin: 0; padding: 5px; background: #FBFBFB;"><?php echo esc_html( get_option( DID_ERROR_OPTION_KEY ) ); ?></pre>
		</p>
		<p>
		<?php
		if ( ! $is_settings_page ) {
			echo sprintf(
				wp_kses(
					/* translators: 1: Settings page URL */
					__( 'Please visit the <a href="%1$s">settings page</a> for more options and debug info.', 'consensys' ),
					array( 'a' => array( 'href' => array() ) )
				),
				esc_url( $settings_page_url )
			);
		}
		?>
		</p>
		<p class="consensys-buttons-wrap">
			<?php if ( ! $is_settings_page ) { ?>
				<a href="<?php echo esc_url( $settings_page_url ); ?>" class="button button-primary"><?php esc_html_e( 'Settings', 'consensys' ); ?></a>
			<?php } ?>
			<a href="<?php echo esc_url( FAQ_HOME ); ?>" class="button"><?php esc_html_e( 'FAQ and Help', 'consensys' ); ?></a>
		</p>
		<?php
		notice_close();
	}
}
add_action( 'admin_notices', __NAMESPACE__ . '\error_notice' );

/**
 * Output opening HTML for admin notice.
 *
 * @param string $type Classname picked up by WordPress. Options include 'info' (default), 'warning', and 'error'.
 */
function notice_open( $type = 'info' ) {
	?>
	<style>
		.consensys-notice {
			display: flex;
			align-items: center;
		}
		.notice-info.consensys-notice {
			height: 125px;
		}
		.consensys-logo-wrap {
			display: table;
			height: calc(100% - 32px);
			margin-right: 15px;
			padding: 15px;
			background: black;
		}
		.consensys-logo-wrap-inner {
			display: table-cell;
			vertical-align: middle;
		}
		.consensys-notice h3 {
			margin: 8px 0;
		}
		p.consensys-buttons-wrap {
			margin-top: 10px;
		}
		p.consensys-buttons-wrap .button:last-child {
			margin-left: 8px;
		}
	</style>
	<div class="notice notice-<?php echo esc_attr( $type ); ?> consensys-notice is-dismissible">
		<div class="consensys-logo-wrap">
			<div class="consensys-logo-wrap-inner">
				<img src="<?php echo esc_url( plugins_url( 'images/consensys-logo.svg', __FILE__ ) ); ?>" />
			</div>
		</div>
		<div class="consensys-notice-body">
	<?php
}

/**
 * Output closing HTML for admin notice.
 */
function notice_close() {
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
		var submenu = document.querySelector(".toplevel_page_<?php echo esc_attr( TOP_LEVEL_MENU ); ?> .wp-submenu a[href*='@TODO']");
		submenu && submenu.setAttribute("target", "_blank");
	</script>
	<?php
}
add_action( 'admin_print_footer_scripts', __NAMESPACE__ . '\help_menu_new_tab' );
