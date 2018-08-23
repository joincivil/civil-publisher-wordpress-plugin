const { apiRequest } = window.wp;
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { ThemeProvider } from "styled-components";
import { Newsroom, addUser } from "@joincivil/newsroom-manager";
import { Civil, EthAddress, TxHash } from "@joincivil/core";
import { ManagerState } from "../shared/reducer";
import { addAddress, addTxHash } from "../shared/actions";
import { getCivil, hasInjectedProvider, saveAddressToProfile } from "../util";
import { apiNamespace, siteOptionKeys, userMetaKeys, NETWORK_NAME, NETWORK_NICE_NAME, theme } from "../constants";
import { Modal, buttonSizes, Button } from "@joincivil/components";
import { SearchUsers } from "./SeachUsers";

export interface AppProps {
  address?: EthAddress;
  txHash?: TxHash;
}

export interface AppState {
  creationModalOpen: boolean;
  profileAddressSaving: boolean;
  profileWalletAddress?: EthAddress;
  account?: EthAddress;
  currentNetwork?: string;
}

class App extends React.Component<AppProps & DispatchProp<any>, AppState> {
  public civil: Civil | undefined;
  public accountStream: any;
  public networkStream: any;

  constructor(props: AppProps & DispatchProp<any>) {
    super(props);
    this.civil = getCivil();
    this.state = {
      creationModalOpen: false,
      profileAddressSaving: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    if (!this.props.address && this.props.txHash && this.civil) {
      const newsroom = await this.civil.newsroomFromFactoryTxHashUntrusted(this.props.txHash);
      this.onNewsroomCreated(newsroom.address);
    }

    if (this.civil) {
      this.accountStream = this.civil!.accountStream.subscribe(this.setUserAccount);
      this.networkStream = this.civil!.networkNameStream.subscribe(this.setNetwork);
    }

    const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
    this.setState({
      profileWalletAddress: userInfo[userMetaKeys.WALLET_ADDRESS],
    });
  }

  public async componentWillMount(): Promise<void> {
    if (this.accountStream) {
      this.accountStream.unsubscribe();
    }
    if (this.networkStream) {
      this.networkStream.unsubscribe();
    }
  }

  public render(): JSX.Element {
    return (
      <>
        <Newsroom
          disabled={this.state.account !== this.state.profileWalletAddress}
          civil={this.civil}
          address={this.props.address}
          txHash={this.props.txHash}
          account={this.state.account}
          onNewsroomCreated={this.onNewsroomCreated}
          getNameForAddress={this.getNameForAddress}
          onContractDeployStarted={this.onContractDeployStarted}
          requiredNetwork={NETWORK_NAME}
          requiredNetworkNiceName={NETWORK_NICE_NAME}
          currentNetwork={this.state.currentNetwork}
          renderUserSearch={this.renderUserSearch}
          theme={theme}
          showWalletOnboarding={true}
          showWelcome={true}
          profileUrl={`${window.civilNamespace.wpAdminUrl}profile.php`}
          helpUrl={`${window.civilNamespace.wpAdminUrl}admin.php?page=civil-newsroom-protocol-help`}
          profileAddressSaving={this.state.profileAddressSaving}
          saveAddressToProfile={this.saveAddressToProfile}
          profileWalletAddress={this.state.profileWalletAddress}
        />
        {this.renderCreationModal()}
      </>
    );
  }

  private setUserAccount = (address: EthAddress): void => {
    this.setState({ account: address && address.toLowerCase() });
  };

  private setNetwork = (network: string): void => {
    this.setState({ currentNetwork: network });
  };

  private renderUserSearch = (onSetAddress: any): JSX.Element => {
    return <SearchUsers onSetAddress={onSetAddress} getOptions={this.fetchUserTypeAhead} />;
  };

  private fetchUserTypeAhead = async (str: string): Promise<any[]> => {
    return apiRequest({
      method: "GET",
      path: `/wp/v2/users?search=${str}&context=edit`,
    });
  };

  private renderCreationModal = (): JSX.Element | null => {
    if (!this.state.creationModalOpen) {
      return null;
    }
    return (
      <Modal>
        <h2>Congratulations!</h2>
        <p>You've created a newsroom.</p>
        <p>
          Now you can add additional officers and editors to help you manage your newsroom and publish content on the
          blockchain.
        </p>
        <Button size={buttonSizes.MEDIUM_WIDE} onClick={() => this.setState({ creationModalOpen: false })}>
          Close
        </Button>
      </Modal>
    );
  };

  private onContractDeployStarted = async (txHash: TxHash) => {
    const settings = await apiRequest({
      path: "/wp/v2/settings",
      method: "PUT",
      data: {
        [siteOptionKeys.NEWSROOM_TXHASH]: txHash,
      },
    });
    this.props.dispatch!(addTxHash(txHash));
  };

  private onNewsroomCreated = async (address: EthAddress) => {
    const settings = await apiRequest({
      path: "/wp/v2/settings",
      method: "PUT",
      data: {
        [siteOptionKeys.NEWSROOM_ADDRESS]: address,
      },
    });
    this.setState({ creationModalOpen: true });
    this.props.dispatch(addAddress(settings[siteOptionKeys.NEWSROOM_ADDRESS]));
  };

  private saveAddressToProfile = async () => {
    this.setState({
      profileAddressSaving: true,
    });

    await saveAddressToProfile(this.state.account!);
    this.setState({
      profileWalletAddress: this.state.account,
      profileAddressSaving: false,
    });
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
  return {
    address,
  };
};

export default connect(mapStateToProps)(App);
