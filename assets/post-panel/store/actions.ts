import { EthAddress, TxHash } from "@joincivil/core";
import { AnyAction } from "redux";
import { actionTypes } from "./constants";
import { SignatureData } from "./interfaces";
import { isCorrectNetwork } from "../../util";

export function setIsNewsroomEditor(isEditor: boolean): AnyAction {
  return {
    type: actionTypes.SET_IS_NEWSROOM_EDITOR,
    data: isEditor,
  };
}

export function setUserData(id: number | "me", userData: any): AnyAction {
  return {
    type: actionTypes.SET_USER_DATA,
    data: {
      id,
      userData,
    },
  };
}

export function setCurrentUserId(userId: number): AnyAction {
  return {
    type: actionTypes.SET_CURRENT_USER_ID,
    data: userId,
  };
}

export function updateSignatures(signatures: SignatureData): AnyAction {
  return {
    type: actionTypes.UPDATE_SIGNATURES,
    data: signatures,
  };
}

export function updatePublishedState(publishedData: any): AnyAction {
  return {
    type: actionTypes.UPDATE_PUBLISHED_STATE,
    data: publishedData,
  };
}

export function addOrUpdateRevision(revisionID: string, revisionData: any): AnyAction {
  return {
    type: actionTypes.ADD_OR_UPDATE_REVISION,
    data: {
      revisionID,
      revisionData,
    },
  };
}

export function setCivilContentID(civilContentID: string): AnyAction {
  return {
    type: actionTypes.SET_CIVIL_CONTENT_ID,
    data: {
      civilContentID,
    },
  };
}

export const setIsCorrectNetwork = (networkName: string): AnyAction => {
  return {
    type: actionTypes.CHANGE_NETWORK,
    data: {
      isCorrectNetwork: isCorrectNetwork(networkName),
    },
  };
};
