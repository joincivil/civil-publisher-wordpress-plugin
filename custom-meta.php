<?php
/**
 * Handles custom user and site meta
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

/**
 * Output custom fields for user profile.
 *
 * @param object $user A WP_User object.
 */
function show_wallet_profile_field( $user ) {
	if ( ! current_user_can_sign_posts() ) {
		return;
	}

	$wallet_address = get_the_author_meta( USER_ETH_ADDRESS_META_KEY, $user->ID );
	wp_nonce_field( 'civil_publisher_update_wallet_address_action', 'civil_publisher_eth_wallet_address_nonce' );
	?>
	<h3><?php esc_html_e( 'Civil Publisher - Wallet Address', 'civil' ); ?></h3>

	<table class="form-table">
		<tr>
			<th><label for="<?php echo esc_attr( USER_ETH_ADDRESS_META_KEY ); ?>"><?php esc_html_e( 'Your wallet address', 'civil' ); ?></label></th>
			<td>
				<div style="max-width: 400px;">
					<input type="text"
						size="42"
						id="<?php echo esc_attr( USER_ETH_ADDRESS_META_KEY ); ?>"
						name="<?php echo esc_attr( USER_ETH_ADDRESS_META_KEY ); ?>"
						value="<?php echo esc_attr( $wallet_address ); ?>"
						placeholder="0xabc123"
						class="regular-text"
					/>
					<p>
						<?php
						echo sprintf(
							wp_kses(
								/* translators: 1: FAQ page URL */
								__( 'This wallet address will be used to determine and grant you access to your newsroom smart contract. If you later change to a new wallet you will lose that access unless your new wallet has been added to the contract. If you lose access to this wallet, you or your team may lose access to your newsroom smart contract. <a href="%1$s">Learn more</a>', 'civil' ),
								[ 'a' => [ 'href' => [] ] ]
							),
							esc_url( FAQ_HOME )
						);
						?>
					</p>
				</div>
			</td>
		</tr>
	</table>
	<?php
}
add_action( 'show_user_profile', __NAMESPACE__ . '\show_wallet_profile_field' );
add_action( 'edit_user_profile', __NAMESPACE__ . '\show_wallet_profile_field' );

/**
 * Print any errors from updating user profile.
 *
 * @param object $errors Errors object to add any custom errors to.
 * @param bool   $update True if updating an existing user, false if saving a new user.
 * @param object $user User object for user being edited.
 */
function user_profile_update_errors( $errors, $update, $user ) {
	if (
		isset( $_POST[ USER_ETH_ADDRESS_META_KEY ], $_POST['civil_publisher_eth_wallet_address_nonce'] )
		&& wp_verify_nonce( sanitize_key( $_POST['civil_publisher_eth_wallet_address_nonce'] ), 'civil_publisher_update_wallet_address_action' )
	) {
		$addr = sanitize_text_field( wp_unslash( $_POST[ USER_ETH_ADDRESS_META_KEY ] ) );
		if ( ! empty( $addr ) && ! is_valid_eth_address( $addr ) ) {
			$errors->add(
				'wallet_address_error',
				sprintf(
					/* translators: %1 is ETH wallet address e.g. "0xabc123..." */
					__( '<strong>ERROR</strong>: Invalid ETH wallet address "%1$s"', 'civil' ),
					$addr
				)
			);
		}
	}
}
add_action( 'user_profile_update_errors', __NAMESPACE__ . '\user_profile_update_errors', 10, 3 );

/**
 * Handle update of custom user profile fields.
 *
 * @param int $user_id ID of user.
 */
function update_profile_fields( $user_id ) {
	if ( ! current_user_can( 'edit_user', $user_id ) ) {
		return false;
	}

	if (
		isset( $_POST[ USER_ETH_ADDRESS_META_KEY ], $_POST['civil_publisher_eth_wallet_address_nonce'] )
		&& wp_verify_nonce( sanitize_key( $_POST['civil_publisher_eth_wallet_address_nonce'] ), 'civil_publisher_update_wallet_address_action' )
	) {
		$addr = sanitize_text_field( wp_unslash( $_POST[ USER_ETH_ADDRESS_META_KEY ] ) );
		if ( is_valid_eth_address( $addr ) ) {
			update_user_meta( $user_id, USER_ETH_ADDRESS_META_KEY, $addr );
		} else {
			delete_user_meta( $user_id, USER_ETH_ADDRESS_META_KEY );
		}
	}
}
add_action( 'personal_options_update', __NAMESPACE__ . '\update_profile_fields' );
add_action( 'edit_user_profile_update', __NAMESPACE__ . '\update_profile_fields' );

