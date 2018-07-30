import { EthAddress, TxHash, ApprovedRevision } from "@joincivil/core";

import { recoverSignerPersonal, prepareUserFriendlyNewsroomMessage, hashContent } from "@joincivil/utils";
import { postMetaKeys, userMetaKeys } from "../../constants";
import { SignatureData } from "./interfaces";
import { setCivilContentID, updatePublishedState } from "./actions";
import { revisionJsonSansDate } from "../../util";

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
export function getUserData(state: any, id?: number | "me"): any {
  if (!id) {
    id = select("civil/blockchain").getCurrentUserId() || "me";
  }
  return state.userData[id!] || {};
}

export function getCurrentUserId(state: any): number {
  return state.currentUserId;
}

/** Returns ETH address associated with logged-in WordPress user (rather than what web3 tells us) */
export function getLoggedInUserAddress(state: any): EthAddress | undefined {
  return select("civil/blockchain").getUserData()[userMetaKeys.WALLET_ADDRESS];
}

export function getUserCapabilities(state: any): { [key: string]: boolean } {
  return select("civil/blockchain").getUserData().capabilities || {};
}

export function getSignatures(state: any): SignatureData {
  if (Object.keys(state.signatures).length) {
    return state.signatures;
  }
  return JSON.parse(getPostMeta()[postMetaKeys.SIGNATURES] || "{}");
}

export function getPublishedStatus(state: any): any {
  return state.publishedStatus;
}

export function getRevisionJSON(state: any, revisionID: string): any {
  return state.revisions[revisionID];
}

function getPostMeta(): any {
  return select("core/editor").getEditedPostAttribute("meta");
}

function isPostPublished(): boolean {
  return select("core/editor").isCurrentPostPublished();
}

export function getCivilContentID(store: any): string | null {
  let { civilContentID } = store;

  // TODO: Hmm, should this be in a resolver?
  if (!civilContentID) {
    civilContentID = getPostMeta()[postMetaKeys.CIVIL_CONTENT_ID];
    dispatch(setCivilContentID(civilContentID));
  }
  return civilContentID;
}

export function isPublishDisabled(state: any): boolean {
  const editorStore = select("core/editor");
  const currentPostLastRevisionId = editorStore.getCurrentPostLastRevisionId();
  const publishedRevisions = select("civil/blockchain").getPublishedRevisions();
  const latestRevisionPublished = publishedRevisions.length
    ? publishedRevisions[publishedRevisions.length - 1]
    : undefined;

  const isLatestRevisionPublished =
    latestRevisionPublished && latestRevisionPublished.revisionID === currentPostLastRevisionId;

  return (
    !isPostPublished() || editorStore.isCleanNewPost() || editorStore.isEditedPostDirty() || !!isLatestRevisionPublished
  );
}

export function getPublishedRevisions(state: any): any {
  let publishedRevisions = state.publishedStatus;

  if (!publishedRevisions.length) {
    const persistedPublishedRevisions = getPostMeta()[postMetaKeys.PUBLISHED_REVISIONS];
    publishedRevisions = JSON.parse(persistedPublishedRevisions || "[]");
    publishedRevisions = publishedRevisions.map((revision: any) => {
      let newRevision = revision;
      if (typeof revision.published === "string") {
        const published = new Date(revision.published);
        newRevision = { ...revision, published };
      }
      dispatch(updatePublishedState(newRevision));
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
  const txHash = getPostMeta()[postMetaKeys.CIVIL_PUBLISH_TXHASH];
  return txHash;
}

export function getCurrentIsVersionPublished(state: any): boolean {
  const editorStore = select("core/editor");
  const currentPostLastRevisionId = editorStore.getCurrentPostLastRevisionId();
  if (!currentPostLastRevisionId) {
    return false;
  }

  const lastPublishedRevision = select("civil/blockchain").getLastPublishedRevision();
  if (!lastPublishedRevision) {
    return false;
  }
  const revisionJson = select("civil/blockchain").getRevisionJSON(currentPostLastRevisionId);

  return (
    revisionJson && hashContent(revisionJsonSansDate(revisionJson)) === lastPublishedRevision.revisionJsonSansDateHash
  );
}

export function getLastPublishedRevision(state: any): any {
  const publishedRevisions = select("civil/blockchain").getPublishedRevisions();
  if (publishedRevisions.length) {
    return publishedRevisions[publishedRevisions.length - 1];
  }
}

export function isValidSignature(state: any, signature: ApprovedRevision): boolean {
  const { getCurrentPostLastRevisionId } = select("core/editor");
  const revisionId = getCurrentPostLastRevisionId();
  const newsroomAddress = window.civilNamespace && window.civilNamespace.newsroomAddress;
  let revisionJson: any;
  if (revisionId) {
    revisionJson = select("civil/blockchain").getRevisionJSON(revisionId);
  }
  if (!revisionJson) {
    return false;
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
