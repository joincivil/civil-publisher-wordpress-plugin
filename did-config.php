<?php
/**
 * Output DID configuration.
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

$did_config = esc_js( get_option( DID_CONFIG_OPTION_KEY ) );

if ( empty( $did_config ) ) {
	status_header( 500 );
	echo '{"error":"DID configuration has not yet been initialized or there was an error initializing it."}';
} else {
	echo $did_config;
}
