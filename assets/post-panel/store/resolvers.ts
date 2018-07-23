import { EthAddress } from "@joincivil/core";

import { apiNamespace, userMetaKeys } from "../../constants";
import { getNewsroom } from "../../util";
import { setIsNewsroomEditor, setUserData, setCurrentUserId, addOrUpdateRevision } from "./actions";
import { AnyAction } from "redux";

const { apiRequest } = window.wp;
const { select } = window.wp.data;

export async function isNewsroomEditor(state: any): Promise<AnyAction> {
  const newsroom = await getNewsroom();
  return setIsNewsroomEditor(await newsroom.isEditor());
}

/** If no id supplied, defaults to current user. */
export async function getUserData(state: any, id?: number | "me"): Promise<any> {
  if (!id) {
    id = select("civil/blockchain").getCurrentUserId() || "me";
  }

  try {
    // TODO authors can't list users (can't get any info about them at all), so we have to show dummy data for other sigs
    const userData = await apiRequest({ path: "/wp/v2/users/" + id + "?context=edit" });
    id = id === "me" ? userData.id : id;
    return setUserData(id!, userData);
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    // TODO signal error to user
    throw Error("Failed to fetch user data");
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
