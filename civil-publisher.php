<?php
/**
 * Plugin Name: Civil Publisher
 * Description: Manage your newsroom smart contract, apply to the Civil token-curated registry of ethical newsrooms, and use the Civil protocol to publish and archive content on the Ethereum blockchain.
 * Version: 0.5.0
 * Author: Civil
 * Author URI: https://civil.co
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

define( __NAMESPACE__ . '\PATH', dirname( __FILE__ ) );
define( __NAMESPACE__ . '\REST_API_NAMESPACE', 'civil-publisher/v1' );
define( __NAMESPACE__ . '\SCHEMA_VERSION', '0.0.1' );
define( __NAMESPACE__ . '\ASSETS_VERSION', '1.5.0' );

// Post meta.
define( __NAMESPACE__ . '\REVISION_HASH_META_KEY', 'civil_publisher_revision_hash' );
define( __NAMESPACE__ . '\REVISION_DATA_META_KEY', 'civil_publisher_revision_extra_data' );
define( __NAMESPACE__ . '\SIGNATURES_META_KEY', 'civil_publisher_article_signatures' );
define( __NAMESPACE__ . '\REVISIONS_META_KEY', 'civil_publisher_published_revisions' );
define( __NAMESPACE__ . '\TXHASH_META_KEY', 'civil_publisher_publish_tx_hash' );
define( __NAMESPACE__ . '\IPFS_META_KEY', 'civil_publisher_publish_ipfs' );
define( __NAMESPACE__ . '\ARCHIVE_STATUS_META_KEY', 'civil_publisher_publish_archive_status' );
define( __NAMESPACE__ . '\CONTENT_ID_META_KEY', 'civil_publisher_content_id' );
define( __NAMESPACE__ . '\POST_AUTHORS_META_KEY', 'civil_publisher_post_authors' );

// User meta.
define( __NAMESPACE__ . '\USER_ETH_ADDRESS_META_KEY', 'civil_publisher_eth_wallet_address' );
define( __NAMESPACE__ . '\USER_NEWSROOM_ROLE_META_KEY', 'civil_publisher_newsroom_role' );

// Site options.
define( __NAMESPACE__ . '\NEWSROOM_ADDRESS_OPTION_KEY', 'civil_publisher_newsroom_address' );
define( __NAMESPACE__ . '\NEWSROOM_TXHASH_OPTION_KEY', 'civil_publisher_newsroom_txhash' );
define( __NAMESPACE__ . '\NEWSROOM_CHARTER_OPTION_KEY', 'civil_publisher_newsroom_charter' );
define( __NAMESPACE__ . '\NETWORK_NAME_OPTION_KEY', 'civil_publisher_network_name' );

define( __NAMESPACE__ . '\FAQ_HOME', 'https://cvlconsensys.zendesk.com/hc/en-us/categories/360001000232-Journalists' );

// Menus.
define( __NAMESPACE__ . '\TOP_LEVEL_MENU', 'civil-publisher-menu' );
define( __NAMESPACE__ . '\MANAGEMENT_PAGE', 'civil-publisher-newsroom-management' );
define( __NAMESPACE__ . '\CONTENT_VIEWER', 'civil-publisher-content' );
define( __NAMESPACE__ . '\CREDIBILITY_INDICATORS', 'civil-publisher-credibiity-indicators' );

require_once dirname( __FILE__ ) . '/utils.php';

require_once dirname( __FILE__ ) . '/traits/trait-singleton.php';

require_once dirname( __FILE__ ) . '/custom-meta.php';
require_once dirname( __FILE__ ) . '/admin.php';
require_once dirname( __FILE__ ) . '/users-page.php';

require_once dirname( __FILE__ ) . '/classes/class-post-hashing.php';
require_once dirname( __FILE__ ) . '/classes/class-rest-api.php';
require_once dirname( __FILE__ ) . '/classes/class-credibility-indicators.php';
