<?php
/**
 * Plugin Name: ConsenSys VC Publisher
 * Plugin URI: https://github.com/joincivil/civil-publisher-wordpress-plugin
 * Description: Self-sovereign identity tools for WordPress
 * Version: 0.2
 * Author: ConsenSys
 * Author URI: https://consensys.net/
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

const PLUGIN_FILE = __FILE__;
const SCHEMA_VERSION = '0.0.1';

// Post meta.
const POST_UUID_META_KEY = 'consensys_vc_publisher_post_uuid';
const LAST_VC_PUB_DATE_META_KEY = 'consensys_vc_publisher_last_vc_pub_date';
const POST_VC_META_KEY = 'consensys_vc_publisher_post_vc';

// Site options.
const DID_IS_ENABLED_OPTION_KEY = 'consensys_vc_publisher_did_is_enabled';
const DID_IS_ENABLED_DEFAULT = true;
const DID_ERROR_OPTION_KEY = 'consensys_vc_publisher_did_error';
const ASSIGNED_DID_OPTION_KEY = 'consensys_vc_publisher_assigned_did';
const DID_CONFIG_OPTION_KEY = 'consensys_vc_publisher_did_config';
const VC_LOG_OPTION_KEY = 'consensys_vc_publisher_vc_log';
const DAF_BASE_URL_OPTION_KEY = 'consensys_vc_publisher_daf_base_url';
const PUB_VC_BY_DEFAULT_ON_NEW_OPTION_KEY = 'consensys_vc_publisher_pub_vc_by_default_on_new';
const PUB_VC_BY_DEFAULT_ON_NEW_DEFAULT = true;
const PUB_VC_BY_DEFAULT_ON_UPDATE_OPTION_KEY = 'consensys_vc_publisher_pub_vc_by_default_on_update';
const PUB_VC_BY_DEFAULT_ON_UPDATE_DEFAULT = false;

const PUB_VC_POST_FLAG = 'consensys_vc_publisher_pub_vc';
const UUID_PERMALINK_QUERY = 'consensys_vc_publisher_uuid';
const RAW_CONTENT_QUERY = 'consensys_vc_publisher_raw_content';
const DID_DOC_QUERY = 'consensys_vc_publisher_did_doc';
const DID_CONFIG_QUERY = 'consensys_vc_publisher_did_config';

// Menus.
const TOP_LEVEL_MENU = 'consensys-vc-publisher-menu';
const DID_SETTINGS_PAGE = 'consensys-vc-publisher-did-settings';

const FAQ_HOME = '#@TODO';

require_once dirname( __FILE__ ) . '/utils.php';

require_once dirname( __FILE__ ) . '/traits/trait-singleton.php';

require_once dirname( __FILE__ ) . '/admin.php';
require_once dirname( __FILE__ ) . '/did-vc.php';
require_once dirname( __FILE__ ) . '/classes/class-daf-service.php';
require_once dirname( __FILE__ ) . '/classes/class-post-vc-pub.php';
