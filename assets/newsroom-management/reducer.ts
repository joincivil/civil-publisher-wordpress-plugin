import { newsrooms, newsroomUi, newsroomUsers, NewsroomState } from "@joincivil/newsroom-manager";
import { Map } from "immutable";
import { combineReducers, AnyAction } from "redux";
import { managerActions } from "./actions";
import { EthAddress } from "@joincivil/core";

export function user(state: Map<string, any> = Map(), action: AnyAction): Map<string, any> {
  switch (action.type) {
    case managerActions.ADD_ADDRESS:
      return state.set("address", action.data.address);
    default:
      return state;
  }
}

export interface ManagerState {
  newsrooms: Map<string, NewsroomState>;
  newsroomUi: Map<string, any>;
  newsroomUsers: Map<EthAddress, string>;
  user: Map<string, any>;
}

export default combineReducers<ManagerState, AnyAction>({
  newsrooms,
  newsroomUi,
  newsroomUsers,
  user,
});
