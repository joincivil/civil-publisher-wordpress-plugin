<?php
/**
 * Story Boosts settings page.
 *
 * @package Civil_Publisher
 */
?>

<div class="wrap">
	<h1><?php esc_html_e( 'Story Boosts', 'civil' ); ?></h1>
	<p>Story boosts are small widgets added to the end of a post that allow readers to support your newsroom with direct payments. Enabled posts will also be submitted to the <a href="https://registry.civil.co/storyfeed" target="_blank">Civil story feed &#129125;</a>.</p>
	<p>Please contact <a href="mailto:support@civil.co">support@civil.co</a> with any questions or issues.</p>

	<?php if ( current_user_can( 'manage_options' ) ) { ?>
		<form action="options.php" method="post">
			<?php
				settings_fields( 'civil_story_boosts' );
				do_settings_sections( 'story-boosts' );
				submit_button( __( 'Save', 'civil' ) );
			?>
		</form>
	<?php } else { ?>
		<h2><?php esc_html_e( 'Settings', 'civil' ); ?></h2>
		<p><i><?php esc_html_e( 'You must be an admin in order to edit these settings.', 'civil' ); ?></i></p>
	<?php } ?>
</div>
