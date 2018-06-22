import { EthAddress } from "@joincivil/core";

import { postMetaKeys } from "../../constants";
import { SignatureData } from "./interfaces";
import { setCivilContentID, updatePublishedState } from "./actions";
import { revisionJsonSansDate } from "../../util";
import { hashContent } from "@joincivil/utils";

const { dispatch, select } = window.wp.data;

/*
function isResolving(selectorName: string, ...args: any[]): boolean {
  return select("core/data").isResolving(REDUCER_KEY, selectorName, ...args);
}
//*/

export function getUsername(state: any): string {
  return state.username;
}

/** Returns ETH address associated with logged-in WordPress user (rather than what web3 tells us) */
export function getLoggedInUserAddress(state: any): EthAddress | null {
  return state.userWalletAddress;
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
  const currentRevisionData = currentPostLastRevisionId
    ? select("civil/blockchain").getRevisionJSON(currentPostLastRevisionId)
    : undefined;
  const publishedRevisions = getPublishedRevisions(state);
  const latestRevisionPublished = publishedRevisions.length
    ? publishedRevisions[publishedRevisions.length - 1]
    : undefined;
  const isLatestRevisionPublished =
    (latestRevisionPublished && latestRevisionPublished.revisionID === currentPostLastRevisionId) ||
    (latestRevisionPublished &&
      currentRevisionData &&
      currentRevisionData.revisionContentHash === latestRevisionPublished.revisionContentHash);

  return (
    !isPostPublished() || editorStore.isCleanNewPost() || editorStore.isEditedPostDirty() || isLatestRevisionPublished
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

export function getPublishStatusString(state: any): string {
  const currentPostLastRevisionId = select("core/editor").getCurrentPostLastRevisionId();
  const currentRevisionData = currentPostLastRevisionId
    ? select("civil/blockchain").getRevisionJSON(currentPostLastRevisionId)
    : undefined;
  const publishedRevisions = getPublishedRevisions(state);
  let publishStatus;

  // TODO: Explore if this should be in a resolver
  if (!isPostPublished()) {
    publishStatus = "You must publish post before publishing to newsroom smart contract";
  } else if (!publishedRevisions.length) {
    publishStatus = "Your article is live on the web but not yet published to newsroom smart contract";
  } else {
    const lastPublishedRevision = publishedRevisions[publishedRevisions.length - 1];
    if (
      currentRevisionData &&
      hashContent(revisionJsonSansDate(currentRevisionData)) === lastPublishedRevision.revisionJsonSansDateHash
    ) {
      publishStatus = "Current version published";
    } else {
      const displayTime = lastPublishedRevision.published.toTimeString();
      publishStatus = `Warning: your published update no longer matches
        what's on the smart contract and will not validate.
        Last published at ${displayTime} time`;
    }
  }

  return publishStatus;
}

export function isCorrectNetwork(state: any): boolean {
  return state.network.isCorrectNetwork;
}
