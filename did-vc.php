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

	if ( current_user_can( 'manage_options' ) && ! empty( get_option( DAF_BASE_URL_OPTION_KEY ) ) ) {
		if ( empty( get_option( ASSIGNED_DID_OPTION_KEY ) ) ) {
			init_did();
		}
		if ( empty( get_option( DID_CONFIG_OPTION_KEY ) ) ) {
			init_did_config();
		}
	}
}

/**
 * Init DID.
 */
function init_did() {
	try {
		$site_url = get_site_url();
		preg_match( '/^https?:\/\/([^\/:]+)/', $site_url, $matches );
		if ( empty( $matches ) || ! isset( $matches[1] ) ) {
			update_option( DID_ERROR_OPTION_KEY, "Error initializing DID: could not parse domain from site URL '$site_url'" );
			return;
		}
		$domain = $matches[1];

		$response = Daf_Service::instance()->identity_manager_get_or_create_identity(
			array(
				'provider' => 'did:web',
				'alias' => $domain,
			)
		);

		update_option( ASSIGNED_DID_OPTION_KEY, $response->did );
		delete_option( DID_ERROR_OPTION_KEY );
	} catch ( \Exception $e ) {
		update_option( DID_ERROR_OPTION_KEY, 'Failed to initialize DID: ' . $e->getMessage() );
		return;
	}
}

/**
 * Init DID Configuration.
 */
function init_did_config() {
	$did = get_option( ASSIGNED_DID_OPTION_KEY );
	if ( empty( $did ) ) {
		error_log( 'DID was not initialized - skipping DID Configuration initialization.' );
		return;
	}

	try {
		$domain = preg_replace( '/^https?:\/\//', '', get_option( 'siteurl' ) );
		$response = Daf_Service::instance()->generate_did_configuration(
			array(
				'dids' => array( $did ),
				'domain' => $domain,
			)
		);
		update_option( DID_CONFIG_OPTION_KEY, json_encode( $response ) );
		delete_option( DID_ERROR_OPTION_KEY );
	} catch ( \Exception $e ) {
		update_option( DID_ERROR_OPTION_KEY, "Failed to initialize DID Configuration. Please ensure that your Veramo agent is using the \"daf-plugin-did-config\" plugin. Error:\n\n" . $e->getMessage() );
	}
}

/**
 * Override template file to redirect DID_DOC_QUERY and DID_CONFIG_QUERY to their destinations.
 *
 * @param string $template Path of template.
 */
function include_template( $template ) {
	if ( get_query_var( DID_DOC_QUERY ) ) {
		return dirname( PLUGIN_FILE ) . '/did-doc.php';
	}
	if ( get_query_var( DID_CONFIG_QUERY ) ) {
		return dirname( PLUGIN_FILE ) . '/did-config.php';
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
 * Set up rewrite rules for DID doc and DID config: add query variable on route so that desired file gets rendered.
 */
function rewrite_rules() {
	// @TODO/tobek On my local nginx, paths starting with "." a blocked with a 403. For testing for now just change the path to remove the ".".
	add_rewrite_rule( '^.well-known/did\.json$', 'index.php?' . DID_DOC_QUERY . '=true', 'top' );
	add_rewrite_rule( '^.well-known/did-configuration\.json$', 'index.php?' . DID_CONFIG_QUERY . '=true', 'top' );
	// @TODO/tobek Prevent this 301 redirecting to path with trailing slash.
	add_rewrite_tag( '%' . DID_DOC_QUERY . '%', '*' );
	add_rewrite_tag( '%' . DID_CONFIG_QUERY . '%', '*' );
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
		DAF_BASE_URL_OPTION_KEY,
		__( 'DAF Agent URL', 'consensys' ),
		__NAMESPACE__ . '\display_string_setting_input',
		'did',
		'consensys_did',
		array(
			'option_key' => DAF_BASE_URL_OPTION_KEY,
		)
	);

	register_setting( 'consensys_did', DID_IS_ENABLED_OPTION_KEY );
	register_setting( 'consensys_did', PUB_VC_BY_DEFAULT_ON_NEW_OPTION_KEY );
	register_setting( 'consensys_did', PUB_VC_BY_DEFAULT_ON_UPDATE_OPTION_KEY );
	register_setting( 'consensys_did', DAF_BASE_URL_OPTION_KEY );
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

/**
 * Gets VC JSON for given post ID.
 *
 * @param int $post_id Post ID.
 * @return string VC JSON.
 */
function get_vc_for_post_id( $post_id ) {
	return get_post_meta( $post_id, POST_VC_META_KEY, true );
}
