import { EthAddress } from "@joincivil/core";

import { apiNamespace, userMetaKeys } from "../../constants";
import { getNewsroom } from "../../util";
import { setIsNewsroomEditor, setUserData, setCurrentUserId, setUsername, setLoggedInUserAddress, setUserCapabilities, addOrUpdateRevision } from "./actions";
import { AnyAction } from "redux";

const { apiRequest } = window.wp;

export async function isNewsroomEditor(state: any): Promise<AnyAction> {
  const newsroom = await getNewsroom();
  return setIsNewsroomEditor(await newsroom.isEditor());
}

export async function getUserData(state: any, userId: number): Promise<any> {
  console.log("getUserData resolver called for", userId);
  try {
    // TODO see if authors have permissions to list users (if not, how will we show names and avatars here?)
    const response = await apiRequest({ path: "/wp/v2/users/" + userId });
    return setUserData(userId, response);
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    // TODO signal error to user
    throw Error("Failed to fetch user data");
  }
}

export async function getRevisionJSON(state: any, revisionID: string): Promise<any | void> {
  try {
    const response = await apiRequest({ path: apiNamespace + "revisions/" + revisionID });
    return addOrUpdateRevision(revisionID, response);
  } catch (err) {
    console.error("Failed to fetch revision JSON:", err);
    // TODO signal error to user
    throw Error("Failed to fetch revision JSON");
  }
}

export async function getCurrentUserId(state: any): Promise<AnyAction> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
  return setCurrentUserId(userInfo.id);
}

export async function getUsername(state: any): Promise<AnyAction> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me?context=edit" });
  return setUsername(userInfo.username);
}

/** Returns ETH address associated with logged-in WordPress user (rather than what web3 tells us) */
export async function getLoggedInUserAddress(state: any): Promise<AnyAction> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
  return setLoggedInUserAddress(userInfo[userMetaKeys.WALLET_ADDRESS]);
}

export async function getUserCapabilities(state: any): Promise<AnyAction> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me?context=edit" });
  return setUserCapabilities(userInfo.capabilities);
}
