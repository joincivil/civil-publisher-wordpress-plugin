<?php
/**
 * Plugin Name: Civil Newsroom
 * Description: Manage your newsroom smart contract, apply to the Civil token-curated registry of ethical newsrooms, and use the Civil protocol to publish content on the Ethereum blockchain.
 * Version: 0.1
 * Author: Civil
 * Author URI: https://civil.co
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

define( __NAMESPACE__ . '\PATH', dirname( __FILE__ ) );
define( __NAMESPACE__ . '\REST_API_NAMESPACE', 'civil-newsroom-protocol/v1' );
define( __NAMESPACE__ . '\SCHEMA_VERSION', '0.0.1' );
define( __NAMESPACE__ . '\ASSETS_VERSION', '1.1.6' );
// Post meta.
define( __NAMESPACE__ . '\REVISION_HASH_META_KEY', 'civil_newsroom_protocol_revision_hash' );
define( __NAMESPACE__ . '\REVISION_DATA_META_KEY', 'civil_newsroom_protocol_revision_extra_data' );
define( __NAMESPACE__ . '\SIGNATURES_META_KEY', 'civil_newsroom_protocol_article_signatures' );
define( __NAMESPACE__ . '\REVISIONS_META_KEY', 'civil_newsroom_protocol_published_revisions' );
define( __NAMESPACE__ . '\TXHASH_META_KEY', 'civil_newsroom_protocol_publish_tx_hash' );
define( __NAMESPACE__ . '\CONTENT_ID_META_KEY', 'civil_newsroom_protocol_content_id' );

// User meta.
define( __NAMESPACE__ . '\USER_ETH_ADDRESS_META_KEY', 'civil_newsroom_protocol_eth_wallet_address' );

// Site options.
define( __NAMESPACE__ . '\NEWSROOM_ADDRESS_OPTION_KEY', 'civil_newsroom_protocol_newsroom_address' );
define( __NAMESPACE__ . '\NEWSROOM_TXHASH_OPTION_KEY', 'civil_newsroom_protocol_newsroom_txhash' );

// Menus.
define( __NAMESPACE__ . '\TOP_LEVEL_MENU', 'civil-newsroom-protocol-menu' );
define( __NAMESPACE__ . '\MANAGEMENT_PAGE', 'civil-newsroom-protocol-management' );
define( __NAMESPACE__ . '\WALLET_PAGE', 'civil-newsroom-protocol-wallets' );
define( __NAMESPACE__ . '\HELP_PAGE', 'civil-newsroom-protocol-help' );

/**
 * Gets the blockchain enabled post types.
 *
 * @return array The supported post types.
 */
function get_blockchain_post_types() {
	/**
	 * Filters the post types available for blockchain support
	 *
	 * @param $post_types The supported post types.
	 */
	return apply_filters( 'get_blockchain_post_types', [ 'post' ] );
}

require_once dirname( __FILE__ ) . '/traits/trait-singleton.php';

require_once dirname( __FILE__ ) . '/custom-meta.php';
require_once dirname( __FILE__ ) . '/admin.php';
require_once dirname( __FILE__ ) . '/users-page.php';

require_once dirname( __FILE__ ) . '/classes/class-post-hashing.php';
require_once dirname( __FILE__ ) . '/classes/class-rest-api.php';
