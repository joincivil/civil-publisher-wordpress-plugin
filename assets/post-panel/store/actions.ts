const { select } = window.wp.data;
import { EthAddress } from "@joincivil/core";
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

export function setWpUserAddress(
  address: EthAddress,
  id: number = select("civil/blockchain").getCurrentUserId(),
): AnyAction {
  return {
    type: actionTypes.SET_WP_USER_ADDRESS,
    data: {
      id,
      address,
    },
  };
}

export function setWeb3ProviderAddress(address: EthAddress): AnyAction {
  return {
    type: actionTypes.SET_WEB3_PROVIDER_ADDRESS,
    data: address,
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

export function setCurrentVersionWasPublished(wasIt: boolean): AnyAction {
  return {
    type: actionTypes.SET_CURRENT_VERSION_WAS_PUBLISHED,
    data: wasIt,
  };
}

export function setLastRevisionId(revisionID: number | null): AnyAction {
  return {
    type: actionTypes.SET_LAST_REVISION_ID,
    data: revisionID,
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

export const setOpenTab = (openTabIndex: number): AnyAction => {
  return {
    type: actionTypes.SET_OPEN_TAB,
    data: {
      openTabIndex,
    },
  };
};
