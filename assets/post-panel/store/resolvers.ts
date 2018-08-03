import { EthAddress } from "@joincivil/core";

import { apiNamespace, userMetaKeys } from "../../constants";
import { getNewsroom } from "../../util";
import { setIsNewsroomEditor, setUserData, setCurrentUserId, addOrUpdateRevision } from "./actions";
import { AnyAction } from "redux";

const { apiRequest } = window.wp;
const { select, dispatch } = window.wp.data;

export async function isNewsroomEditor(state: any): Promise<AnyAction> {
  const newsroom = await getNewsroom();
  return setIsNewsroomEditor(await newsroom.isEditor());
}

/** If no id supplied, defaults to current user. */
export async function getUserData(state: any, id?: number | "me"): Promise<AnyAction> {
  if (!id) {
    id = select("civil/blockchain").getCurrentUserId() || "me";
  }

  try {
    const userData = await apiRequest({ path: "/wp/v2/users/" + id + "?context=edit" });
    return setUserData(id!, userData);
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    // TODO signal error to user
    throw Error("Failed to fetch user data");
  }
}

export async function getLastRevisionId(): Promise<AnyAction> {
  const postId = select("core/editor").getCurrentPostId();
  const { setLastRevisionId } = dispatch("civil/blockchain");

  try {
    const response = await apiRequest({ path: apiNamespace + "posts/" + postId + "/last-revision-id" });
    const revisionId = parseInt(response, 10);

    if (isNaN(revisionId)) {
      throw Error("Invalid response fetching last revision ID");
    }

    return setLastRevisionId(revisionId);
  } catch (err) {
    console.error("Failed to fetch last revision ID:", err);
    throw Error("Failed to fetch last revision ID");
  }
}

export async function getRevisionJSON(state: any, revisionID: string): Promise<AnyAction | void> {
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