/**
 * Ensure custom user meta is returned in REST API (also makes available in Gutenberg).
 */
function add_user_meta_rest() {
	register_rest_field(
		'user',
		USER_ETH_ADDRESS_META_KEY,
		array(
			'get_callback'    => __NAMESPACE__ . '\user_meta_callback',
			'update_callback' => null,
			'schema'          => null,
		)
	);
	register_rest_field(
		'user',
		USER_NEWSROOM_ROLE_META_KEY,
		array(
			'get_callback'      => __NAMESPACE__ . '\user_meta_callback',
			'update_callback'   => null,
			'schema'            => null,
		)
	);
}
add_action( 'rest_api_init', __NAMESPACE__ . '\add_user_meta_rest' );

/**
 * Actually get custom user meta.
 *
 * @param object $user A WP_User object.
 * @param string $field_name Name of meta field being retrieved.
 * @return string Contents of meta field.
 */
function user_meta_callback( $user, $field_name ) {
	return get_user_meta( $user['id'], $field_name, true );
}


/**
 * Register and add newsroom address field.
 */
function newsroom_address_init() {
	newsroom_address_register_setting();

	if ( current_user_can( 'manage_options' ) ) {
		add_settings_field(
			NEWSROOM_ADDRESS_OPTION_KEY,
			__( 'Newsroom Contract Address', 'civil' ),
			__NAMESPACE__ . '\newsroom_address_input',
			'general',
			'default'
		);
	}
}
add_action( 'admin_init', __NAMESPACE__ . '\newsroom_address_init' );

/**
 * Register newsroom address setting.
 */
function newsroom_address_register_setting() {
	register_setting(
		'general',
		NEWSROOM_ADDRESS_OPTION_KEY,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => __NAMESPACE__ . '\sanitize_newsroom_address',
		)
	);
}
add_action( 'rest_api_init', __NAMESPACE__ . '\newsroom_address_register_setting' );

/**
 * Register newsroom contract deploy txhash.
 */
function newsroom_txhash_register_setting() {
	register_setting(
		'general',
		NEWSROOM_TXHASH_OPTION_KEY,
		array(
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'sanitize_callback' => __NAMESPACE__ . '\sanitize_newsroom_txhash',
		)
	);
}
add_action( 'rest_api_init', __NAMESPACE__ . '\newsroom_txhash_register_setting' );

/**
 * Sanitize charter.
 *
 * @param string $input Newsroom charter (stringified JSON) to sanitize.
 * @return string Sanitized charter.
 */
function sanitize_newsroom_charter( $input ) {
	return json_decode( json_encode( $input ) );
}

/**
 * Register newsroom contract charter.
 */
function newsroom_charter_register_setting() {
	register_setting(
		'general',
		NEWSROOM_CHARTER_OPTION_KEY,
		array(
			'type' => 'string', // stringified JSON.
			'single' => true,
			'show_in_rest' => true,
			'sanitize_callback' => __NAMESPACE__ . '\sanitize_newsroom_charter',
		)
	);
}
add_action( 'rest_api_init', __NAMESPACE__ . '\newsroom_charter_register_setting' );

/**
 * Output form for capturing newsroom address.
 */
function newsroom_address_input() {
	$value = get_option( NEWSROOM_ADDRESS_OPTION_KEY );
	?>
	<input type="text"
		size="42"
		id="<?php echo esc_attr( NEWSROOM_ADDRESS_OPTION_KEY ); ?>"
		name="<?php echo esc_attr( NEWSROOM_ADDRESS_OPTION_KEY ); ?>"
		placeholder="0x123abc"
		value="<?php echo esc_attr( $value ); ?>"
	/>
	<p class="description"><strong>Warning:</strong> Don't change this unless you know what you're doing. Your newsroom should be set up via the <a href="<?php echo esc_url( menu_page_url( MANAGEMENT_PAGE, false ) ); ?>">Newsroom Manager</a> instead.</p>
	<?php
}

/**
 * Sanitize/validate newsroom address.
 *
 * @param string $input Newsroom address to validate.
 * @return string Sanitized newsroom address, or empty string to delete value and we register an error with `add_settings_error`.
 */
function sanitize_newsroom_address( $input ) {
	if ( ! $input ) {
		return;
	}

	$addr = sanitize_text_field( $input );

	if ( ! is_valid_eth_address( $addr ) ) {
		add_settings_error(
			NEWSROOM_ADDRESS_OPTION_KEY,
			'civil_publisher_newsroom_address_err',
			sprintf(
				/* translators: %1 is ETH contract address e.g. "0xabc123..." */
				__( 'Newsroom Contract Address "%1$s" is not a valid ETH address', 'civil' ),
				$addr
			),
			'error'
		);
		return '';
	}

	return $addr;
}

