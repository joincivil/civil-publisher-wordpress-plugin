import * as React from "react";
import styled from "styled-components";
const { compose } = window.wp.element;
const { withSelect, withDispatch } = window.wp.data;
const { Button } = window.wp.components;
import { EthAddress } from "@joincivil/core";
import { hasInjectedProvider, saveAddressToProfile } from "../../util";
import { ErrorText, Heading, BodySection } from "../styles";
import { NETWORK_NICE_NAME } from "../../constants";

export interface PanelWalletStatusProps {
  noProvider: boolean;
  isCorrectNetwork: boolean;
  wpUserWalletAddress?: EthAddress;
  web3ProviderAddress?: EthAddress;
}

export interface PanelWalletStatusState {
  creationModalOpen: boolean;
  profileWalletAddress?: EthAddress;
}

const Address = styled.code`
  word-wrap: break-word;
`;

class PanelWalletStatusComponent extends React.Component<PanelWalletStatusProps, PanelWalletStatusState> {
  public render(): JSX.Element | null {
    const faqText = (
      <>
        <a href="#TODO" target="_blank">
          Read our FAQ
        </a>{" "}
        for more help.
      </>
    );
    let errorHeading = null;
    let errorBody = null;
    if (this.props.noProvider) {
      errorHeading = "Not logged into wallet";
      errorBody = (
        <p>
          Don’t have a wallet? We recommend installing{" "}
          <a href="https://metamask.io/" target="_blank">
            MetaMask
          </a>, where you can create and set up your wallet. {faqText}
        </p>
      );
    } else if (!this.props.web3ProviderAddress) {
      errorHeading = "Wallet locked";
      errorBody = <p>Please log in to your wallet to continue. {faqText}</p>;
    } else if (!this.props.isCorrectNetwork) {
      errorHeading = "Change your network";
      errorBody = (
        <p>
          Looks like you’re using an unsupported Ethereum network. Make sure you're using the {NETWORK_NICE_NAME}.{" "}
          {faqText}
        </p>
      );
    } else if (!this.props.wpUserWalletAddress) {
      errorHeading = "Not saved to profile";
      errorBody = (
        <>
          <p>You must save your wallet address to your WordPress user profile before continuing.</p>
          <Button isPrimary={true} onClick={this.saveAddress}>
            Save to Your Profile
          </Button>
        </>
      );
    } else if (this.props.wpUserWalletAddress !== this.props.web3ProviderAddress) {
      errorHeading = "Wallet address mismatch";
      errorBody = (
        <>
          <p>
            Your wallet address in MetaMask (<Address>{this.props.web3ProviderAddress}</Address>) does not match the
            wallet address saved to your WordPress user profile (<Address>{this.props.wpUserWalletAddress}</Address>).
            Please either log in to MetaMask with the correct wallet address, or change the wallet address saved in your
            profile.
          </p>
          <Button isPrimary={true} onClick={this.saveAddress}>
            Save MetaMask Address to Your Profile
          </Button>
        </>
      );
    } else {
      return null;
    }

    return (
      <BodySection>
        <Heading>
          Wallet
          {errorHeading && <ErrorText>{errorHeading}</ErrorText>}
        </Heading>
        {errorBody}
      </BodySection>
    );
  }

  private saveAddress = async () => {
    saveAddressToProfile(this.props.web3ProviderAddress!);
  };
}

export const PanelWalletStatus = compose([
  withSelect(
    (select: any, ownProps: Partial<PanelWalletStatusProps>): Partial<PanelWalletStatusProps> => {
      const { isCorrectNetwork, getWeb3ProviderAddress, getCurrentWpUserAddress } = select("civil/blockchain");
      return {
        noProvider: !hasInjectedProvider(),
        isCorrectNetwork: isCorrectNetwork(),
        web3ProviderAddress: getWeb3ProviderAddress(),
        wpUserWalletAddress: getCurrentWpUserAddress(),
      };
    },
  ),
])(PanelWalletStatusComponent);
