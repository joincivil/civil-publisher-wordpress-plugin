<?php
/**
 * Output DID configuration.
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

$did_config = get_option( DID_CONFIG_OPTION_KEY );

if ( empty( $did_config ) ) {
	status_header( 500 );
	echo '{"error":"DID configuration has not yet been initialized or there was an error initializing it."}';
} else {
	// Kind of dumb to decode then encode but seems like the only way to satisfy WordPress.Security.EscapeOutput.OutputNotEscaped - esc_js and esc_html etc. each mess up JSON in their own way.
	echo wp_json_encode( json_decode( $did_config ), JSON_UNESCAPED_SLASHES );
}
