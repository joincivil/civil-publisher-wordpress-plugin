Self-sovereign identity tools for WordPress.

# Requirements

- PHP v7.0+
- Latest version of WordPress recommended

# Installation, setup, and usage

- Install the plugin:
    - [Download the zip](https://github.com/joincivil/civil-publisher-wordpress-plugin/archive/master.zip) and upload that zip to the plugins page in WP dashboard, or
    - Copy, checkout, or submodule this repo into `wp-content/plugins`
- Enable the plugin from the Plugins dashboard

# Development

#### PHP Coding Standards

This plugin follows Automattic's coding standards for WordPress. To run these you will need to install [Composer](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-macos) and [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer#composer).

You also have to install WP coding standards and add them to phpcs config paths:

    composer global require automattic/vipwpcs
    phpcs --config-set installed_paths $HOME/.composer/vendor/wp-coding-standards/wpcs,$HOME/.composer/vendor/automattic/vipwpcs

(Note that your default global composer path might not be `$HOME/.composer/`, it may be `$HOME/.config/composer/` or something else - you can check with `composer global config bin-dir --absolute`)

You can then run linting:

    phpcs -p -s ./ --standard=phpcs.xml --extensions=php # checks and outputs errors
    phpcbf -p -s ./ --standard=phpcs.xml --extensions=php # automatically fixes some errors

To update these there is an additional dependency you need to manually update:

    composer global update wp-coding-standards/wpcs automattic/vipwpcs
