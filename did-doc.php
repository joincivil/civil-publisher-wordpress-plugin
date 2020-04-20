<?php
/**
 * Output DID document.
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

$domain = preg_replace( '/^https?:\/\//', '', get_option( 'siteurl' ) );

echo json_encode(
	array(
		'@context' => 'https://w3id.org/did/v1',
		'id' => "did:web:$domain",
		'publicKey' => array(
			array(
				'id' => "did:web:$domain#owner",
				'type' => 'RsaVerificationKey2018',
				'owner' => "did:web:$domain",
				'publicKeyPem' => get_option( OPTION_DID_RSA_PUBLIC_KEY ),
			),
		),
		'authentication' => array(
			array(
				'type' => 'RsaSignatureAuthentication2018',
				'publicKey' => "did:web:$domain#owner",
			),
		),
	)
);
