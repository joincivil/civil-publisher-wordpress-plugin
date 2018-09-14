import { EthAddress, TxHash, ApprovedRevision } from "@joincivil/core";

import { recoverSignerPersonal, prepareUserFriendlyNewsroomMessage, hashContent } from "@joincivil/utils";
import { postMetaKeys, userMetaKeys } from "../../constants";
import { SignatureData } from "./interfaces";
import { hasInjectedProvider, revisionJsonSansDate } from "../../util";
import { ArchiveOptions } from "../components/BlockchainPublishPanel";

const { dispatch, select } = window.wp.data;

/*
function isResolving(selectorName: string, ...args: any[]): boolean {
  return select("core/data").isResolving(REDUCER_KEY, selectorName, ...args);
}
//*/

export function isNewsroomEditor(state: any): boolean {
  return state.isNewsroomEditor;
}
export function isWpEditor(): boolean {
  return select("civil/blockchain").getUserCapabilities().edit_others_posts;
}

/** If no id supplied, defaults to current user. */
export function getUserData(state: any, _id?: number | "me"): any {
  const id = _id || select("civil/blockchain").getCurrentUserId() || "me";
  return state.userData[id!] || {};
}

export function getCurrentUserId(state: any): number {
  return state.currentUserId;
}

/** Returns ETH address associated with logged-in WordPress user (rather than what web3 tells us) */
export function getCurrentWpUserAddress(state: any): EthAddress | undefined {
  const walletAddress = select("civil/blockchain").getUserData()[userMetaKeys.WALLET_ADDRESS];
  return walletAddress ? walletAddress.toLowerCase() : walletAddress;
}

export function getWeb3ProviderAddress(state: any): EthAddress {
  return state.web3ProviderAddress ? state.web3ProviderAddress.toLowerCase() : state.web3ProviderAddress;
}

export function getUserCapabilities(state: any): { [key: string]: boolean } {
  return select("civil/blockchain").getUserData().capabilities || {};
}

export function getSignatures(state: any): SignatureData {
  if (Object.keys(state.signatures).length) {
    return state.signatures;
  }
  return JSON.parse(getPostMeta(postMetaKeys.SIGNATURES) || "{}");
}

export function getPublishedStatus(state: any): any {
  return state.publishedStatus;
}

/** We can't rely on only `select("core/editor").getCurrentPostLastRevisionId`. Because we have to disable `wp_save_post_revision_check_for_changes` in order to save revisions separately, two revision saves are triggered with every save, and meta updates (including signatures) only happen on the second, and `getCurrentPostLastRevisionId` only gets updated after the first. So instead, we keep track ourselves and update this value on every save. */
export function getLastRevisionId(state: any): number {
  return state.lastRevisionId;
}

export function getRevisionJSON(state: any, revisionID: string): any {
  return state.revisions[revisionID];
}

export function getLatestRevisionJSON(): any {
  const lastRevisionId = select("civil/blockchain").getLastRevisionId();
  return lastRevisionId && select("civil/blockchain").getRevisionJSON(lastRevisionId);
}

function getPostMeta(key: string): any {
  const editedMeta = select("core/editor").getEditedPostAttribute("meta");
  if (key in editedMeta) {
    return editedMeta[key];
  }
  // getEditedPostAttribute returns only the values that are dirty or, if none are dirty, it returns all of the values from the saved state. This means if one meta value is dirty, but not the one we're looking for, then the one we're looking for won't be in there, so let's look in getCurrentPost, which returns the last saved version of post:
  return select("core/editor").getCurrentPost().meta[key];
}

function isPostPublished(): boolean {
  return select("core/editor").isCurrentPostPublished();
}

export function getCivilContentID(store: any): string | null {
  let { civilContentID } = store;

  // TODO: Hmm, should this be in a resolver?
  if (!civilContentID) {
    civilContentID = getPostMeta(postMetaKeys.CIVIL_CONTENT_ID);
    dispatch("civil/blockchain").setCivilContentID(civilContentID);
  }
  return civilContentID;
}

export function isPublishDisabled(state: any): boolean {
  const editorStore = select("core/editor");
  const civilStore = select("civil/blockchain");
  const currentPostLastRevisionId = civilStore.getLastRevisionId();
  const publishedRevisions = civilStore.getPublishedRevisions();
  const latestRevisionPublished = publishedRevisions.length
    ? publishedRevisions[publishedRevisions.length - 1]
    : undefined;

  const isLatestRevisionPublished =
    latestRevisionPublished && latestRevisionPublished.revisionID === currentPostLastRevisionId;

  return (
    !isPostPublished() ||
    editorStore.isCleanNewPost() ||
    editorStore.isEditedPostDirty() ||
    !!isLatestRevisionPublished ||
    civilStore.isPluginDataMissing()
  );
}

