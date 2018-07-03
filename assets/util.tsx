const { apiRequest } = window.wp;
const { select } = window.wp.data;

import * as Web3 from "web3";
import { Civil, ApprovedRevision } from "@joincivil/core";
import { Newsroom } from "@joincivil/core/build/src/contracts/newsroom";

import { apiNamespace, userMetaKeys, siteOptionKeys } from "./constants";

export const getCivil = (() => {
  const civil: Civil | undefined = hasInjectedProvider() ? new Civil() : undefined;
  return (): Civil | undefined => civil;
})();

export async function getRevisionJson(): Promise<any> {
  const revisionId = select("core/editor").getCurrentPostLastRevisionId();

  try {
    const response = await apiRequest({ path: apiNamespace + "revisions/" + revisionId });
    return response;
  } catch (err) {
    console.error("Failed to fetch revision JSON:", err);
    // TODO signal error to user
    throw Error("Failed to fetch revision JSON");
  }
}

export function revisionJsonSansDate(revisionJson: any): any {
  return {
    ...revisionJson,
    revisionDate: undefined,
  };
}

export async function getRevisionContentHash(): Promise<string> {
  const revisionJson = await getRevisionJson();
  return revisionJson.revisionContentHash;
}

export async function createSignatureData(): Promise<ApprovedRevision> {
  const newsroom = await getNewsroom();
  const contentHash = await getRevisionContentHash();
  return newsroom!.approveByAuthorPersonalSign(contentHash);
}

/** Returns ETH address associated with logged-in WordPress user (rather than what web3 tells us) */
export async function getLoggedInUserAddress(): Promise<string> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
  return userInfo[userMetaKeys.WALLET_ADDRESS];
}

export async function getNewsroomAddress(): Promise<string> {
  const siteSettings = await apiRequest({ path: "/wp/v2/settings" });
  return siteSettings[siteOptionKeys.NEWSROOM_ADDRESS];
}

export async function getNewsroom(): Promise<Newsroom> {
  const civil = getCivil();
  const newsroomAddress = await getNewsroomAddress();
  return civil!.newsroomAtUntrusted(newsroomAddress);
}

export function isCorrectNetwork(): boolean {
  const civil = getCivil();
  if (!civil) {
    return false;
  }
  return civil.networkName === "rinkeby"; // just hard code it for now
}

export function hasInjectedProvider(): boolean {
  return typeof window !== "undefined" && (window as any).web3 !== undefined;
}
