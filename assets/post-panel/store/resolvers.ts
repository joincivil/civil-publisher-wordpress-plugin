import { EthAddress } from "@joincivil/core";

import { apiNamespace, userMetaKeys } from "../../constants";
import { setUsername, setLoggedInUserAddress, addOrUpdateRevision } from "./actions";

const { apiRequest } = window.wp;

export async function getRevisionJSON(state: any, revisionID: string): Promise<any | void> {
  try {
    const response = await apiRequest({ path: apiNamespace + "revisions/" + revisionID });
    // console.log("revision JSON response:", response);
    return addOrUpdateRevision(revisionID, response);
  } catch (err) {
    console.error("Failed to fetch revision JSON:", err);
    // TODO signal error to user
    throw Error("Failed to fetch revision JSON");
  }
}

export async function getUsername(state: any): Promise<string> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me?context=edit" });
  return setUsername(userInfo.username);
}

/** Returns ETH address associated with logged-in WordPress user (rather than what web3 tells us) */
export async function getLoggedInUserAddress(state: any): Promise<EthAddress | undefined> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
  return setLoggedInUserAddress(userInfo[userMetaKeys.WALLET_ADDRESS]);
}
