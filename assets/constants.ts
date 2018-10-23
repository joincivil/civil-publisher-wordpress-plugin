export const apiNamespace = "/civil-newsroom-protocol/v1/";

export const urls = {
  HOMEPAGE: window.civilNamespace.wpSiteUrl,
  LOGO: window.civilNamespace.logoUrl,
  PROFILE: `${window.civilNamespace.wpAdminUrl}profile.php`,
  HELP_BASE: "https://cvlconsensys.zendesk.com/hc/en-us/",
  FAQ_HOME: "https://cvlconsensys.zendesk.com/hc/en-us/categories/360001000232-Journalists",
  NEWSROOM_MANAGER: "/wp-admin/admin.php?page=civil-newsroom-protocol-management",
  ETHERSCAN_DOMAIN: "etherscan.io",
};

export enum postMetaKeys {
  SIGNATURES = "civil_newsroom_protocol_article_signatures",
  PUBLISHED_REVISIONS = "civil_newsroom_protocol_published_revisions",
  CIVIL_CONTENT_ID = "civil_newsroom_protocol_content_id",
  CIVIL_PUBLISH_TXHASH = "civil_newsroom_protocol_publish_tx_hash",
  CIVIL_PUBLISH_IPFS = "civil_newsroom_protocol_publish_ipfs",
  CIVIL_PUBLISH_ARCHIVE_STATUS = "civil_newsroom_protocol_publish_archive_status",
  POST_AUTHORS = "civil_newsroom_protocol_post_authors",
}

export enum userMetaKeys {
  WALLET_ADDRESS = "civil_newsroom_protocol_eth_wallet_address",
  NEWSROOM_ROLE = "civil_newsroom_protocol_newsroom_role",
}

export enum siteOptionKeys {
  NEWSROOM_ADDRESS = "civil_newsroom_protocol_newsroom_address",
  NEWSROOM_TXHASH = "civil_newsroom_protocol_newsroom_txhash",
  NEWSROOM_CHARTER = "civil_newsroom_protocol_newsroom_charter",
}

export const NETWORK_NAME = window.civilNamespace.networkName || "main";
export const NETWORK_NICE_NAME = NETWORK_NAME === "main" ? "Main Ethereum Network" : (NETWORK_NAME[0].toUpperCase() + NETWORK_NAME.substr(1) + " Test Network");
if (NETWORK_NAME !== "main") {
  urls.ETHERSCAN_DOMAIN = `${NETWORK_NAME}.etherscan.io`;
}

export const theme = {
  primaryButtonBackground: "#0085ba",
  primaryButtonColor: "#fff",
  primaryButtonFontWeight: "600",
  primaryButtonHoverBackground: "#008ec2",
  primaryButtonDisabledBackground: "#008ec2",
  primaryButtonDisabledColor: "#66c6e4",
  primaryButtonTextTransform: "none",
  secondaryButtonColor: "#555555",
  secondaryButtonBackground: "transparent",
  secondaryButtonBorder: "#cccccc",
  borderlessButtonColor: "#0085ba",
  borderlessButtonHoverColor: "#008ec2",
  linkColor: "#0085ba",
  linkColorHover: "#008ec2",
  sansSerifFont: `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif`,
  stepHeaderWeightHeavy: 600,
  stepHeaderWeightLight: 400,
  checkboxInactiveColor: "#72777c",
  checkboxActiveColor: "#0073af",
  stepProccessTopNavCurrentColor: "#0085ba",
  stepProccessTopNavActiveColor: "#000000",
  stepProccessTopNavFutureColor: "#72777c",
  stepProcessDotActiveColor: "#0085ba",
  stepProcessDotFutureColor: "#72777c",
  stepProccessCompleteDotBorderColor: "#f1f1f1",
};

export const timestampFormat = "MMMM DD, YYYY h:mm a";
