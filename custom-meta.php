<?php
/**
 * Handles custom user and site meta
 *
 * @package Civil_Newsroom
 */

namespace Civil;

/**
 * Check if given string is a valid hex ETH wallet address.
 *
 * @param string $addr Address to check.
 * @return bool  Whether or not address is valid hex ETH wallet address.
 */
function is_valid_eth_address( $addr ) {
	return preg_match( '/^(0x)?[0-9a-f]{40}$/i', $addr );
}

/**
 * Output custom fields for user profile.
 *
 * @param object $user A WP_User object.
 */
function civil_show_profile_fields( $user ) {
	$wallet_address = get_the_author_meta( USER_ETH_ADDRESS_META_KEY, $user->ID );
	wp_nonce_field( 'civil_update_wallet_address_action', 'civil_eth_wallet_address_nonce' );
	?>
	<h3><?php esc_html_e( 'Civil Identity', 'civil' ); ?></h3>

	<table class="form-table">
		<tr>
			<th><label for="<?php echo esc_attr( USER_ETH_ADDRESS_META_KEY ); ?>"><?php esc_html_e( 'ETH wallet address', 'civil' ); ?></label></th>
			<td>
				<input type="text"
					size="42"
					id="<?php echo esc_attr( USER_ETH_ADDRESS_META_KEY ); ?>"
					name="<?php echo esc_attr( USER_ETH_ADDRESS_META_KEY ); ?>"
					value="<?php echo esc_attr( $wallet_address ); ?>"
					placeholder="0xabc123"
					class="regular-text"
				/>
			</td>
		</tr>
	</table>
	<?php
}
add_action( 'show_user_profile', __NAMESPACE__ . '\civil_show_profile_fields' );
add_action( 'edit_user_profile', __NAMESPACE__ . '\civil_show_profile_fields' );

/**
 * Print any errors from updating user profile.
 *
 * @param object $errors Errors object to add any custom errors to.
 * @param bool   $update True if updating an existing user, false if saving a new user.
 * @param object $user User object for user being edited.
 */
function civil_user_profile_update_errors( $errors, $update, $user ) {
	if (
		isset( $_POST[ USER_ETH_ADDRESS_META_KEY ], $_POST['civil_eth_wallet_address_nonce'] )
		&& wp_verify_nonce( sanitize_key( $_POST['civil_eth_wallet_address_nonce'] ), 'civil_update_wallet_address_action' )
	) {
		$addr = sanitize_text_field( wp_unslash( $_POST[ USER_ETH_ADDRESS_META_KEY ] ) );
		if ( ! is_valid_eth_address( $addr ) ) {
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
add_action( 'user_profile_update_errors', __NAMESPACE__ . '\civil_user_profile_update_errors', 10, 3 );

/**
 * Handle update of custom user profile fields.
 *
 * @param int $user_id ID of user.
 */
function civil_update_profile_fields( $user_id ) {
	if ( ! current_user_can( 'edit_user', $user_id ) ) {
		return false;
	}

	if (
		isset( $_POST[ USER_ETH_ADDRESS_META_KEY ], $_POST['civil_eth_wallet_address_nonce'] )
		&& wp_verify_nonce( sanitize_key( $_POST['civil_eth_wallet_address_nonce'] ), 'civil_update_wallet_address_action' )
	) {
		$addr = sanitize_text_field( wp_unslash( $_POST[ USER_ETH_ADDRESS_META_KEY ] ) );
		if ( is_valid_eth_address( $addr ) ) {
			update_user_meta( $user_id, USER_ETH_ADDRESS_META_KEY, $addr );
		} else {
			delete_user_meta( $user_id, USER_ETH_ADDRESS_META_KEY );
		}
	}
}
add_action( 'personal_options_update', __NAMESPACE__ . '\civil_update_profile_fields' );
add_action( 'edit_user_profile_update', __NAMESPACE__ . '\civil_update_profile_fields' );

/** Return custom user meta in REST API (also makes available in Gutenberg). */
function civil_add_user_meta_rest() {
	register_rest_field(
		'user',
		USER_ETH_ADDRESS_META_KEY,
		array(
			'get_callback'      => __NAMESPACE__ . '\civil_user_meta_callback',
			'update_callback'   => null,
			'schema'            => null,
		)
	);
}
/**
 * Actually get custom user meta.
 *
 * @param object $user A WP_User object.
 * @param string $field_name Name of meta field being retrieved.
 * @return string Contents of meta field.
 */
function civil_user_meta_callback( $user, $field_name ) {
	return get_user_meta( $user['id'], $field_name, true );
}
add_action( 'rest_api_init', __NAMESPACE__ . '\civil_add_user_meta_rest' );


/** Register and add newsroom address field. */
function civil_newsroom_address_init() {
	civil_newsroom_address_register_setting();
	add_settings_field(
		'civil_newsroom_address_id',
		__( 'Newsroom Contract Address', 'civil' ),
		__NAMESPACE__ . '\civil_newsroom_address_input',
		'general',
		'default'
	);

}
/** Register newsroom address setting. */
function civil_newsroom_address_register_setting() {
	register_setting(
		'general',
		NEWSROOM_ADDRESS_OPTION_KEY,
		array(
			'type' => 'string',
			'show_in_rest' => array(
				'name' => 'newsroom_address',
			),
			'sanitize_callback' => __NAMESPACE__ . '\civil_validate_newsroom_address',
		)
	);
}
/** Output form for capturing newsroom address. */
function civil_newsroom_address_input() {
	$value = get_option( NEWSROOM_ADDRESS_OPTION_KEY );
	?>
	<input type="text"
		size="42"
		id="civil_newsroom_address_id"
		name="civil_newsroom_address"
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
function civil_validate_newsroom_address( $input ) {
	if ( ! $input ) {
		return;
	}

	$addr = sanitize_text_field( $input );

	if ( ! is_valid_eth_address( $addr ) ) {
		add_settings_error(
			NEWSROOM_ADDRESS_OPTION_KEY,
			'civil_newsroom_address_err',
			sprintf(
				/* translators: %1 is ETH contract address e.g. "0xabc123..." */
				__( 'Newsroom Contract Address "%1$s" is not a valid ETH address' ),
				$addr
			),
			'error'
		);
		return '';
	}

	return $addr;
}
add_action( 'admin_init', __NAMESPACE__ . '\civil_newsroom_address_init' );
add_action( 'rest_api_init', __NAMESPACE__ . '\civil_newsroom_address_register_setting' );

/** Make custom post meta visible/editable in REST API and Gutenberg. */
function civil_expose_article_meta() {
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
		'post', CONTENT_ID_META_KEY, array(
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
		)
	);
}
add_action( 'admin_init', __NAMESPACE__ . '\civil_expose_article_meta' );
add_action( 'rest_api_init', __NAMESPACE__ . '\civil_expose_article_meta' );
