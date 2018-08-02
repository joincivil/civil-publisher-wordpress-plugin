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
