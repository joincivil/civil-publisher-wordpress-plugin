import { newsrooms, newsroomUi, newsroomUsers, newsroomContent, NewsroomState, RevisionAndJson } from "@joincivil/newsroom-manager";
import { Map } from "immutable";
import { combineReducers, AnyAction } from "redux";
import { managerActions } from "./actions";
import { EthAddress, EthContentHeader } from "@joincivil/core";

export function user(state: Map<string, any> = Map(), action: AnyAction): Map<string, any> {
  switch (action.type) {
    case managerActions.ADD_ADDRESS:
      return state.set("address", action.data.address);
    case managerActions.ADD_TXHASH:
      return state.set("txHash", action.data.txHash);
    default:
      return state;
  }
}

export interface ManagerState {
  newsrooms: Map<string, NewsroomState>;
  newsroomUi: Map<string, any>;
  newsroomUsers: Map<EthAddress, string>;
  newsroomContent: Map<number, Map<number, RevisionAndJson>>;
  user: Map<string, any>;
}

export default combineReducers<ManagerState>({
  newsrooms,
  newsroomUi,
  newsroomUsers,
  newsroomContent,
  user,
});
