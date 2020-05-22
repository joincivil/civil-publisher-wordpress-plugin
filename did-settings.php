<?php
/**
 * DID settings page.
 *
 * @package ConsenSys_VC_Publisher
 */

namespace ConsenSys_VC_Publisher;

if ( current_user_can( 'manage_options' ) && isset( $_GET['clear-vc-log'] ) ) {
	delete_option( VC_LOG_OPTION_KEY );
	?>
		<p>VC log cleared.</p>
		<p><a href="<?php echo esc_url( menu_page_url( DID_SETTINGS_PAGE, false ) ); ?>">&laquo; Return to settings</a></p>
	<?php
	exit;
} else if ( current_user_can( 'manage_options' ) && isset( $_GET['reset-did'] ) ) {
	delete_option( ASSIGNED_DID_OPTION_KEY );
	?>
		<p>DID reset.</p>
		<p>DID initialization process will be run on next admin page load.</p>
		<p><a href="<?php echo esc_url( menu_page_url( DID_SETTINGS_PAGE, false ) ); ?>">&laquo; Return to settings</a></p>
	<?php
	exit;
}

$did_doc_url = site_url( '/.well-known/did.json' );

?>

<div class="wrap">
	<h1><?php esc_html_e( 'ConsenSys VC Publisher Settings', 'consensys' ); ?></h1>
	<p>@TODO copy TBD</p>

	<?php if ( current_user_can( 'manage_options' ) ) { ?>
		<form action="options.php" method="post">
			<?php
				settings_fields( 'consensys_did' );
				do_settings_sections( 'did' );
				submit_button( __( 'Save', 'consensys' ) );
			?>
		</form>

		<h2><em><?php esc_html_e( 'Debug', 'consensys' ); ?></em></h2>
		<table class="form-table">
			<tbody>
				<tr>
					<th scope="row">TrustAgent DID</th>
					<td>
						<pre style="max-width: 600px; white-space: pre-wrap; margin: 0;"><?php echo esc_html( get_option( ASSIGNED_DID_OPTION_KEY, '[not set]' ) ); ?></pre>
						<?php if ( get_option( ASSIGNED_DID_OPTION_KEY ) ) { ?>
							<p><a href="<?php echo esc_url( menu_page_url( DID_SETTINGS_PAGE, false ) . '&reset-did' ); ?>"><button>Reset DID</button></a></p>
							<p>(Note that the DID initialization process will be run on next admin page load.)</p>
						<?php } ?>
					</td>
				</tr>
				<tr>
					<th scope="row">DID doc</th>
					<td><a href="<?php echo esc_url( $did_doc_url ); ?>" target="_blank"><?php echo esc_url( $did_doc_url ); ?></a></td>
				</tr>
				<tr>
					<th scope="row">VC log</th>
					<td>
						<pre style="max-width: 800px; overflow-x: auto; margin: 0; padding: 5px; background: #FBFBFB;"><?php echo esc_html( get_option( VC_LOG_OPTION_KEY ) ); ?></pre>
						<?php if ( get_option( VC_LOG_OPTION_KEY ) ) { ?>
							<p><a href="<?php echo esc_url( menu_page_url( DID_SETTINGS_PAGE, false ) . '&clear-vc-log' ); ?>"><button>Clear log</button></a></p>
						<?php } ?>
					</td>
				</tr>
				<?php if ( get_option( DID_ERROR_OPTION_KEY ) ) { ?>
					<tr>
						<th scope="row">error</th>
						<td>
							<pre style="max-width: 600px; white-space: pre-wrap; margin: 0; padding: 5px; background: #FBFBFB;"><?php echo esc_html( get_option( DID_ERROR_OPTION_KEY ) ); ?></pre>
						</td>
					</tr>
				<?php } ?>
			</tbody>
		</table>
	<?php } else { ?>
		<h2><?php esc_html_e( 'Settings', 'consensys' ); ?></h2>
		<p><i><?php esc_html_e( 'You must be an admin in order to edit these settings.', 'consensys' ); ?></i></p>
	<?php } ?>
</div>
