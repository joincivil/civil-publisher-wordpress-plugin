<?php
/**
 * Handles custom user and site meta
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * Output custom fields for user profile.
 *
 * @param object $user A WP_User object.
 */
function show_profile_fields( $user ) {
	$wallet_address = get_the_author_meta( USER_ETH_ADDRESS_META_KEY, $user->ID );
	wp_nonce_field( 'civil_newsroom_protocol_update_wallet_address_action', 'civil_newsroom_protocol_eth_wallet_address_nonce' );
	?>
	<h3><?php esc_html_e( 'Civil Newsroom Manager - Wallet Address', 'civil' ); ?></h3>

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
								/* translators: 1: FAQm-age URL */
								__( 'This is a your wallet address. Authors need wallet addresses to sign articles, and editors need wallet addresses to sign and index posts to the blockchain. If you change your wallet address, you or your team may <a href="%1$s">lose access to your newsroom</a>, so be sure to verify that this address is correct.', 'civil' ),
								[ 'a' => [ 'href' => [] ] ]
							),
							esc_url( menu_page_url( HELP_PAGE, false ) . '#TODO' )
						);
					?>
					</p>
					<p><a href="<?php esc_url( menu_page_url( HELP_PAGE ) ); ?>#TODO"><?php esc_html_e( 'Learn more about wallet addresses' ); ?></a>.</p>
				</div>
			</td>
		</tr>
	</table>
	<?php
}
add_action( 'show_user_profile', __NAMESPACE__ . '\show_profile_fields' );
add_action( 'edit_user_profile', __NAMESPACE__ . '\show_profile_fields' );

/**
 * Print any errors from updating user profile.
 *
 * @param object $errors Errors object to add any custom errors to.
 * @param bool   $update True if updating an existing user, false if saving a new user.
 * @param object $user User object for user being edited.
 */
function user_profile_update_errors( $errors, $update, $user ) {
	if (
		isset( $_POST[ USER_ETH_ADDRESS_META_KEY ], $_POST['civil_newsroom_protocol_eth_wallet_address_nonce'] )
		&& wp_verify_nonce( sanitize_key( $_POST['civil_newsroom_protocol_eth_wallet_address_nonce'] ), 'civil_newsroom_protocol_update_wallet_address_action' )
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
		isset( $_POST[ USER_ETH_ADDRESS_META_KEY ], $_POST['civil_newsroom_protocol_eth_wallet_address_nonce'] )
		&& wp_verify_nonce( sanitize_key( $_POST['civil_newsroom_protocol_eth_wallet_address_nonce'] ), 'civil_newsroom_protocol_update_wallet_address_action' )
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

	// Just for debugging by superadmins - non-superadmins have to go through the dedicated Newsroom Management page.
	if ( is_super_admin() ) {
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
			'type' => 'string',
			'single' => true,
			'show_in_rest' => true,
			'sanitize_callback' => __NAMESPACE__ . '\validate_newsroom_address',
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
			'sanitize_callback' => __NAMESPACE__ . '\validate_newsroom_txhash',
		)
	);
}
add_action( 'rest_api_init', __NAMESPACE__ . '\newsroom_txhash_register_setting' );

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
	<?php
}

/**
 * Validate newsroom address.
 *
 * @param string $input Newsroom address to validate.
 * @return string Validated/sanitized newsroom address.
 */
function validate_newsroom_address( $input ) {
	if ( ! $input ) {
		return;
	}

	$addr = sanitize_text_field( $input );

	if ( ! is_valid_eth_address( $addr ) ) {
		add_settings_error(
			NEWSROOM_ADDRESS_OPTION_KEY,
			'civil_newsroom_protocol_newsroom_address_err',
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
 * Validate newsroom txhash.
 *
 * @param string $input Newsroom txhash to validate.
 * @return string Validated/sanitized newsroom address.
 */
function validate_newsroom_txhash( $input ) {
	if ( ! $input ) {
		return;
	}

	$txhash = sanitize_text_field( $input );

	if ( ! is_valid_txhash( $txhash ) ) {
		add_settings_error(
			NEWSROOM_TXHASH_OPTION_KEY,
			'civil_newsroom_protocol_newsroom_txhash_err',
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
		'post', SIGNATURES_META_KEY, array(
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string', // Actually will be stringified JSON.
		)
	);
	register_meta(
		'post', REVISIONS_META_KEY, array(
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string', // Actually will be stringified JSON.
		)
	);
	register_meta(
		'post', POST_AUTHORS_META_KEY, array(
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string', // Actually will be stringified JSON.
		)
	);
	register_meta(
		'post', CONTENT_ID_META_KEY, array(
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
		)
	);
	register_meta(
		'post', TXHASH_META_KEY, array(
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
		)
	);
}
add_action( 'admin_init', __NAMESPACE__ . '\expose_article_meta' );
add_action( 'rest_api_init', __NAMESPACE__ . '\expose_article_meta' );
