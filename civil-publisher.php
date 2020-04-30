<?php
/**
 * Plugin Name: Civil Publisher Tools
 * Plugin URI: https://github.com/joincivil/civil-publisher-wordpress-plugin
 * Description: Use Civil's growing suite of publisher tools, including: Boosts, to let readers easily support to your newsroom from any article; Credibility Indicators, to educate readers about what work goes into good journalism, and our smart contract tools (experimental) to publish and archive content on the Ethereum blockchain.
 * Version: 1.1.0
 * Author: Civil
 * Author URI: https://civil.co
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

const CIVIL_FIRST_FLEET_STATIC_VERSION = '1.0.3';
const PLUGIN_FILE = __FILE__;
const REST_API_NAMESPACE = 'civil-publisher/v1';
const SCHEMA_VERSION = '0.0.1';
const ASSETS_VERSION = '1.5.2';

// Post meta.
const REVISION_HASH_META_KEY = 'civil_publisher_revision_hash';
const REVISION_DATA_META_KEY = 'civil_publisher_revision_extra_data';
const SIGNATURES_META_KEY = 'civil_publisher_article_signatures';
const REVISIONS_META_KEY = 'civil_publisher_published_revisions';
const TXHASH_META_KEY = 'civil_publisher_publish_tx_hash';
const IPFS_META_KEY = 'civil_publisher_publish_ipfs';
const ARCHIVE_STATUS_META_KEY = 'civil_publisher_publish_archive_status';
const CONTENT_ID_META_KEY = 'civil_publisher_content_id';
const POST_AUTHORS_META_KEY = 'civil_publisher_post_authors';
const SHOW_STORY_BOOST_META_KEY = 'civil_publisher_show_story_boost';

// User meta.
const USER_ETH_ADDRESS_META_KEY = 'civil_publisher_eth_wallet_address';
const USER_NEWSROOM_ROLE_META_KEY = 'civil_publisher_newsroom_role';

// Site options.
const NEWSROOM_ADDRESS_OPTION_KEY = 'civil_publisher_newsroom_address';
const NEWSROOM_TXHASH_OPTION_KEY = 'civil_publisher_newsroom_txhash';
const NEWSROOM_CHARTER_OPTION_KEY = 'civil_publisher_newsroom_charter';
const NETWORK_NAME_OPTION_KEY = 'civil_publisher_network_name';
const STORY_BOOSTS_PRIORITY = 'civil_publisher_story_boosts_priority';
const STORY_BOOSTS_PRIORITY_DEFAULT = 5;
const STORY_BOOSTS_ENABLE_BY_DEFAULT = 'civil_publisher_story_boosts_enable_by_default';
const STORY_BOOSTS_ENABLE_BY_DEFAULT_DEFAULT = false;

const DID_IS_ENABLED_OPTION_KEY = 'civil_publisher_did_is_enabled';
const DID_IS_ENABLED_DEFAULT = true;
const DID_ERROR_OPTION_KEY = 'civil_publisher_did_error';
const ASSIGNED_DID_OPTION_KEY = 'civil_publisher_assigned_did';
const VC_LOG_OPTION_KEY = 'civil_publisher_vc_log';
const DID_AGENT_BASE_URL_OPTION_KEY = 'civil_publisher_did_agent_base_url';
const DID_AGENT_BASE_URL_DEFAULT = 'http://10.0.2.2:3000';

const FAQ_HOME = 'https://help.civil.co/hc/en-us/categories/360001540371-Publisher';
const STORY_BOOSTS_DEBUG_QS_FLAG = 'civil_story_boost_debug';

// Menus.
const TOP_LEVEL_MENU = 'civil-publisher-menu';
const MANAGEMENT_PAGE = 'civil-publisher-newsroom-management';
const CONTENT_VIEWER = 'civil-publisher-content';
const STORY_BOOSTS_SETTINGS_PAGE = 'civil-publisher-story-boosts-settings';
const DID_SETTINGS_PAGE = 'civil-publisher-did-settings';
const CREDIBILITY_INDICATORS = 'civil-publisher-credibiity-indicators';

const STORY_BOOST_SRC_STAGING = 'https://staging.civil.app/loader/boost.js';
const STORY_BOOST_SRC_PROD = 'https://registry.civil.co/loader/boost.js';

require_once dirname( __FILE__ ) . '/utils.php';

require_once dirname( __FILE__ ) . '/traits/trait-singleton.php';

require_once dirname( __FILE__ ) . '/custom-meta.php';
require_once dirname( __FILE__ ) . '/admin.php';
require_once dirname( __FILE__ ) . '/users-page.php';
require_once dirname( __FILE__ ) . '/story-boosts.php';
require_once dirname( __FILE__ ) . '/did-vc.php';
require_once dirname( __FILE__ ) . '/classes/class-post-vc-gen.php';

if ( is_manager_enabled() ) {
	require_once dirname( __FILE__ ) . '/classes/class-post-hashing.php';
	require_once dirname( __FILE__ ) . '/classes/class-rest-api.php';
}

require_once dirname( __FILE__ ) . '/classes/class-credibility-indicators.php';
