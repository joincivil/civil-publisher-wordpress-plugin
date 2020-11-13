<?php
/**
 * Handles DID and VC initialization, settings, and misc logic.
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

/**
 * Init DID logic.
 */
function init() {
	if ( ! get_option( DID_IS_ENABLED_OPTION_KEY, DID_IS_ENABLED_DEFAULT ) ) {
		return;
	}

	add_filter( 'template_include', __NAMESPACE__ . '\include_template' );
	add_filter( 'init', __NAMESPACE__ . '\rewrite_rules' );

	if ( current_user_can( 'manage_options' ) && empty( get_option( ASSIGNED_DID_OPTION_KEY ) ) && ! empty( get_option( TRUST_AGENT_ID_OPTION_KEY ) ) && ! empty( get_option( TRUST_AGENT_API_KEY_OPTION_KEY ) ) ) {
		try {
			init_did();
		} catch ( \Error $e ) {
			update_option( DID_ERROR_OPTION_KEY, 'Failed to initialize DID: ' . $e->getMessage() );
		}
	}
}

/**
 * Init DID.
 */
function init_did() {
	$res = wp_remote_post(
		get_option( TRUST_AGENT_BASE_URL_OPTION_KEY, TRUST_AGENT_BASE_URL_DEFAULT ) . '/v1/tenant/agent/identityManagerGetIdentities',
		array(
			'headers' => array(
				'authorization' => 'Bearer ' . get_option( TRUST_AGENT_API_KEY_OPTION_KEY ),
				'tenantid' => get_option( TRUST_AGENT_ID_OPTION_KEY ),
			),
		)
	);
	if ( is_wp_error( $res ) ) {
		update_option( DID_ERROR_OPTION_KEY, 'Error making DID init request: ' . json_encode( $res ) );
		return;
	} else if ( 200 != $res['response']['code'] ) {
		update_option( DID_ERROR_OPTION_KEY, 'Error response from DID init request: ' . $res['response']['code'] . ': ' . $res['response']['message'] . ( isset( $res['body'] ) ? ( ' (' . $res['body'] . ')' ) : '' ) );
		return;
	}

	$dids = json_decode( $res['body'] );
	if ( $dids && count( $dids ) > 0 ) {
		update_option( ASSIGNED_DID_OPTION_KEY, $dids[0]->did );
		delete_option( DID_ERROR_OPTION_KEY );
	} else {
		// @TODO/tobek Automatically create a DID if none exists yet.
		update_option( DID_ERROR_OPTION_KEY, 'You have not yet created an identifier. Please navigate to the tenant dashboard and create an identifer.' );
	}
}

/**
 * Override template file to redirect `consensys_vc_publisher_did_doc` to DID doc.
 *
 * @param string $template Path of template.
 */
function include_template( $template ) {
	if ( get_query_var( 'consensys_vc_publisher_did_doc' ) ) {
		return dirname( PLUGIN_FILE ) . '/did-doc.php';
	}

	return $template;
}

/**
 * Flush rewrite rules.
 */
function flush_rules() {
	rewrite_rules();
	flush_rewrite_rules();
}

/**
 * Set up rewrite rules for DID doc: add query variable on DID doc route so that DID doc gets rendered.
 */
function rewrite_rules() {
	// @TODO/tobek On my local nginx, paths starting with "." a blocked with a 403. For testing for now just change the path to remove the ".".
	add_rewrite_rule( '^.well-known/did\.json$', 'index.php?consensys_vc_publisher_did_doc=true', 'top' );
	// @TODO/tobek Prevent this 301 redirecting to path with trailing slash.
	add_rewrite_tag( '%consensys_vc_publisher_did_doc%', '*' );
}

add_action( 'plugins_loaded', __NAMESPACE__ . '\init' );

// On plugin activation flush rewrite rules.
register_activation_hook( PLUGIN_FILE, __NAMESPACE__ . '\flush_rules' );

// @TODO/tobek `flush_rules` should get run on plugin upgrade too: https://stackoverflow.com/questions/24187990/plugin-update-hook https://pluginrepublic.com/wordpress-plugin-update-hook-upgrader_process_complete/. For now if DID doc route isn't working just uncomment following line and refresh any WP page to flush the rewrite rules and then comment it out again:
// add_action( 'init', __NAMESPACE__ . '\flush_rules' ); // temp run flush rules on every page load

/**
 * Add settings fields to control DID features.
 */