export function getPublishedRevisions(state: any): any {
  let publishedRevisions = state.publishedStatus;

  if (!publishedRevisions.length) {
    const { updatePublishedState } = dispatch("civil/blockchain");

    const persistedPublishedRevisions = getPostMeta(postMetaKeys.PUBLISHED_REVISIONS);
    publishedRevisions = JSON.parse(persistedPublishedRevisions || "[]");
    publishedRevisions = publishedRevisions.map((revision: any) => {
      let newRevision = revision;
      if (typeof revision.published === "string") {
        const published = new Date(revision.published);
        newRevision = { ...revision, published };
      }
      updatePublishedState(newRevision);
      return newRevision;
    });
  }

  publishedRevisions = publishedRevisions.map((revision: any) => {
    const data = select("civil/blockchain").getRevisionJSON(revision.revisionID);
    return {
      ...revision,
      data,
    };
  });
  return publishedRevisions;
}

export function isCorrectNetwork(state: any): boolean {
  return state.network.isCorrectNetwork;
}

export function getTxHash(): TxHash | null {
  const txHash = getPostMeta(postMetaKeys.CIVIL_PUBLISH_TXHASH);
  return txHash;
}

export function getArchiveOptions(): ArchiveOptions | null {
  const archive = getPostMeta(postMetaKeys.CIVIL_PUBLISH_ARCHIVE_STATUS);
  if (archive) {
    return JSON.parse(archive);
  } else {
    return null;
  }
}

export function getIpfsPath(): string | null {
  return getPostMeta(postMetaKeys.CIVIL_PUBLISH_IPFS);
}

export function getCurrentIsVersionPublished(state: any): boolean {
  const { setCurrentVersionWasPublished } = dispatch("civil/blockchain");

  const lastPublishedRevision = select("civil/blockchain").getLastPublishedRevision();
  if (!lastPublishedRevision) {
    return false;
  }

  const revisionJson = select("civil/blockchain").getLatestRevisionJSON();
  if (!revisionJson) {
    // Avoid states flashing back and forth by caching value from last time we had revisionJson. We'll have it again in a sec.
    return select("civil/blockchain").getCurrentVersionWasPublished();
  }

  const isPublished =
    hashContent(revisionJsonSansDate(revisionJson)) === lastPublishedRevision.revisionJsonSansDateHash;
  setCurrentVersionWasPublished(isPublished);

  return isPublished;
}

export function getCurrentVersionWasPublished(state: any): boolean {
  return state.currentVersionWasPublished;
}

/** Last *indexed* revision. TODO we should change "publish" to "index" everywhere but can't find/replace because we also use "publish" to refer to WP stuff, also I'm not convinced "index" will stay forever. */
export function getLastPublishedRevision(state: any): any {
  const publishedRevisions = select("civil/blockchain").getPublishedRevisions();
  if (publishedRevisions.length) {
    return publishedRevisions[publishedRevisions.length - 1];
  }
}

export function getLastArchivedRevision(state: any): any {
  const publishedRevisions = select("civil/blockchain").getPublishedRevisions();
  if (publishedRevisions.length) {
    return publishedRevisions.reverse().find((item: any) => {
      return item.archive && item.archive.ipfs;
    });
  }
}

/** Returns true or false if sig is valid/invalid, or null if not enough information to tell. */
export function isValidSignature(state: any, signature: ApprovedRevision): boolean | null {
  const newsroomAddress = window.civilNamespace && window.civilNamespace.newsroomAddress;
  const revisionJson = select("civil/blockchain").getLatestRevisionJSON();

  if (!revisionJson) {
    return null;
  }
  if (revisionJson.revisionContentHash !== signature.contentHash) {
    return false;
  }
  if (signature.newsroomAddress !== newsroomAddress) {
    return false;
  }
  if (
    recoverSignerPersonal({
      message: prepareUserFriendlyNewsroomMessage(signature.newsroomAddress, signature.contentHash),
      signature: signature.signature,
    }) !== signature.author
  ) {
    return false;
  }
  return true;
}

export function getPostAuthors(): any[] {
  return JSON.parse(getPostMeta(postMetaKeys.POST_AUTHORS) || "[]");
}

export function currentUserIsPostAuthor(): boolean {
  const id = select("civil/blockchain").getCurrentUserId();
  const authors: any[] = select("civil/blockchain").getPostAuthors();
  return authors.map(author => author.ID).indexOf(id) !== -1;
}

export function getTabIndex(state: any): number {
  return state.uiControl.openTabIndex;
}

export function isWalletReady(): boolean {
  const web3ProviderAddress = select("civil/blockchain").getWeb3ProviderAddress();
  const wpUserWalletAddress = select("civil/blockchain").getCurrentWpUserAddress();
  return (
    select("civil/blockchain").isCorrectNetwork() &&
    web3ProviderAddress &&
    web3ProviderAddress === wpUserWalletAddress &&
    hasInjectedProvider()
  );
}

/** Detects the case where post was saved when plugin wasn't active: revision JSON is retrieved from post info but is missing revisionContentHash (and other stuff). */
export function isPluginDataMissing(): boolean {
  const latestRevisionJson = select("civil/blockchain").getLatestRevisionJSON();

  return latestRevisionJson && !latestRevisionJson.revisionContentHash;
}
