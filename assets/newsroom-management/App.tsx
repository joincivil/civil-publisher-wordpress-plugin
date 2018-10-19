const { apiRequest } = window.wp;
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Newsroom, CmsUserData, IpfsObject } from "@joincivil/newsroom-manager";
import { Civil, EthAddress, TxHash, CharterData } from "@joincivil/core";
import { ManagerState } from "../shared/reducer";
import { addAddress, addTxHash } from "../shared/actions";
import { saveAddressToProfile } from "../api-helpers";
import { apiNamespace, siteOptionKeys, userMetaKeys, NETWORK_NAME, NETWORK_NICE_NAME, theme, urls } from "../constants";
import { getCivil, getIPFS } from "../util";
import { Modal, buttonSizes, Button } from "@joincivil/components";
import { SearchUsers } from "./SearchUsers";

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
  public ipfs: IpfsObject | undefined;
  public accountStream: any;
  public networkStream: any;

  constructor(props: AppProps & DispatchProp<any>) {
    super(props);
    this.civil = getCivil();
    this.ipfs = getIPFS();
    this.state = {
      creationModalOpen: false,
      profileAddressSaving: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    if (!this.props.address && this.props.txHash && this.civil) {
      const newsroom = await this.civil.newsroomFromFactoryTxHashUntrusted(this.props.txHash);
      await this.onNewsroomCreated(newsroom.address);
    }

    if (this.civil) {
      this.accountStream = this.civil!.accountStream.subscribe(this.setUserAccount);
      this.networkStream = this.civil!.networkNameStream.subscribe(this.setNetwork);
    }

    try {
      const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
      this.setState({
        profileWalletAddress: userInfo[userMetaKeys.WALLET_ADDRESS],
      });
    } catch (err) {
      console.error("Failed to fetch user info for profile wallet address:", err);
    }
  }

  public async componentWillUnmount(): Promise<void> {
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
          ipfs={this.ipfs}
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
          profileUrl={urls.PROFILE}
          helpUrl={urls.HELP}
          newsroomUrl={urls.HOMEPAGE}
          logoUrl={urls.LOGO}
          profileAddressSaving={this.state.profileAddressSaving}
          saveAddressToProfile={this.saveAddressToProfile}
          profileWalletAddress={this.state.profileWalletAddress}
          persistCharter={this.persistCharter}
          getPersistedCharter={this.loadCharter}
        />
        {this.renderCreationModal()}
      </>
    );
  }

  private setUserAccount = (address?: EthAddress): void => {
    this.setState({ account: address && address.toLowerCase() });
  };

  private setNetwork = (network: string): void => {
    this.setState({ currentNetwork: network });
  };

  private renderUserSearch = (onSetAddress: (address: string) => void): JSX.Element => {
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
        <h2>You created a newsroom smart contract!</h2>
        <p>Congratulations, your Newsroom smart contract processed successfully.</p>
        <p>Next, let's add additional accounts to your Newsroom smart contract.</p>
        <Button size={buttonSizes.MEDIUM_WIDE} onClick={() => this.setState({ creationModalOpen: false })}>
          OK
        </Button>
      </Modal>
    );
  };

  private onContractDeployStarted = async (txHash: TxHash) => {
    try {
      await apiRequest({
        path: "/wp/v2/settings",
        method: "PUT",
        data: {
          [siteOptionKeys.NEWSROOM_TXHASH]: txHash,
        },
      });
    } catch (err) {
      const errText = "Failed to save newsroom creation tx hash to WP settings";
      console.error(errText, err);
      throw Error(errText);
    }
    this.props.dispatch!(addTxHash(txHash));
  };

  private onNewsroomCreated = async (address: EthAddress) => {
    try {
      const settings = await apiRequest({
        path: "/wp/v2/settings",
        method: "PUT",
        data: {
          [siteOptionKeys.NEWSROOM_ADDRESS]: address,
        },
      });
      this.setState({ creationModalOpen: true });
      this.props.dispatch(addAddress(settings[siteOptionKeys.NEWSROOM_ADDRESS]));
    } catch (err) {
      const errText = "Failed to save newly created newsroom address WP settings";
      console.error(errText, err);
      throw Error(errText);
    }
  };

  private saveAddressToProfile = async () => {
    this.setState({
      profileAddressSaving: true,
    });

    try {
      await saveAddressToProfile(this.state.account!);
    } catch (err) {
      const errText = "Failed to save wallet address to WP user profile";
      console.error(errText, err);
      throw Error(errText);
    }
    this.setState({
      profileWalletAddress: this.state.account,
      profileAddressSaving: false,
    });
  };

  private getNameForAddress = async (address: EthAddress): Promise<CmsUserData> => {
    try {
      const user = await apiRequest({
        path: apiNamespace + `user-by-eth-address/${address}`,
      });
      return {
        displayName: user.display_name,
        username: user.user_login,
        avatarUrl: user.avatar_url,
      };
    } catch (e) {
      return undefined;
    }
  };

  private persistCharter = async (charter: Partial<CharterData>): Promise<void> => {
    try {
      await apiRequest({
        path: "/wp/v2/settings",
        method: "PUT",
        data: {
          [siteOptionKeys.NEWSROOM_CHARTER]: JSON.stringify(charter),
        },
      });
    } catch (err) {
      const errText = "Failed to save newsroom charter to WP settings";
      console.error(errText, err);
      throw Error(errText);
    }
  };

  private loadCharter = async (): Promise<Partial<CharterData> | void> => {
    try {
      const settings = await apiRequest({
        path: "/wp/v2/settings",
      });
      const charter = settings[siteOptionKeys.NEWSROOM_CHARTER];
      if (charter) {
        return JSON.parse(charter);
      }
    } catch (err) {
      const errText = "Failed to load newsroom charter from WP settings";
      console.error(errText, err);
      throw Error(errText);
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
