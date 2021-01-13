<?php
/**
 * Output DID document.
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

$did = get_option( ASSIGNED_DID_OPTION_KEY );

if ( empty( $did ) ) {
	status_header( 500 );
	echo '{"error":"DID has not yet been initialized or there was an error initializing it."}';
	return;
}

echo json_encode(
	array(
		'@context' => 'https://w3id.org/did/v1',
		'id' => $did,
		'publicKey' => array(
			array(
				'id' => "$did#owner",
				'type' => 'RsaVerificationKey2018',
				'owner' => $did,
				'publicKeyPem' => '@TODO',
			),
		),
		'authentication' => array(
			array(
				'type' => 'RsaSignatureAuthentication2018',
				'publicKey' => "$did#owner",
			),
		),
	)
);
