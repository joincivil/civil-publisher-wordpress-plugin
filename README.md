This plugin encompasses Civil's growing suite of publisher tools, including:

- Boosts, to let readers easily support to your newsroom from any article
- Credibility Indicators, to educate readers about what work goes into good journalism
- (experimental, disabled by default) Smart contract tools to publish and archive content on the Ethereum blockchain using the Civil protocol

Note that to use these tools your newsroom must apply to and be approved on the Civil Registry.

[Apply to the registry](https://registry.civil.co/apply-to-registry)

[Learn more about Civil](https://civil.co)

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

You can then run linting from package.json scripts:

    yarn phpcs # checks and outputs errors
    yarn phpcbf # automatically fixes some errors

To update these there is an additional dependency you need to manually update:

    composer global update wp-coding-standards/wpcs automattic/vipwpcs

# Ethereum Smart Contract Publishing

**This feature is experimental and currently disabled by default.** Publishing and archiving features do work, but we currently recommend these features only for tech-savvy users, and you must follow setup directions below to connect to your newsroom application. The Civil Media Company can't provide support for this feature until it is released; use it at your own risk.

[Read the plugin FAQ](https://cvlconsensys.zendesk.com/hc/en-us/categories/360001540371-Publisher)

#### Requirements

- WordPress's new Gutenberg post editor
    - Note that if you are using the [Classic Editor plugin](https://wordpress.org/plugins/classic-editor/) you can continue to use the classic WordPress editor to edit and publish on your site, but when you wish to publish to Civil, you can open a particular post using the Gutenberg editor and access the Civil Publisher tools from there, and then afterwards return to using the classic editor.
- WordPress post revisions must be enabled
    - Revisions are enabled by default on stock WordPress. However, some hosting providers disable them, but will enable them on request.

#### Setup

- Install and activate the plugin as normal
- Enable these features by changing [this line](https://github.com/joincivil/civil-publisher-wordpress-plugin/blob/240d933ae8359b1531266c51ec0b359d04e646f3/utils.php#L17) to return true.
- **Do not use the newsroom contract creation and application feature in this plugin.** To use this plugin you must first create your newsroom and apply to the registry [here](https://registry.civil.co/apply-to-registry).
- Once you have done that, copy your newsroom contract address from the Smart Contract tab on your [registry application page](https://registry.civil.co/apply-to-registry/), then navigate to Settings > General in your WordPress dashboard and paste it in the "newsroom address" field, then save
- Edit your user profile in your WordPress dashboard and add your personal Ethereum address from MetaMask to the "your wallet address" field and save
- You will now find a "Civil" tab in the top right toolbar when editing a post using the Gutenberg editor: from this tab you can sign, index, and archive your posts on the blockchain

#### Build

Built JS bundles are included in this repo, but if you want to build fresh you can do so:

    yarn install
    yarn build

To build and watch:

    yarn dev

(LiveReload is supported if `WP_DEBUG` is true and you run `yarn dev:reload` instead.)

If you are simultaneously working on [Civil libraries](https://github.com/joincivil/Civil), you can use [`yarn link`](https://yarnpkg.com/lang/en/docs/cli/link/) to connect the dependencies in this plugin to your local versions of @joincivil packages.

### Linting etc.

    yarn prettier
    yarn lint