function add_did_settings() {
	add_settings_section( 'consensys_did', __( 'Settings', 'consensys' ), null, 'did' );

	add_settings_field(
		DID_IS_ENABLED_OPTION_KEY,
		__( 'Enable DID features', 'consensys' ),
		__NAMESPACE__ . '\display_boolean_setting_input',
		'did',
		'consensys_did',
		array(
			'option_key' => DID_IS_ENABLED_OPTION_KEY,
			'default' => DID_IS_ENABLED_DEFAULT,
		)
	);
	add_settings_field(
		PUB_VC_BY_DEFAULT_ON_NEW_OPTION_KEY,
		__( 'Publish VC by default on new posts', 'consensys' ),
		__NAMESPACE__ . '\display_boolean_setting_input',
		'did',
		'consensys_did',
		array(
			'option_key' => PUB_VC_BY_DEFAULT_ON_NEW_OPTION_KEY,
			'default' => PUB_VC_BY_DEFAULT_ON_NEW_DEFAULT,
			'description' => 'This can be overriden on a per-post basis.',
		)
	);
	add_settings_field(
		PUB_VC_BY_DEFAULT_ON_UPDATE_OPTION_KEY,
		__( 'Publish updates to VC by default when updating existing posts', 'consensys' ),
		__NAMESPACE__ . '\display_boolean_setting_input',
		'did',
		'consensys_did',
		array(
			'option_key' => PUB_VC_BY_DEFAULT_ON_UPDATE_OPTION_KEY,
			'default' => PUB_VC_BY_DEFAULT_ON_UPDATE_DEFAULT,
			'description' => 'This can be overriden on a per-post basis.',
		)
	);
	add_settings_field(
		TRUST_AGENT_BASE_URL_OPTION_KEY,
		__( 'Trust Agent URL', 'consensys' ),
		__NAMESPACE__ . '\display_string_setting_input',
		'did',
		'consensys_did',
		array(
			'option_key' => TRUST_AGENT_BASE_URL_OPTION_KEY,
			'default' => TRUST_AGENT_BASE_URL_DEFAULT,
		)
	);
	add_settings_field(
		TRUST_AGENT_ID_OPTION_KEY,
		__( 'Trust Agent organization ID', 'consensys' ),
		__NAMESPACE__ . '\display_string_setting_input',
		'did',
		'consensys_did',
		array(
			'option_key' => TRUST_AGENT_ID_OPTION_KEY,
		)
	);
	add_settings_field(
		TRUST_AGENT_API_KEY_OPTION_KEY,
		__( 'Trust Agent API key', 'consensys' ),
		__NAMESPACE__ . '\display_string_setting_input',
		'did',
		'consensys_did',
		array(
			'option_key' => TRUST_AGENT_API_KEY_OPTION_KEY,
		)
	);

	register_setting( 'consensys_did', DID_IS_ENABLED_OPTION_KEY );
	register_setting( 'consensys_did', PUB_VC_BY_DEFAULT_ON_NEW_OPTION_KEY );
	register_setting( 'consensys_did', PUB_VC_BY_DEFAULT_ON_UPDATE_OPTION_KEY );
	register_setting( 'consensys_did', TRUST_AGENT_BASE_URL_OPTION_KEY );
	register_setting( 'consensys_did', TRUST_AGENT_ID_OPTION_KEY );
	register_setting( 'consensys_did', TRUST_AGENT_API_KEY_OPTION_KEY );
}
add_action( 'admin_init', __NAMESPACE__ . '\add_did_settings' );

/**
 * Output checkbox input for boolean settings.
 *
 * @param array $args Arguments sent by add_settings_field(): option_key, default, description (optional).
 */
function display_boolean_setting_input( $args ) {
	$enable = boolval( get_option( $args['option_key'], $args['default'] ) );
	?>
		<div style="max-width: 600px">
			<label>
				<input
					type="checkbox"
					name="<?php echo esc_attr( $args['option_key'] ); ?>"
					id="<?php echo esc_attr( $args['option_key'] ); ?>"
					<?php checked( $enable, true ); ?>
				/>
			</label>
			<?php if ( isset( $args['description'] ) ) { ?>
				<p><?php esc_html_e( $args['description'] ); ?></p>
			<?php } ?>
		</div>
	<?php
}

/**
 * Output text input for string settings.
 *
 * @param array $args Arguments sent by add_settings_field(): option_key, default, description (optional).
 */
function display_string_setting_input( $args ) {
	$default = isset( $args['default'] ) ? $args['default'] : '';
	$value = strval( get_option( $args['option_key'], $default ) );
	?>
		<div style="max-width: 600px">
			<input
				style="width: 400px"
				type="text"
				name="<?php echo esc_attr( $args['option_key'] ); ?>"
				id="<?php echo esc_attr( $args['option_key'] ); ?>"
				value="<?php echo esc_attr( $value ); ?>"
			/>
			<?php if ( isset( $args['description'] ) ) { ?>
				<p><?php esc_html_e( $args['description'] ); ?></p>
			<?php } ?>
		</div>
	<?php
}
