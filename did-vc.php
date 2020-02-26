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
	add_filter( 'template_include', __NAMESPACE__ . '\include_template' );
	add_filter( 'init', __NAMESPACE__ . '\rewrite_rules' );

	if ( current_user_can( 'manage_options' ) && empty( get_option( DID_RSA_PRIVATE_KEY ) ) ) {
		try {
			init_key_pair();
		} catch ( Exception $e ) {
			// @TODO/tobek Surface this error in admin. If missing openssl configs are a problem in the wild, consider using phpseclib instead.
			update_option( DID_RSA_KEY_ERROR, 'Failed to generate openssl key pair: ' . $e->getMessage() );
		}
	}
}

/**
 * Init DID key pair and save in database.
 *
 * Note that we store the DID private key in plain text in the database. This is of course awfully insecure, but if we want to be able to publish VCs without user interaction then the plugin needs access to the private key somehow. We could do various things to superficially harden the key but they are all either too brittle (e.g. using user's login password as encryption key would break if user loses password and resets it, while using wp-config.php salts as encryption key would break if user migrates to a new WP install) or trivial to defeat (storing encryption key in plugin to encrypt value stored in DB sounds nice, but anyone with access to the DB could trivially google the option name and find this open source plugin and decrypt from there). Even something fancy that required user-held secrets and user interaction for every action (e.g. signing in metamask) could be vulnerable to spoofed requests if the site is compromised. Fundamentally this private key does not protect anything special at the moment; it's more of an identifier. This can be revisited in the future.
 */
function init_key_pair() {
	$key = openssl_pkey_new(
		array(
			'digest_alg' => 'sha512',
			'private_key_bits' => 4096,
			'private_key_type' => OPENSSL_KEYTYPE_RSA,
		)
	);

	openssl_pkey_export( $key, $private_key );

	$public_key = openssl_pkey_get_details( $key );
	$public_key = $public_key['key'];

	if ( $private_key && $public_key ) {
		delete_option( DID_RSA_KEY_ERROR );
		update_option( DID_RSA_PRIVATE_KEY, $private_key );
		update_option( DID_RSA_PUBLIC_KEY, $public_key );
	} else {
		update_option( DID_RSA_KEY_ERROR, 'Failed to generate openssl key pair: generated keys are falsey.' );
	}
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

