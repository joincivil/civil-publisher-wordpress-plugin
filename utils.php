<?php
/**
 * Miscellaneous utility functions.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

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

/**
 * Check if given string is a valid hex ETH wallet address.
 *
 * @param string $addr Address to check.
 * @return bool  Whether or not address is valid hex ETH wallet address.
 */
function is_valid_eth_address( $addr ) {
    return preg_match( '/^(0x)?[0-9a-f]{40}$/i', $addr );
}


/**
 * Check if given string is a valid hex ETH transaction hash.
 *
 * @param string $hash hash to check.
 * @return bool  Whether or not address is valid hex ETH wallet address.
 */
function is_valid_txhash( $hash ) {
    return preg_match( '/^(0x)?[0-9a-f]{64}$/i', $hash );
}

/**
 * Gets WP user data from WP_User, or data from WP_user that's linked to coauthors-plus guest author
 *
 * @param object $orig_user A WP_User object or coauthors-plus author object.
 * @return object Data from WP_User object, but any display name set in guest author overrides regular user display name.
 */
function get_user_data( $orig_user ) {
    if ( empty( $orig_user->linked_account ) ) {
        // Not a coauthor.
        return $orig_user->data;
    }

    $actual_user = get_user_by( 'login', $orig_user->linked_account );

    if ( empty( $actual_user ) ) {
        return $orig_user->data;
    }

    $user_data = $actual_user->data;

    if ( ! empty( $orig_user->display_name ) ) {
        $user_data->display_name = $orig_user->display_name;
    }

    return $user_data;
}

/**
 * Gets data about post authors.
 *
 * @param int $post_id Post ID.
 * @return array Just the data from WP_Users who are authors of the post - any coauthors-plus guest authors dereferenced to their WP_Users.
 */
function get_post_authors_data( $post_id ) {
    $authors = [];
    if ( function_exists( 'get_coauthors' ) ) {
        $authors = get_coauthors( $post_id );
    } else {
        // Support absence of co-authors-plus plugin.
        $post = get_post( $post_id );
        $author = get_user_by( 'id', $post->post_author );
        if ( ! empty( $author ) ) {
            $authors[] = $author;
        }
    }
    return array_map( __NAMESPACE__ . '\get_user_data', $authors );
}
