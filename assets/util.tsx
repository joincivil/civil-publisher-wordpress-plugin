import * as moment from "moment";
import * as IPFS from "ipfs-api";
import { promisify } from "@joincivil/utils";
import { IpfsObject } from "@joincivil/newsroom-manager";
const { apiRequest } = window.wp;
const { select, dispatch } = window.wp.data;
const { getPostEdits } = select("core/editor");
const { editPost } = dispatch("core/editor");
const { dateI18n, getSettings } = window.wp.date;

import { Civil, ApprovedRevision } from "@joincivil/core";
import { Newsroom } from "@joincivil/core/build/src/contracts/newsroom";

import { timestampFormat } from "./constants";

export const getCivil = (() => {
  const civil: Civil | undefined = hasInjectedProvider() ? new Civil() : undefined;
  return (): Civil | undefined => civil;
})();

export const createIpfsUrl = (path: string) => {
  return `https://ipfs.infura.io/ipfs/${path}`;
};

export const getIPFS = (() => {
  const ipfs = new IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
  return (): IpfsObject => {
    return {
      add: promisify<[{ path: string; hash: string; size: number }]>(ipfs.add),
    };
  };
})();

export function revisionJsonSansDate(revisionJson: any): any {
  return {
    ...revisionJson,
    revisionDate: undefined,
  };
}

export async function createSignatureData(revisionJson: any): Promise<ApprovedRevision> {
  if (!revisionJson) {
    // Super edge case could only happen on a slow internet connection and if they opened sign panel and instantly hit sign before data hydrated.
    throw Error("Failed to create signature data: revisionJson is falsey");
  }
  const newsroom = await getNewsroom();
  return newsroom!.approveByAuthorPersonalSign(revisionJson.revisionContentHash);
}

export async function getNewsroom(): Promise<Newsroom> {
  const civil = getCivil();
  const newsroomAddress = window.civilNamespace && window.civilNamespace.newsroomAddress;
  return civil!.newsroomAtUntrusted(newsroomAddress);
}

export function isCorrectNetwork(networkName: string): boolean {
  return networkName === "rinkeby"; // just hard code it for now
}

export function hasInjectedProvider(): boolean {
  return typeof window !== "undefined" && (window as any).web3 !== undefined;
}

const dateSettings = getSettings();
/* Formats given Date object or UTC string in the timezone specified in CMS settings, in the given foramt or default format specified in constants. */
export function siteTimezoneFormat(utcTimestamp: string | Date, format: string = timestampFormat): string {
  const timezoned = moment.utc(utcTimestamp).utcOffset(dateSettings.timezone.offset * 60);
  return moment(timezoned).format(format);
}

/* Formats given Date object or UTC string in the timezone and format specified in CMS settings. */
export function siteTimezoneSiteFormat(utcTimestamp: string | Date): string {
  const timezoned = moment.utc(utcTimestamp).utcOffset(dateSettings.timezone.offset * 60);
  return dateI18n(dateSettings.formats.datetime, timezoned);
}

export function updatePostMeta(metaUpdates: object): void {
  const unsavedMeta = getPostEdits().meta;
  editPost({
    meta: { ...unsavedMeta, ...metaUpdates },
  });
}
