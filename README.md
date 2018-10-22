This plugin lets you create a newsroom smart contract; apply to the Civil network; and sign, publish, and archive your WordPress content using the Civil protocol.

[Learn more about Civil](https://civil.co)

[Read the plugin FAQ](https://cvlconsensys.zendesk.com/hc/en-us/categories/360001000232-Journalists)

# Requirements

Latest version of WordPress, with Gutenberg.

# Installation

Copy, checkout, or submodule this repo into `wp-content/plugins`. Then, from this repo,

    yarn install
    yarn build

Then enable the plugin from the Plugins screen in the WordPress admin dashboard.

# Development

    yarn dev

### Linting etc.

    yarn prettier
    yarn lint

#### PHP Coding Standards

This plugin follows Automattic's coding standards for WordPress. To run these you will need to install [Composer](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-macos) and [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer#composer).

You also have to install WP coding standards and add them to phpcs config paths:

    composer global require automattic/vipwpcs

phpcs --config-set installed_paths $HOME/.composer/vendor/wp-coding-standards/wpcs,$HOME/.composer/vendor/automattic/vipwpcs

(Note that your default global composer path might not be `$HOME/.composer/`, it may be `$HOME/.config/composer/` or something else - you can check with `composer global config bin-dir --absolute`)

You can then run linting from package.json scripts:

    yarn phpcs # checks and outputs errors
    yarn phpcbf # automatically fixes some errors
