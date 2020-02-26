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
				'type' => 'Secp256k1VerificationKey2018',
				'owner' => "did:web:$domain",
				'publicKeyHex' => '@TODO/tobek get actual pub key',
			),
		),
		'authentication' => array(
			array(
				'type' => 'Secp256k1SignatureAuthentication2018',
				'publicKey' => "did:web:$domain#owner",
			),
		),
	)
);
