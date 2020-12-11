<?php
/**
 * Handles API requests to DAF server.
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

/**
 * The Daf_Service class.
 */
class Daf_Service {
	use Singleton;

	/**
	 * Set up the class.
	 */
	public function setup() {
	}

	/**
	 * Call identityManagerGetOrCreateIdentity endpoint.
	 *
	 * @param array $body Request body.
	 * @throws \Exception Errors from API request.
	 * @return array Response body.
	 */
	public function identity_manager_get_or_create_identity( $body ) {
		return $this->request( '/identityManagerGetOrCreateIdentity', $body );
	}

	/**
	 * Call createVerifiableCredential endpoint.
	 *
	 * @param array $body Request body.
	 * @throws \Exception Errors from API request.
	 * @return array Response body.
	 */
	public function create_verifiable_credential( $body ) {
		return $this->request( '/createVerifiableCredential', $body );
	}

	/**
	 * Call arbitrary endpoint.
	 *
	 * @param string $path Request path.
	 * @param array  $body Request body.
	 * @throws \Exception Errors from API request.
	 * @return array Response body.
	 */
	public function request( $path, $body = null ) {
		$args = null;
		if ( $body ) {
			$args = array(
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body' => json_encode( $body ),
			);
		}

		$url = get_option( DAF_BASE_URL_OPTION_KEY ) . $path;
		$res = wp_remote_post( $url, $args );

		if ( is_wp_error( $res ) ) {
			$err = sprintf(
				'Error making request to DAF at %s: %s',
				$url,
				json_encode( $res )
			);
			error_log( $err );
			throw new \Exception( $err );
		} else if ( $res['response']['code'] < 200 || $res['response']['code'] > 299 ) {
			$err = sprintf(
				'[%d] Error response from DAF at %s: %s',
				$res['response']['code'],
				$url,
				$res['response']['message'] . ( isset( $res['body'] ) ? ( " ($res[body])" ) : '' )
			);
			error_log( $err );
			throw new \Exception( $err );
		}

		return json_decode( $res['body'] );
	}
}

if ( get_option( DID_IS_ENABLED_OPTION_KEY, DID_IS_ENABLED_DEFAULT ) ) {
	Daf_Service::instance();
}
