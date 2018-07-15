<?php
/**
 * Admin page for managing Civil newsroom.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

?>

<div class="wrap">
	<h1><?php esc_html_e( 'Civil Newsroom Manager', 'civil' ); ?></h1>

	<h2><?php esc_html_e( 'Welcome to Civil', 'civil' ); ?></h2>
	<p><?php esc_html_e( 'Before getting started, here are the steps to set up your newsroom contract.', 'civil' ); ?></p>
	<p>
	<?php
	echo sprintf(
		wp_kses(
			/* Translators: URLs. */
			__( 'First, you\'ll need an Ethereum wallet-enabled browser (<a href="%1$s" target="_blank">Chrome</a>, <a href="%2$s" target="_blank">Brave</a>, or <a href="%3$s" target="_blank">Firefox</a>) with the <a href="%4$s" target="_blank">MetaMask</a> extension installed. <a href="%5$s" target="_blank">Read this FAQ</a> to learn more.', 'civil' ),
			[
				'a' => [
					'href' => [],
					'target' => [],
				],
			]
		),
		'https://www.google.com/chrome/',
		'https://brave.com/',
		'https://www.mozilla.org/firefox/',
		'https://metamask.io/',
		esc_url( get_admin_url( null, 'admin.php?page=' . HELP_PAGE ) )
	);
	?>
	</p>
	<p><?php esc_html_e( 'Then, you\'ll need to set up your newsroom contract. Have the following information ready before you begin:', 'civil' ); ?></p>
	<ol>
		<li><?php esc_html_e( 'Your wallet address - this will be pulled from MetaMask', 'civil' ); ?></li>
		<li>
		<?php
		echo sprintf(
			wp_kses(
				/* Translators: URL. */
				__( 'Funds in your wallet - you will need a small amount of Ether (ETH) to pay for <a href="%1$s" target="_blank">gas</a> fees.', 'civil' ),
				[
					'a' => [
						'href' => [],
						'target' => [],
					],
				]
			),
			'TODO link to gas fees FAQ'
		);
		?>
		</li>
		<li><?php esc_html_e( 'What you want to name your newsroom', 'civil' ); ?></li>
		<li><?php esc_html_e( 'The wallet addresses for your newsroom\'s co-officers and editors', 'civil' ); ?></li>
	</ol>
	<?php // TODO: Set up global styles for Civil admin pages. ?>
	<p style="font-size: smaller; font-style: italic;">
	<?php
	echo sprintf(
		wp_kses(
			/* Translators: URL. */
			__( 'For full instructions on how to configure the Civil Newsroom Manager, <a href="%1$s" target="_blank">read our FAQ</a>.', 'civil' ),
			[
				'a' => [
					'href' => [],
					'target' => [],
				],
			]
		),
		esc_url( get_admin_url( null, 'admin.php?page=' . HELP_PAGE ) )
	);
	?>
	</p>

	<div id="civil-newsroom-management"></div>
</div>
