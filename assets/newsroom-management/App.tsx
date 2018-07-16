const { apiRequest } = window.wp;
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Newsroom } from "@joincivil/newsroom-manager";
import { Civil, EthAddress, TxHash } from "@joincivil/core";
import { ManagerState } from "./reducer";
import { addAddress, addTxHash } from "./actions";
import { getNewsroomAddress, getCivil, hasInjectedProvider } from "../util";
import { apiNamespace, siteOptionKeys } from "../constants";
import { WalletStatus } from "./WalletStatus";

export interface AppProps {
  address?: EthAddress;
  txHash?: TxHash;
}

const NETWORK_NAME = "rinkeby";
const NETWORK_NICE_NAME = "Rinkeby Test Network";

class App extends React.Component<AppProps & DispatchProp<any>> {
  public civil: Civil | undefined;

  constructor(props: AppProps & DispatchProp<any>) {
    super(props);
    this.civil = getCivil();
  }

  public async componentDidMount(): Promise<void> {
    if (!this.props.address && this.props.txHash && this.civil) {
      const newsroom = await this.civil.newsroomFromFactoryTxHashUntrusted(this.props.txHash);
      this.onNewsroomCreated(newsroom.address);
    }
  }

  public render(): JSX.Element {
    // TODO Civil core breaks when no wallet installed because `EthApi.detectProvider()` attempts to use HttpProvider and fails.
    return (
      <>
        <WalletStatus
          noProvider={!hasInjectedProvider()}
          walletLocked={this.civil && !this.civil.userAccount}
          wrongNetwork={this.civil && this.civil.networkName !== NETWORK_NAME}
          networkName={NETWORK_NICE_NAME}
          walletAddress={this.civil && this.civil.userAccount}
        />
        <hr />
        <Newsroom
          civil={this.civil}
          address={this.props.address}
          txHash={this.props.txHash}
          onNewsroomCreated={this.onNewsroomCreated}
          getNameForAddress={this.getNameForAddress}
          onContractDeployStarted={this.onContractDeployStarted}
          network={NETWORK_NAME}
        />
      </>
    );
  }

  private onContractDeployStarted = async (txHash: TxHash) => {
    const settings = await apiRequest({
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
