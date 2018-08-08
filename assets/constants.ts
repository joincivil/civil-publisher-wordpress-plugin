export const apiNamespace = "/civil-newsroom-protocol/v1/";

export enum postMetaKeys {
  SIGNATURES = "civil_newsroom_protocol_article_signatures",
  PUBLISHED_REVISIONS = "civil_newsroom_protocol_published_revisions",
  CIVIL_CONTENT_ID = "civil_newsroom_protocol_content_id",
  CIVIL_PUBLISH_TXHASH = "civil_newsroom_protocol_publish_tx_hash",
  POST_AUTHORS = "civil_newsroom_protocol_post_authors",
}

export enum userMetaKeys {
  WALLET_ADDRESS = "civil_newsroom_protocol_eth_wallet_address",
}

export enum siteOptionKeys {
  NEWSROOM_ADDRESS = "civil_newsroom_protocol_newsroom_address",
  NEWSROOM_TXHASH = "civil_newsroom_protocol_newsroom_txhash",
}

export const NETWORK_NAME = "rinkeby";
export const NETWORK_NICE_NAME = "Rinkeby Test Network";

export const theme = {
  primaryButtonBackground: "#0085ba",
  primaryButtonColor: "#fff",
  primaryButtonFontWeight: "bold",
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
};
