import { AnyAction } from "redux";
import { EthAddress, TxHash } from "@joincivil/core";

export enum managerActions {
  ADD_ADDRESS = "ADD_ADDRESS",
  ADD_TXHASH = "ADD_TXHASH",
  SET_METAMASK_ENABLED = "SET_METAMASK_ENABLED",
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

export const setMetaMaskEnabled = (enabled: boolean): AnyAction => {
  return {
    type: managerActions.SET_METAMASK_ENABLED,
    data: {
      enabled,
    },
  };
};
