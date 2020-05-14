<?php
/**
 * Miscellaneous utility functions.
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

/**
 * Gets the post types this plugin should support.
 *
 * @return array The supported post types.
 */
function get_plugin_post_types() {
	/**
	 * Filters the post types available for blockchain support
	 *
	 * @param $post_types The supported post types.
	 */
	return apply_filters( 'consensys_vc_publisher_post_types', array( 'post', 'page' ) );
}

/**
 * Generates a UUID v4 value. Code via https://stackoverflow.com/a/15875555/458614.
 *
 * @throws \Exception If no suitable random bytes generator is available (pre-PHPv7 with neither openssl nor mcrypt).
 * @return string The UUID.
 */
function generate_uuid_v4() {
	if ( function_exists( 'random_bytes' ) ) {
		// PHP v7.
		$data = random_bytes( 16 );
	} else if ( function_exists( 'mcrypt_create_iv' ) ) {
		$data = mcrypt_create_iv( 16, MCRYPT_DEV_URANDOM );
	} else if ( function_exists( 'openssl_random_pseudo_bytes' ) ) {
		$data = openssl_random_pseudo_bytes( 16 );
	} else {
		// Extremely unlikely to have neither openssl or mcrypt enabled but theoretically possible.
		throw new \Exception( 'No suitable method for generating random bytes for UUID' );
	}

	$data[6] = chr( ord( $data[6] ) & 0x0f | 0x40 ); // set version to 0100.
	$data[8] = chr( ord( $data[8] ) & 0x3f | 0x80 ); // set bits 6-7 to 10.

	return vsprintf( '%s%s-%s-%s-%s-%s%s%s', str_split( bin2hex( $data ), 4 ) );
}

/**
 * Retrieves the timezone from site settings as a `DateTimeZone` object.
 *
 * @return DateTimeZone Timezone object.
 */
function get_site_timezone() {
	if ( function_exists( 'wp_timezone' ) ) {
		// WordPress v5.3.0 or later.
		return wp_timezone();
	}

	// For older versions that don't have them, copy-pasting code from `wp_timezone` and `wp_timezone_string`.

	$timezone_string = get_option( 'timezone_string' );

	if ( ! $timezone_string ) {
		$offset  = (float) get_option( 'gmt_offset' );
		$hours   = (int) $offset;
		$minutes = ( $offset - $hours );

		$sign      = ( $offset < 0 ) ? '-' : '+';
		$abs_hour  = abs( $hours );
		$abs_mins  = abs( $minutes * 60 );
		$timezone_string = sprintf( '%s%02d:%02d', $sign, $abs_hour, $abs_mins );
	}

	return new \DateTimeZone( $timezone_string );
}
