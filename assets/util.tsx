const { apiRequest } = window.wp;
const { select } = window.wp.data;

import * as Web3 from "web3";
import { bufferToHex } from "ethereumjs-util";
import { Civil } from "@joincivil/core";

export let web3: any;
if (typeof window.web3 !== "undefined") {
  web3 = new Web3(window.web3.currentProvider);
} else {
  // TODO Alert user
  console.error("No web3 provider - try MetaMask!");
}

export async function getRevisionJson(): Promise<any> {
  const revisionId = select("core/editor").getCurrentPostLastRevisionId();

  try {
    const response = await apiRequest({ path: "/civil/newsroom-protocol/v1/revisions/" + revisionId });
    // console.log("revision JSON response:", response);
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

export async function signMessage(message: string): Promise<string> {
  // TODO this doesn't check that wallet is open, also web3 is being deprecated in favor of ethereumProvider
  const address = web3.eth.accounts[0].toLowerCase();

  const wpLoginAddress = ((await getLoggedInUserAddress()) || "[not set]").toLowerCase();
  if (address !== wpLoginAddress) {
    alert(
      'Your browser wallet says your ETH address is "' +
        address +
        '" but your WordPress login is set up with ETH address "' +
        wpLoginAddress +
        '" - please make sure you have configured and are using the correct address.',
    );
    throw new Error("ETH address mismatch - wallet extension doesn't match WP user meta");
  }
  const messageHex = bufferToHex(Buffer.from(message, "utf8") as any);

  return new Promise<string>((resolve, reject) => {
    web3.personal.sign(messageHex, address, (err: any, result: string) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

export async function getMessageToSign(): Promise<string> {
  const [contentHash, newsroomAddress] = await Promise.all([getRevisionContentHash(), getNewsroomAddress()]);
  // return [contentHash, newsroomAddress].join(":");
  return (
    "I, so-and-so, authorize article with content hash " +
    contentHash +
    " on behalf of newsroom " +
    newsroomAddress +
    "."
  );
}

/** Returns ETH address associated with logged-in WordPress user (rather than what web3 tells us) */
export async function getLoggedInUserAddress(): Promise<string> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
  return userInfo.civil_eth_wallet_address;
}

export async function getNewsroomAddress(): Promise<string> {
  const siteSettings = await apiRequest({ path: "/wp/v2/settings" });
  return siteSettings.newsroom_address;
}

export async function getNewsroom(): Promise<any> {
  const civil = new Civil();
  const newsroomAddress = await getNewsroomAddress();
  return civil.newsroomAtUntrusted(newsroomAddress);
}
