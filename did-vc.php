<?php
/**
 * Handles DID and VC logic for ID Hub integration.
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

/**
 * Init DID logic.
 */
function init() {
	if ( ! get_option( OPTION_DID_IS_ENABLED ) ) {
		return;
	}

	add_filter( 'template_include', __NAMESPACE__ . '\include_template' );
	add_filter( 'init', __NAMESPACE__ . '\rewrite_rules' );

	if ( current_user_can( 'manage_options' ) ) {
		try {
			init_did();
		} catch ( Exception $e ) {
			// @TODO/tobek Surface this error in admin
			update_option( OPTION_DID_ERROR, 'Failed to generate openssl key pair: ' . $e->getMessage() );
		}
	}
}

/**
 * Init DID.
 */
function init_did() {
	// @TODO/tobek
}

/**
 * Override template file for DID doc.
 *
 * @param string $template Path of template.
 */
function include_template( $template ) {
	if ( get_query_var( 'civil_publisher_did' ) ) {
		return PATH . '/did-doc.php';
	}

	return $template;
}

/**
 * Flush rewrite rules.
 */
function flush_rules() {
	$this->rewrite_rules();
	flush_rewrite_rules();
}

/**
 * Set up rewrite rules for DID doc.
 */
function rewrite_rules() {
	add_rewrite_rule( '^\.well-known/did\.json$', 'index.php?civil_publisher_did=true', 'top' );
	add_rewrite_tag( '%civil_publisher_did%', '*' );
}

add_action( 'plugins_loaded', __NAMESPACE__ . '\init' );

// On plugin activation flush rewrite rules.
register_activation_hook( PLUGIN_FILE, __NAMESPACE__ . '\flush_rules' );

/**
 * Add settings fields to control DID features.
 */
function add_did_settings() {
	add_settings_section( 'civil_did', __( 'Settings', 'civil' ), null, 'did' );

	add_settings_field( OPTION_DID_IS_ENABLED, __( 'Enable DID features', 'civil' ), __NAMESPACE__ . '\display_did_is_enabled_input', 'did', 'civil_did' );
	register_setting( 'civil_did', OPTION_DID_IS_ENABLED );
}
add_action( 'admin_init', __NAMESPACE__ . '\add_did_settings' );

/**
 * Output the DID enabled input.
 */
function display_did_is_enabled_input() {
	$enable = boolval( get_option( OPTION_DID_IS_ENABLED, DID_IS_ENABLED_DEFAULT ) );
	?>
		<div style="max-width: 600px">
			<label>
				<input
					type="checkbox"
					name="<?php echo esc_attr( OPTION_DID_IS_ENABLED ); ?>"
					id="<?php echo esc_attr( OPTION_DID_IS_ENABLED ); ?>"
					<?php checked( $enable, true ); ?>
				/>
				<?php _e( 'Enable DID features.' ); ?>
			</label>
			<p><?php _e( '@TODO copy with more details TBD' ); ?></p>
		</div>
	<?php
}
