<?php
/**
 * Credibility Indicators.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * The Credibility Indicators class.
 */
class Credibility_Indicators {
	use Singleton;

	private $indicators = [];

	private $learn_more_text = '';

	private $learn_more_link = '';

	/**
	 * Setup the class.
	 */
	public function setup() {
		add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
		add_action( 'admin_init', [ $this, 'register_settings'] );
		add_action( 'the_content', [ $this, 'append_indicators' ] );

		// add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_post_panel' ] );
	}

	/**
	 * Enqueue Gutenberg editor plugin script.
	 */
	public function enqueue_post_panel() {
		wp_enqueue_script(
			'civil-credibility-indicators',
			plugins_url( 'build/credibility-indicators.build.js', __FILE__ ),
			array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-edit-post', 'wp-data' ),
			ASSETS_VERSION,
			true
		);

		// Prevent conflict between lodash required by civil packages and underscore used in Gutenberg, see https://github.com/WordPress/gutenberg/issues/4043#issuecomment-361049257.
		wp_add_inline_script( 'civil-credibility-indicators', 'window.lodash = _.noConflict();', 'after' );
	}


	/**
	 * Setup default credibility values.
	 */
	public function setup_defaults() {

		// Add defaults for indicators.
		$indicators = [
			'original_reporting' => [
				'label'         => __( 'Original Reporting', 'civil' ),
				'default_value' => __( 'This article contains new, firsthand information uncovered by its reporter(s). This includes directly interviewing sources and research / analysis of primary source documents.', 'civil' ),
			],
			'on_the_ground' => [
				'label'         => __( 'On the Ground', 'civil' ),
				'default_value' => __( 'Indicates that a Newsmaker/Newsmakers was/were physically present to report the article from some/all of the location(s) it concerns.', 'civil' ),
			],
			'sources_cited' => [
				'label'         => __( 'Sources Cited', 'civil' ),
				'default_value' => __( 'As a news piece, this article cites verifiable, third-party sources which have all been thoroughly fact-checked and deemed credible by the Newsroom in accordance with the Civil Constitution.', 'civil' ),
			],
			'subject_specialist' => [
				'label'         => __( 'Subject Specialist', 'civil' ),
				'default_value' => __( 'This Newsmaker has been deemed by this Newsroom as having a specialized knowledge of the subject covered in this article.', 'civil' ),
			],
		];

		// Filter default credibility indicators.
		$this->indicators = apply_filters( 'civil_credibility_indicators', $indicators );

		// Filter default value for learn more label.
		$this->learn_more_text = apply_filters(
			'civil_credibility_indicators_learn_more',
			__( 'Learn more about Civil’s Credibility Indicators', 'civil' )
		);

		// Filter default value for learn more link.
		$this->learn_more_link = apply_filters(
			'civil_credibility_indicators_learn_more_link',
			'https://civil.co/credibility-indicators'
		);
	}

	public function append_indicators( $content ) {
		return $content;
	}

	/**
	 * Add Credibility Indicators page.
	 */
	public function add_admin_menu() {
		add_submenu_page(
			MANAGEMENT_PAGE,
			__( 'Credibility Indicators', 'civil' ),
			__( 'Credibility Indicators', 'civil' ),
			'manage_options',
			'civil-credibility-indicators',
			[ $this, 'menu_content' ]
		);
	}

	public function menu_content() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'civil' ) );
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Credibility Indicators', 'civil' ); ?></h1>
			<div id="civil-newsroom-credibility-indicators"></div>
			<form action="options.php" method="post">
				<?php
				// output security fields for the registered setting "civil"
				settings_fields( 'civil' );

				// output setting sections and their fields
				// (sections are registered for "civil", each field is registered to a specific section)
				do_settings_sections( 'civil' );

				// output save settings button
				submit_button( 'Save' );
				?>
			 </form>
		</div>
		<?php

	}

	public function register_settings() {
		register_setting( 'civil', 'credibility-indicators' );

		// register a new section in the "civil" page
		add_settings_section(
			'civil_section_learn_more',
			__( 'Learn More Call to Action', 'civil' ),
			null,
			'civil'
		);

		// register a new section in the "civil" page
		add_settings_section(
			'civil_section_indicators',
			__( 'Indicators', 'civil' ),
			null,
			'civil'
		);

		// register a new field in the "civil_section_developers" section, inside the "civil" page
		add_settings_field(
			'civil_section_learn_more_label',
			__( 'Learn More Label', 'civil' ),
			'civil_field_pill_cb',
			'civil',
			'civil_section_learn_more',
			[
				'label_for'         => 'civil_field_pill',
				'class'             => 'civil_row',
				'civil_custom_data' => 'custom',
			]
		);
	}

	// field callbacks can accept an $args parameter, which is an array.
	// $args is defined at the add_settings_field() function.
	// wordpress has magic interaction with the following keys: label_for, class.
	// the "label_for" key value is used for the "for" attribute of the <label>.
	// the "class" key value is used for the "class" attribute of the <tr> containing the field.
	// you can add custom key value pairs to be used inside your callbacks.
	function civil_field_pill_cb( $args ) {
	 // get the value of the setting we've registered with register_setting()
	 $options = get_option( 'civil' );
	 // output the field
	 ?>
	 <select id="<?php echo esc_attr( $args['label_for'] ); ?>"
	 data-custom="<?php echo esc_attr( $args['civil_custom_data'] ); ?>"
	 name="civil_options[<?php echo esc_attr( $args['label_for'] ); ?>]"
	 >
	 <option value="red" <?php echo isset( $options[ $args['label_for'] ] ) ? ( selected( $options[ $args['label_for'] ], 'red', false ) ) : ( '' ); ?>>
	 <?php esc_html_e( 'red pill', 'civil' ); ?>
	 </option>
	 <option value="blue" <?php echo isset( $options[ $args['label_for'] ] ) ? ( selected( $options[ $args['label_for'] ], 'blue', false ) ) : ( '' ); ?>>
	 <?php esc_html_e( 'blue pill', 'civil' ); ?>
	 </option>
	 </select>
	 <p class="description">
	 <?php esc_html_e( 'You take the blue pill and the story ends. You wake in your bed and you believe whatever you want to believe.', 'civil' ); ?>
	 </p>
	 <p class="description">
	 <?php esc_html_e( 'You take the red pill and you stay in Wonderland and I show you how deep the rabbit-hole goes.', 'civil' ); ?>
	 </p>
	 <?php
	}


}

Credibility_Indicators::instance();
