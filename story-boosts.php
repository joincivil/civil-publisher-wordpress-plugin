<?php
/**
 * Handles custom post meta and embed output for Story Boosts.
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

/**
 * Set up Story Boost meta box.
 */
function story_boost_meta_box() {
	add_meta_box(
		'civil-story-boost',
		__( 'Civil: Story Boost', 'civil' ),
		__NAMESPACE__ . '\story_boost_meta_box_callback',
		null,
		'side'
	);

}
add_action( 'add_meta_boxes', __NAMESPACE__ . '\story_boost_meta_box' );

/**
 * Output Story Boost meta box.
 *
 * @param WP_Post $post Post object.
 */
function story_boost_meta_box_callback( $post ) {
	wp_nonce_field( 'civil_story_boost_action', 'civil_story_boost_nonce' );
	$show_story_boost = get_post_meta( $post->ID, SHOW_STORY_BOOST_META_KEY, true );
	?>
	<label>
		<input type="checkbox"
			id="<?php echo esc_attr( SHOW_STORY_BOOST_META_KEY ); ?>"
			name="<?php echo esc_attr( SHOW_STORY_BOOST_META_KEY ); ?>"
			value="1"
			<?php checked( $show_story_boost, '1' ); ?>
		/>
		<?php _e( 'Enable Story Boost', 'civil' ); ?>
	</label>
	<p style="margin-top: 10px">Embed a small widget to the end of this post that allows readers to support your newsroom with direct payments. This post will also be submitted to the Civil story feed where other readers can find it and similarly contribute. <a href="#@TODO/toby" target="_blank">More information</a>.</p>
	<?php
}

/**
 * Save Story Boost meta.
 *
 * @param int $post_id The post ID.
 */
function story_boost_meta_save( $post_id ) {
	$is_autosave = wp_is_post_autosave( $post_id );
	$is_revision = wp_is_post_revision( $post_id );
	$is_valid_nonce = isset( $_POST['civil_story_boost_nonce'] ) && wp_verify_nonce( $_POST['civil_story_boost_nonce'], 'civil_story_boost_action' );
	if ( $is_autosave || $is_revision || ! $is_valid_nonce ) {
		return;
	}

	if ( isset( $_POST[ SHOW_STORY_BOOST_META_KEY ] ) ) {
		update_post_meta( $post_id, SHOW_STORY_BOOST_META_KEY, 1 );
	} else {
		delete_post_meta( $post_id, SHOW_STORY_BOOST_META_KEY );
	}
}
add_action( 'save_post', __NAMESPACE__ . '\story_boost_meta_save' );

/**
 * Set up Story Boost hooks for post content.
 *
 * @param WP_Query $query Query object.
 */
function story_boost_loop_start( $query ) {
	if ( $query->is_main_query() ) {
		add_action( 'the_content', __NAMESPACE__ . '\story_boost_the_content', 1000 );
		add_action( 'loop_end', __NAMESPACE__ . '\story_boost_loop_end' );
	}
}
add_action( 'loop_start', __NAMESPACE__ . '\story_boost_loop_start' );

/**
 * Clean up Story Boost hooks.
 */
function story_boost_loop_end() {
	remove_action( 'the_content', __NAMESPACE__ . '\story_boost_the_content', 1000 );
}

/**
 * Append Story Boost to the post content.
 *
 * @param  string $content Post content.
 * @return string Modified post content.
 */
function story_boost_the_content( $content ) {
	$show_story_boost = get_post_meta( get_the_ID(), SHOW_STORY_BOOST_META_KEY, true );
	if ( $show_story_boost ) {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			$content .= '<script src="http://staging.civil.app/loader/boost.js"></script>';
		} else {
			$content .= '<script src="http://registry.civil.co/loader/boost.js"></script>';
		}
	}
	return $content;
}
