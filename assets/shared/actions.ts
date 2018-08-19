import { AnyAction } from "redux";
import { EthAddress, TxHash } from "@joincivil/core";

export enum managerActions {
  ADD_ADDRESS = "ADD_ADDRESS",
  ADD_TXHASH = "ADD_TXHASH",
}

export const addAddress = (address: EthAddress): AnyAction => {
  return {
    type: managerActions.ADD_ADDRESS,
    data: {
      address,
    },
  };
};

export const addTxHash = (txHash: TxHash): AnyAction => {
  return {
    type: managerActions.ADD_TXHASH,
    data: {
      txHash,
    },
  };
};
