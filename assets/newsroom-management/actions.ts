import { AnyAction } from "redux";
import { EthAddress } from "@joincivil/core";

export enum managerActions {
  ADD_ADDRESS = "ADD_ADDRESS",
}

export const addAddress = (address: EthAddress): AnyAction => {
  return {
    type: managerActions.ADD_ADDRESS,
    data: {
      address,
    },
  };
};
