import { apiNamespace } from "../../constants";
import { getNewsroom, getMetaMaskEnabled as metaMaskEnabled } from "../../util";
import {
  setIsNewsroomEditor,
  setUserData,
  setCurrentUserId,
  addOrUpdateRevision,
  setMetamaskIsEnabled,
  setName,
} from "./actions";
import { AnyAction } from "redux";

const { apiRequest } = window.wp;
const { select, dispatch } = window.wp.data;

export async function isNewsroomEditor(): Promise<AnyAction> {
  const newsroom = await getNewsroom();
  return setIsNewsroomEditor(await newsroom.hasEditorCapabilities());
}

export async function getName(): Promise<AnyAction> {
  const newsroom = await getNewsroom();
  const name = await newsroom.getName();
  return setName(name);
}

/** If no id supplied, defaults to current user. */
export async function getUserData(_id?: number | "me"): Promise<AnyAction> {
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

export async function getRevisionJSON(revisionID: string): Promise<AnyAction | void> {
  try {
    const response = await apiRequest({ path: apiNamespace + "revisions/" + revisionID });
    return addOrUpdateRevision(revisionID, response);
  } catch (err) {
    console.error("Failed to fetch revision JSON:", err);
    // TODO signal error to user
    throw Error("Failed to fetch revision JSON");
  }
}

export async function getCurrentUserId(): Promise<AnyAction> {
  const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
  return setCurrentUserId(userInfo.id);
}

export async function getMetaMaskEnabled(): Promise<AnyAction> {
  const enabled = await metaMaskEnabled();
  return setMetamaskIsEnabled(enabled);
}
