import { actionTypes } from "./constants";
import { SignatureData } from "./interfaces";
const { combineReducers } = window.wp.data;

export const username = (state: string | null = null, action: any): string | null => {
  switch (action.type) {
    case actionTypes.SET_USERNAME:
      return action.data;
    default:
      return state;
  }
};

export const userWalletAddress = (state: string | null = null, action: any): string | null => {
  switch (action.type) {
    case actionTypes.SET_LOGGED_IN_USER_ADDRESS:
      return action.data;
    default:
      return state;
  }
};

export const publishedStatus = (state: any[] = [], action: any): any => {
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

export const revisions = (state: any = {}, action: any): any => {
  switch (action.type) {
    case actionTypes.ADD_OR_UPDATE_REVISION:
      const { revisionID, revisionData } = action.data;
      return { ...state, [revisionID]: revisionData };
    default:
      return state;
  }
};

export const civilContentID = (state: string | null = null, action: any): string | null => {
  switch (action.type) {
    case actionTypes.SET_CIVIL_CONTENT_ID:
      return action.data.civilContentID;
    default:
      return state;
  }
};

export const signatures = (state: SignatureData = {}, action: any): SignatureData => {
  switch (action.type) {
    case actionTypes.UPDATE_SIGNATURES:
      return { ...state, ...action.data };
    default:
      return state;
  }
};

const reducer = combineReducers({
  username,
  userWalletAddress,
  signatures,
  publishedStatus,
  revisions,
  civilContentID,
});

export default reducer;
