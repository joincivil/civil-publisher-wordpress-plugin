const { apiRequest } = window.wp;
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Newsroom } from "@joincivil/newsroom-manager";
import { Civil, EthAddress, TxHash } from "@joincivil/core";
import { ManagerState } from "./reducer";
import { addAddress } from "./actions";
import { getCivil } from "../util";
import { apiNamespace, siteOptionKeys } from "../constants";

export interface AppProps {
  address?: EthAddress;
  txHash?: TxHash;
}

class App extends React.Component<AppProps & DispatchProp<any>> {
  public civil: Civil;

  constructor(props: AppProps & DispatchProp<any>) {
    super(props);
    this.civil = getCivil();
  }

  public async componentDidMount(): Promise<void> {
    if (!this.props.address && this.props.txHash) {
      const newsroom = await this.civil.newsroomFromFactoryTxHashUntrusted(this.props.txHash);
      await this.onNewsroomCreated(newsroom.address);
    }
  }

  public render(): JSX.Element {
    return (
      <Newsroom
        civil={this.civil}
        address={this.props.address}
        txHash={this.props.txHash}
        onNewsroomCreated={this.onNewsroomCreated}
        getNameForAddress={this.getNameForAddress}
        onContractDeployStarted={this.onContractDeployStarted}
      />
    );
  }

  private onContractDeployStarted = async (txHash: TxHash) => {
    await apiRequest({
      path: "/wp/v2/settings",
      method: "PUT",
      data: {
        [siteOptionKeys.NEWSROOM_TXHASH]: txHash,
      },
    });
  };

  private onNewsroomCreated = async (address: EthAddress) => {
    const settings = await apiRequest({
      path: "/wp/v2/settings",
      method: "PUT",
      data: {
        [siteOptionKeys.NEWSROOM_ADDRESS]: address,
      },
    });
    this.props.dispatch(addAddress(settings[siteOptionKeys.NEWSROOM_ADDRESS]));
  };

  private getNameForAddress = async (address: EthAddress) => {
    try {
      const user = await apiRequest({
        path: apiNamespace + `user-by-eth-address/${address}`,
      });
      return user.display_name;
    } catch (e) {
      return "Could not find a user with that address.";
    }
  };
}

const mapStateToProps = (state: ManagerState): AppProps => {
  const { user } = state;
  const address = user.get("address");
  const txHash = user.get("txHash");
  return {
    address,
    txHash,
  };
};

export default connect(mapStateToProps)(App);
