<?php
/**
 * Credibility Indicators admin page.
 *
 * @package Civil_Newsroom_Protocol
 */
?>

<div class="wrap">
	<h1><?php esc_html_e( 'Credibility Indicators', 'civil' ); ?></h1>
	<div>This is some helper text about what the Credibility Indicators are, and how to use them.</div>
	<form action="options.php" method="post">
		<?php
		// Output security fields.
		settings_fields( 'civil_credibility_indicators' );

		// Output form fields.
		do_settings_sections( 'credibility-indicators' );

		// Output save button.
		submit_button( __( 'Save', 'civil' ) );
		?>
	</form>
</div>
