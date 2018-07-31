import * as React from "react";
import styled from "styled-components";
const { compose } = window.wp.element;
const { withSelect, withDispatch } = window.wp.data;
import { Civil, EthAddress } from "@joincivil/core";
import { getCivil, hasInjectedProvider } from "../../util";
import { ErrorText, Heading, BodySection } from "../styles";
import { NETWORK_NICE_NAME } from "../../constants";

export interface PanelWalletStatusProps {
  noProvider: boolean;
  isCorrectNetwork: boolean;
  web3ProviderAddress?: EthAddress;
}

export interface PanelWalletStatusState {
  creationModalOpen: boolean;
  profileWalletAddress?: EthAddress;
}

class PanelWalletStatusComponent extends React.Component<PanelWalletStatusProps, PanelWalletStatusState> {
  public civil: Civil | undefined;

  constructor(props: PanelWalletStatusProps) {
    super(props);
    this.civil = getCivil();
  }
  public componentDidMount(): void {
  }
  public componentWillUnmount(): void {
  }

  public render(): JSX.Element {
    const faqText = <><a href="#TODO" target="_blank">Read our FAQ</a> for more help.</>;
    let errorHeading = null;
    let errorBody = null;
    if (this.props.noProvider) {
      errorHeading = "Not logged into wallet";
      errorBody = <p>Don’t have a wallet? We recommend installing <a href="https://metamask.io/" target="_blank">MetaMask</a>, where you can create and set up your wallet. {faqText}</p>
    } else if (!this.props.web3ProviderAddress) {
      errorHeading = "Wallet locked";
      errorBody = <p>Please log in to your wallet to continue. {faqText}</p>
    } else if (!this.props.isCorrectNetwork) {
      errorHeading = "Change your network";
      errorBody = <p>Looks like you’re using an unsupported Ethereum network. Make sure you're using the {NETWORK_NICE_NAME}. {faqText}</p>
    }

    if (! errorHeading) {
      return <>{null}</>;
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
}

export const PanelWalletStatus = compose([
  withSelect(
    (select: any, ownProps: Partial<PanelWalletStatusProps>): Partial<PanelWalletStatusProps> => {
      const { isCorrectNetwork, getWeb3ProviderAddress } = select("civil/blockchain")
      return {
        noProvider: !hasInjectedProvider(),
        isCorrectNetwork: isCorrectNetwork(),
        web3ProviderAddress: getWeb3ProviderAddress(),
      };
    }
  ),
  withDispatch(
    (dispatch: any): Partial<PanelWalletStatusProps> => {
      return {
      };
    }
  ),
])(PanelWalletStatusComponent);
