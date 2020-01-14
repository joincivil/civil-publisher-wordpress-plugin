<?php
/**
 * Plugin Name: Civil Publisher Tools
 * Plugin URI: https://github.com/joincivil/civil-publisher-wordpress-plugin
 * Description: Use Civil's growing suite of publisher tools, including: Boosts, to let readers easily support to your newsroom from any article; Credibility Indicators, to educate readers about what work goes into good journalism, and our smart contract tools (experimental) to publish and archive content on the Ethereum blockchain.
 * Version: 0.7.1
 * Author: Civil
 * Author URI: https://civil.co
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

define( __NAMESPACE__ . '\PATH', dirname( __FILE__ ) );
define( __NAMESPACE__ . '\REST_API_NAMESPACE', 'civil-publisher/v1' );
define( __NAMESPACE__ . '\SCHEMA_VERSION', '0.0.1' );
define( __NAMESPACE__ . '\ASSETS_VERSION', '1.5.2' );

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
define( __NAMESPACE__ . '\SHOW_STORY_BOOST_META_KEY', 'civil_publisher_show_story_boost' );

// User meta.
define( __NAMESPACE__ . '\USER_ETH_ADDRESS_META_KEY', 'civil_publisher_eth_wallet_address' );
define( __NAMESPACE__ . '\USER_NEWSROOM_ROLE_META_KEY', 'civil_publisher_newsroom_role' );

// Site options.
define( __NAMESPACE__ . '\NEWSROOM_ADDRESS_OPTION_KEY', 'civil_publisher_newsroom_address' );
define( __NAMESPACE__ . '\NEWSROOM_TXHASH_OPTION_KEY', 'civil_publisher_newsroom_txhash' );
define( __NAMESPACE__ . '\NEWSROOM_CHARTER_OPTION_KEY', 'civil_publisher_newsroom_charter' );
define( __NAMESPACE__ . '\NETWORK_NAME_OPTION_KEY', 'civil_publisher_network_name' );
define( __NAMESPACE__ . '\STORY_BOOSTS_PRIORITY', 'civil_publisher_story_boosts_priority' );
define( __NAMESPACE__ . '\STORY_BOOSTS_PRIORITY_DEFAULT', 5 );
define( __NAMESPACE__ . '\STORY_BOOSTS_ENABLE_BY_DEFAULT', 'civil_publisher_story_boosts_enable_by_default' );
define( __NAMESPACE__ . '\STORY_BOOSTS_ENABLE_BY_DEFAULT_DEFAULT', false );

define( __NAMESPACE__ . '\FAQ_HOME', 'https://help.civil.co/hc/en-us/categories/360001540371-Publisher' );
define( __NAMESPACE__ . '\STORY_BOOSTS_DEBUG_QS_FLAG', 'civil_story_boost_debug' );

// Menus.
define( __NAMESPACE__ . '\TOP_LEVEL_MENU', 'civil-publisher-menu' );
define( __NAMESPACE__ . '\MANAGEMENT_PAGE', 'civil-publisher-newsroom-management' );
define( __NAMESPACE__ . '\CONTENT_VIEWER', 'civil-publisher-content' );
define( __NAMESPACE__ . '\STORY_BOOSTS_SETTINGS', 'civil-publisher-story-boosts-settings' );
define( __NAMESPACE__ . '\CREDIBILITY_INDICATORS', 'civil-publisher-credibiity-indicators' );

define( __NAMESPACE__ . '\STORY_BOOST_SRC_STAGING', 'https://staging.civil.app/loader/boost.js' );
define( __NAMESPACE__ . '\STORY_BOOST_SRC_PROD', 'https://registry.civil.co/loader/boost.js' );

require_once dirname( __FILE__ ) . '/utils.php';

require_once dirname( __FILE__ ) . '/traits/trait-singleton.php';

require_once dirname( __FILE__ ) . '/custom-meta.php';
require_once dirname( __FILE__ ) . '/admin.php';
require_once dirname( __FILE__ ) . '/users-page.php';
require_once dirname( __FILE__ ) . '/story-boosts.php';

if ( is_manager_enabled() ) {
	require_once dirname( __FILE__ ) . '/classes/class-post-hashing.php';
	require_once dirname( __FILE__ ) . '/classes/class-rest-api.php';
}

require_once dirname( __FILE__ ) . '/classes/class-credibility-indicators.php';
