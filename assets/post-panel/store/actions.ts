import { EthAddress } from "@joincivil/core";

import { actionTypes } from "./constants";
import { SignatureData } from "./interfaces";

export function setUsername(username: string): any {
  return {
    type: actionTypes.SET_USERNAME,
    data: username,
  };
}

export function setLoggedInUserAddress(userWalletAddress: EthAddress): any {
  return {
    type: actionTypes.SET_LOGGED_IN_USER_ADDRESS,
    data: userWalletAddress,
  };
}

export function updateSignatures(signatures: SignatureData): any {
  return {
    type: actionTypes.UPDATE_SIGNATURES,
    data: signatures,
  };
}

export function updatePublishedState(publishedData: any): any {
  return {
    type: actionTypes.UPDATE_PUBLISHED_STATE,
    data: publishedData,
  };
}

// export function publishContent(content: string, signedData: any): any {
//   return {
//     type: actionTypes.PUBLISH_CONTENT,
//     data: {
//       content,
//       signedData,
//     },
//   };
// }

export function addOrUpdateRevision(revisionID: string, revisionData: any): any {
  return {
    type: actionTypes.ADD_OR_UPDATE_REVISION,
    data: {
      revisionID,
      revisionData,
    },
  };
}

export function setCivilContentID(civilContentID: string): any {
  return {
    type: actionTypes.SET_CIVIL_CONTENT_ID,
    data: {
      civilContentID,
    },
  };
}
