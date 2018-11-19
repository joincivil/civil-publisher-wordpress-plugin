import {
  newsrooms,
  newsroomUi,
  newsroomUsers,
  newsroomContent,
  newsroomGovernment,
  NewsroomState,
  RevisionAndJson,
  CmsUserData,
} from "@joincivil/newsroom-manager";
import { Map } from "immutable";
import { combineReducers, AnyAction } from "redux";
import { managerActions } from "./actions";
import { EthAddress } from "@joincivil/core";

export function user(state: Map<string, any> = Map(), action: AnyAction): Map<string, any> {
  switch (action.type) {
    case managerActions.ADD_ADDRESS:
      return state.set("address", action.data.address);
    case managerActions.ADD_TXHASH:
      return state.set("txHash", action.data.txHash);
    case managerActions.SET_METAMASK_ENABLED:
      return state.set("metamaskEnabled", action.data.enabled);
    default:
      return state;
  }
}

export interface ManagerState {
  newsrooms: Map<string, NewsroomState>;
  newsroomUi: Map<string, any>;
  newsroomUsers: Map<EthAddress, CmsUserData>;
  newsroomContent: Map<number, Map<number, RevisionAndJson>>;
  newsroomGovernment: Map<string, string>;
  user: Map<string, any>;
}

export default combineReducers<ManagerState>({
  newsrooms,
  newsroomUi,
  newsroomUsers,
  newsroomContent,
  newsroomGovernment,
  user,
});
