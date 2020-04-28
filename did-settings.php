<?php
/**
 * DID settings page.
 *
 * @package Civil_Publisher
 */

namespace Civil_Publisher;

$did_doc_url = site_url( '/.well-known/did.json' );

?>

<div class="wrap">
	<h1><?php esc_html_e( 'Decentralized Identity Tools', 'civil' ); ?></h1>
	<p>@TODO copy TBD</p>
	<p>Please contact <a href="mailto:support@civil.co">support@civil.co</a> with any questions or issues.</p>

	<?php if ( current_user_can( 'manage_options' ) ) { ?>
		<form action="options.php" method="post">
			<?php
				settings_fields( 'civil_did' );
				do_settings_sections( 'did' );
				submit_button( __( 'Save', 'civil' ) );
			?>
		</form>

		<h2><em><?php esc_html_e( 'Debug Info', 'civil' ); ?></em></h2>
		<table class="form-table">
			<tbody>
				<tr>
					<th scope="row">TrustAgent DID</th>
					<td>
						<pre style="max-width: 600px; white-space: pre-wrap; margin: 0;"><?php echo esc_html( get_option( ASSIGNED_DID_OPTION_KEY, '[not set]' ) ); ?></pre>
					</td>
				</tr>
				<tr>
					<th scope="row">DID doc</th>
					<td><a href="<?php echo esc_url( $did_doc_url ); ?>" target="_blank"><?php echo esc_url( $did_doc_url ); ?></a></td>
				</tr>
				<?php if ( get_option( DID_ERROR_OPTION_KEY ) ) { ?>
					<tr>
						<th scope="row">error</th>
						<td>
							<pre style="max-width: 600px; white-space: pre-wrap; margin: 0;"><?php echo esc_html( get_option( DID_ERROR_OPTION_KEY ) ); ?></pre>
						</td>
					</tr>
				<?php } ?>
			</tbody>
		</table>
	<?php } else { ?>
		<h2><?php esc_html_e( 'Settings', 'civil' ); ?></h2>
		<p><i><?php esc_html_e( 'You must be an admin in order to edit these settings.', 'civil' ); ?></i></p>
	<?php } ?>
</div>
