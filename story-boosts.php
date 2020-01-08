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
		__( 'Civil - Story Boost', 'civil' ),
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
	$screen = get_current_screen();
	if ( 'add' === $screen->action ) { // a new post as opposed to editing an existing post.
		$show_story_boost = get_option( STORY_BOOSTS_ENABLE_BY_DEFAULT ) && get_post_type() === 'post';
	} else {
		$show_story_boost = get_post_meta( $post->ID, SHOW_STORY_BOOST_META_KEY, true );
	}

	wp_nonce_field( 'civil_story_boost_action', 'civil_story_boost_nonce' );
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
	<p style="margin-top: 10px">Embed a small widget to the end of this post that allows readers to support your newsroom with direct payments. If enabled, this post will also be submitted to the <a href="https://registry.civil.co/storyfeed" target="_blank">Civil story feed &#129125;</a>.<!--  <a href="#@TODO/toby" target="_blank">More information</a>.--></p>
	<p><a href="<?php echo esc_url( menu_page_url( STORY_BOOSTS_SETTINGS, false ) ); ?>" target="_blank">Edit settings</a></p>
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
		$priority = intval( get_option( STORY_BOOSTS_PRIORITY, STORY_BOOSTS_PRIORITY_DEFAULT ) );
		add_action( 'the_content', __NAMESPACE__ . '\story_boost_the_content', $priority );
		add_action( 'loop_end', __NAMESPACE__ . '\story_boost_loop_end' );
	}
}
add_action( 'loop_start', __NAMESPACE__ . '\story_boost_loop_start' );

/**
 * Clean up Story Boost hooks.
 */
function story_boost_loop_end() {
	$priority = intval( get_option( STORY_BOOSTS_PRIORITY, STORY_BOOSTS_PRIORITY_DEFAULT ) );
	remove_action( 'the_content', __NAMESPACE__ . '\story_boost_the_content', $priority );
}

/**
 * Append Story Boost to the post content.
 *
 * @param  string $content Post content.
 * @return string Modified post content.
 */
function story_boost_the_content( $content ) {
	$debug = isset( $_GET[ STORY_BOOSTS_DEBUG_QS_FLAG ] );
	$show_story_boost = get_post_meta( get_the_ID(), SHOW_STORY_BOOST_META_KEY, true );
	if ( $show_story_boost ) {
		$script_src = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? STORY_BOOST_SRC_STAGING : STORY_BOOST_SRC_PROD;
		if ( current_user_can( 'edit_posts' ) || $debug ) {
			$script_src .= '?debug';
		}
		$content .= '<script src="' . $script_src . '"></script>';
	} else if ( $debug ) {
		$content .= '<pre style="padding: 25px; background: coral; text-align: center;">civil story boost debug placeholder</pre>';
	}
	return $content;
}

/**
 * Add settings fields to control Story Boosts.
 */
function add_settings() {
	add_settings_section( 'civil_story_boosts', __( 'Settings', 'civil' ), null, 'story-boosts' );

	add_settings_field( STORY_BOOSTS_ENABLE_BY_DEFAULT, __( 'Enable by Default', 'civil' ), __NAMESPACE__ . '\display_enable_by_default_input', 'story-boosts', 'civil_story_boosts' );
	add_settings_field( STORY_BOOSTS_PRIORITY, __( 'Post Placement Order', 'civil' ), __NAMESPACE__ . '\display_priority_input', 'story-boosts', 'civil_story_boosts' );
	register_setting( 'civil_story_boosts', STORY_BOOSTS_ENABLE_BY_DEFAULT );
	register_setting( 'civil_story_boosts', STORY_BOOSTS_PRIORITY );
}
add_action( 'admin_init', __NAMESPACE__ . '\add_settings' );

/**
 * Output the enable by default input.
 */
function display_enable_by_default_input() {
	$enable = boolval( get_option( STORY_BOOSTS_ENABLE_BY_DEFAULT, STORY_BOOSTS_ENABLE_BY_DEFAULT_DEFAULT ) );
	?>
		<div style="max-width: 600px">
			<label>
				<input
					type="checkbox"
					name="<?php echo esc_attr( STORY_BOOSTS_ENABLE_BY_DEFAULT ); ?>"
					id="<?php echo esc_attr( STORY_BOOSTS_ENABLE_BY_DEFAULT ); ?>"
					<?php checked( $enable, true ); ?>
				/>
				<?php _e( 'Enable Story Boosts by default on all new posts.' ); ?>
				<p><?php _e( 'Note that this only applies to <b>new</b> posts, and only applies to posts of type <b>post</b> (e.g. not pages or custom post types). For existing posts or pages/posts of other post types you will need to edit the post manually to enable Story Boosts.' ); ?></p>
			</label>
		</div>
	<?php
}

/**
 * Output the priority input.
 */
function display_priority_input() {
	$priority = intval( get_option( STORY_BOOSTS_PRIORITY, STORY_BOOSTS_PRIORITY_DEFAULT ) );
	?>
		<div style="max-width: 600px">
			<input
				type="number"
				name="<?php echo esc_attr( STORY_BOOSTS_PRIORITY ); ?>"
				id="<?php echo esc_attr( STORY_BOOSTS_PRIORITY ); ?>"
				value="<?php echo esc_attr( $priority ); ?>"
			/>
			<p><?php _e( 'This number specifies the order in which the Story Boost widget will be placed at the end of a post. The order is determined by this value relative to the values set by any other plugin or theme features that output content at the end of a post.' ); ?></p>
			<p><?php _e( 'The lower the number, the sooner the widget will appear. “0" will likely ensure the widget displays immediately after the last paragraph of the post, though negative numbers are valid too and will come first. WordPress default: 10.' ); ?></p>
		</div>
	<?php
}

