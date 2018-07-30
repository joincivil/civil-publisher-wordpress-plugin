import { actionTypes } from "./constants";
import { SignatureData } from "./interfaces";
import { AnyAction } from "redux";
import { postMetaKeys } from "../../constants";
import { TxHash } from "@joincivil/core";

export const isNewsroomEditor = (state: boolean, action: AnyAction): boolean => {
  switch (action.type) {
    case actionTypes.SET_IS_NEWSROOM_EDITOR:
      return !!action.data;
    default:
      return !!state;
  }
};

export const userData = (state: { [id: number]: any } = {}, action: AnyAction): { [id: number]: any } => {
  switch (action.type) {
    case actionTypes.SET_USER_DATA:
      const { id, userData } = action.data;
      const newState = { ...state, [id]: userData };
      if (id === "me") {
        // also index by actual ID
        newState[userData.id] = userData;
      }
      return newState;
    default:
      return state;
  }
};

export const currentUserId = (state: number | null = null, action: AnyAction): number | null => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_USER_ID:
      return action.data;
    default:
      return state;
  }
};

export const publishedStatus = (state: any[] = [], action: AnyAction): any => {
  switch (action.type) {
    case actionTypes.UPDATE_PUBLISHED_STATE:
      const publishedRevisionIDs = state.map(revision => revision.revisionID);
      if (publishedRevisionIDs.includes(action.data.revisionID)) {
        return state;
      }
      return state.concat([action.data]);
    default:
      return state;
  }
};

export const lastRevisionId = (state: number | null = null, action: AnyAction): number | null => {
  switch (action.type) {
    case actionTypes.SET_LAST_REVISION_ID:
      return action.data;
    default:
      return state;
  }
};

export const revisions = (state: any = {}, action: AnyAction): any => {
  switch (action.type) {
    case actionTypes.ADD_OR_UPDATE_REVISION:
      const { revisionID, revisionData } = action.data;
      return { ...state, [revisionID]: revisionData };
    default:
      return state;
  }
};

export const civilContentID = (state: string | null = null, action: AnyAction): string | null => {
  switch (action.type) {
    case actionTypes.SET_CIVIL_CONTENT_ID:
      return action.data.civilContentID;
    default:
      return state;
  }
};

export const signatures = (state: SignatureData = {}, action: AnyAction): SignatureData => {
  switch (action.type) {
    case actionTypes.UPDATE_SIGNATURES:
      return { ...state, ...action.data };
    default:
      return state;
  }
};

export const network = (state: { isCorrectNetwork: boolean } = { isCorrectNetwork: true }, action: AnyAction) => {
  switch (action.type) {
    case actionTypes.CHANGE_NETWORK:
      return action.data;
    default:
      return state;
  }
};
