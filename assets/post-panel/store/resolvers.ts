import { apiNamespace } from "../../constants";
import { getNewsroom } from "../../util";
import {
  setIsNewsroomEditor,
  setUserData,
  setCurrentUserId,
  addOrUpdateRevision,
  setMetamaskIsEnabled,
} from "./actions";
import { AnyAction } from "redux";

const { apiRequest } = window.wp;
const { select, dispatch } = window.wp.data;

export async function isNewsroomEditor(state: any): Promise<AnyAction> {
  const newsroom = await getNewsroom();
  return setIsNewsroomEditor(await newsroom.hasEditorCapabilities());
}

/** If no id supplied, defaults to current user. */
export async function getUserData(state: any, _id?: number | "me"): Promise<AnyAction> {
  const id = _id || select("civil/blockchain").getCurrentUserId() || "me";

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
    if (err.responseJSON && err.responseJSON.code === "no-revision-found") {
      return setLastRevisionId(null);
    }
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

export async function getMetaMaskEnabled(state: any): Promise<AnyAction> {
  let enabled = true;
  if ((window as any).ethereum && (window as any).ethereum.isEnabled) {
    enabled = await (window as any).ethereum.isEnabled();
  }
  return setMetamaskIsEnabled(enabled);
}
