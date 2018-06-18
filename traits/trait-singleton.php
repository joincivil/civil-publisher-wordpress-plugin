<?php
/**
 * Trait file for Singletons.
 *
 * @package Civil_Newsroom_Protocol
 */

namespace Civil_Newsroom_Protocol;

/**
 * Make a class into a singleton.
 */
trait Singleton {
	/**
	 * Existing instance.
	 *
	 * @var array
	 */
	protected static $instance;

	/**
	 * Get class instance.
	 *
	 * @return object
	 */
	public static function instance() {
		if ( ! isset( static::$instance ) ) {
			static::$instance = new static();
			static::$instance->setup();
		}
		return static::$instance;
	}

	/**
	 * Setup the singleton.
	 */
	public function setup() {
		// Silence.
	}
}