/**
 * Register and add network name field.
 */
function network_name_init() {
	network_name_register_setting();

	if ( current_user_can( 'manage_options' ) ) {
		add_settings_field(
			NETWORK_NAME_OPTION_KEY,
			__( 'Ethereum Network Name', 'civil' ),
			__NAMESPACE__ . '\network_name_input',
			'general',
			'default'
		);
	}
}
add_action( 'admin_init', __NAMESPACE__ . '\network_name_init' );

/**
 * Register network name setting.
 */
function network_name_register_setting() {
	register_setting(
		'general',
		NETWORK_NAME_OPTION_KEY,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
}
add_action( 'rest_api_init', __NAMESPACE__ . '\network_name_register_setting' );

/**
 * Output form for capturing network name.
 */
function network_name_input() {
	$value = get_option( NETWORK_NAME_OPTION_KEY );
	?>
	<input type="text"
		size="42"
		id="<?php echo esc_attr( NETWORK_NAME_OPTION_KEY ); ?>"
		name="<?php echo esc_attr( NETWORK_NAME_OPTION_KEY ); ?>"
		placeholder="<?php echo esc_attr( WP_DEBUG ? 'rinkeby' : 'main' ); ?>"
		value="<?php echo esc_attr( $value ); ?>"
	/>
	<p class="description"><code>"main" | "morden" | "ropsten" | "rinkeby" | "ganache"</code></p>
	<?php
}

/**
 * Sanitize/validate newsroom txhash.
 *
 * @param string $input Newsroom txhash to validate.
 * @return string Sanitized newsroom address, or empty string to delete value and we register an error with `add_settings_error`.
 */
function sanitize_newsroom_txhash( $input ) {
	if ( ! $input ) {
		return;
	}

	$txhash = sanitize_text_field( $input );

	if ( ! is_valid_txhash( $txhash ) ) {
		add_settings_error(
			NEWSROOM_TXHASH_OPTION_KEY,
			'civil_publisher_newsroom_txhash_err',
			sprintf(
				/* translators: %1 is ETH contract address e.g. "0xabc123..." */
				__( 'Newsroom Contract txhash "%1$s" is not a valid ETH transaction hash', 'civil' ),
				$txhash
			),
			'error'
		);
		return '';
	}

	return $txhash;
}

/**
 * Saves minimal amount of data about post authors that we need to be able to access from Gutenberg. Co-Authors Plus doesn't seem to support any way to do this, so on save we will generate this data and store in post meta.
 *
 * NOTE: Some information about coauthors is available from legacy metabox interface in Gutenberg store accessible via `wp.data.select('core/edit-post').getMetaBox('normal').data` which has various coauthors fields, but it... doesn't list more than two coauthors. Maybe the data is there hiding somewhere, or this will be improved in the future?
 *
 * @param int $post_id The post ID.
 */
function save_post_author_data( $post_id ) {
	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}

	$author_data = get_post_authors_data( $post_id );
	$json = html_entity_decode( str_replace( "\u0022", '\\\\\"', json_encode( $author_data, JSON_NUMERIC_CHECK | JSON_HEX_QUOT ) ) );
	update_metadata( 'post', $post_id, POST_AUTHORS_META_KEY, $json );
}
add_action( 'save_post', __NAMESPACE__ . '\save_post_author_data', 200 );

/**
 * Ensure custom post meta visible/editable in REST API and Gutenberg.
 */
function expose_article_meta() {
	register_meta(
		'post',
		SIGNATURES_META_KEY,
		[
			'show_in_rest' => true,
			'single'       => true,
			'type'         => 'string', // Actually will be stringified JSON.
		]
	);
	register_meta(
		'post',
		REVISIONS_META_KEY,
		[
			'show_in_rest' => true,
			'single'       => true,
			'type'         => 'string', // Actually will be stringified JSON.
		]
	);
	register_meta(
		'post',
		POST_AUTHORS_META_KEY,
		[
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string', // Actually will be stringified JSON.
		]
	);
	register_meta(
		'post',
		CONTENT_ID_META_KEY,
		[
			'show_in_rest' => true,
			'single'       => true,
			'type'         => 'string',
		]
	);
	register_meta(
		'post',
		TXHASH_META_KEY,
		[
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
		]
	);
	register_meta(
		'post',
		IPFS_META_KEY,
		[
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
		]
	);
	register_meta(
		'post',
		ARCHIVE_STATUS_META_KEY,
		[
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
		]
	);
}
add_action( 'admin_init', __NAMESPACE__ . '\expose_article_meta' );
add_action( 'rest_api_init', __NAMESPACE__ . '\expose_article_meta' );
