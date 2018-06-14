<?php
if ( ! defined( 'WP_CONTENT_DIR' ) ) {
    $cwd = explode( 'wp-content', dirname( __FILE__ ) );
    define( 'WP_CONTENT_DIR', $cwd[0] . '/wp-content' );
}

// Load Core's test suite
$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( !$_tests_dir ) {
    $_tests_dir = '/tmp/wordpress-tests-lib';
}

require_once $_tests_dir . '/includes/functions.php';


/**
 * Setup our environment (theme, plugins).
 */
function _manually_load_environment() {
    // Set up plugins.
    update_option( 'active_plugins', array(
        'civil-newsroom/civil-newsroom.php'
    ) );
}
tests_add_filter( 'muplugins_loaded', '_manually_load_environment' );

require dirname( __FILE__ ) . '/class-base.php';
