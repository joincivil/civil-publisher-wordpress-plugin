<?php
/**
 * Credibility Indicators admin page.
 *
 * @package Civil_Publisher
 */
?>

<div class="wrap">
	<h1><?php esc_html_e( 'Credibility Indicators', 'civil' ); ?></h1>
	<p>Credibility Indicators provide readers with greater transparency into the reporting process. On each post you will find a Credibility Indicators section that lets you select which of these, if any, are applicable to the post. Ones you select are also included as metadata when you publish onto the Civil network. You may change the default text below.</p>
	<p><a href="https://civil.co/credibility-indicators/" target="_blank">Read more about Civil's Credibility Indicators</a></p>
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
