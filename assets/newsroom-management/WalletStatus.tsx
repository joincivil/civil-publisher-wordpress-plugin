import * as React from "react";
import { EthAddress } from "@joincivil/core";
import { NorthEastArrow } from "@joincivil/components";
import styled, { StyledComponentClass } from "styled-components";
const { Button } = window.wp.components;

export interface WalletStatusProps {
  noProvider?: boolean;
  walletLocked?: boolean;
  wrongNetwork?: boolean;
  networkName: string;
  walletAddress?: EthAddress;
}

const Wrapper = styled.div`
  margin: 32px 0;
  padding: 8px 24px 0;
  background: white;
  border: solid 1px #e5e5e5;
  color: #5f5f5f;

  &:after {
    content: "";
    display: table;
    clear: both;
  }
`;

const ActionButton = styled(Button)`
  &&& {
    padding: 8px 36px;
    height: auto;
    font-size: 14px;
    font-weight: bold;
  }
`;

const WalletAddress = styled.span`
  display: inline-block;
  margin: 0 0 10px 10px;
  padding: 5px 10px;
  border: 1px solid #dddddd;
`;

const ArrowWrap = styled.span`
  margin-left: 5px;
  path {
    fill: white;
  }
`;

export class WalletStatus extends React.Component<WalletStatusProps> {
  constructor(props: WalletStatusProps) {
    super(props);
  }

  public render(): JSX.Element | null {
    if (this.props.noProvider) {
      return (
        <Wrapper>
          <h2>It looks like you aren’t logged in to your wallet</h2>
          <p>
            New to this, or don't have a wallet? Having a wallet is mandatory and we recommend{" "}
            <a href="https://metamask.io/" target="_blank">
              MetaMask
            </a>{" "}
            to set up and fund your wallet.{" "}
            <a href="/wp-admin/admin.php?page=civil-newsroom-protocol-help#TODO" target="_blank">
              Read this FAQ
            </a>.
          </p>
          <p>
            MetaMask will create a wallet address and you’ll be able to buy Ether (ETH) with your bank or credit card,
            to cover fees. Processing times can vary (up to 7 days) and we recommend having $50 USD to start.
          </p>
          <p>
            You will use your MetaMask wallet to set up and manage your contract, as well as sign and index posts to the
            Ethereum blockchain. Make sure you've backed up your{" "}
            <a href="/wp-admin/admin.php?page=civil-newsroom-protocol-help#TODO" target="_blank">
              seed phrase
            </a>{" "}
            from MetaMask in a safe place.
          </p>

          <h2>Set up MetaMask wallet</h2>
          <div style={{ display: "inline-block" }}>
            {/*TODO add northeast arrow*/}
            <p>
              <ActionButton isPrimary={true} href="https://metamask.io/" target="_blank">
                View MetaMask!{" "}
                <ArrowWrap>
                  <NorthEastArrow />
                </ArrowWrap>
              </ActionButton>
            </p>
            <p>
              Once done,{" "}
              <a href="javascript:void(0)" onClick={() => window.location.reload()}>
                refresh this page
              </a>
            </p>
          </div>
          <div style={{ display: "inline-block", float: "right", textAlign: "center", maxWidth: "240px" }}>
            <p>Already have a wallet?</p>
            <p style={{ color: "#72777c" }}>
              Make sure you are logged in to your wallet on the Rinkeby Test Network, and then{" "}
              <a href="javascript:void(0)" onClick={() => window.location.reload()}>
                refresh this page
              </a>
            </p>.
          </div>
        </Wrapper>
      );
    } else if (this.props.walletLocked) {
      return (
        <Wrapper>
          <h2>Not logged in to wallet</h2>
          <p>
            Please log in to your wallet to continue setting up your newsroom contract.{" "}
            <a href="/wp-admin/admin.php?page=civil-newsroom-protocol-help#TODO" target="_blank">
              Help?
            </a>
          </p>
          <p>Once you are on logged in, refresh this page.</p>
          <p>
            <ActionButton isPrimary={true} onClick={() => window.location.reload()}>
              Refresh
            </ActionButton>
          </p>
        </Wrapper>
      );
    } else if (this.props.wrongNetwork) {
      return (
        <Wrapper>
          <h2>Change your network</h2>
          <p>
            Looks like you’re using an unsupported Ethereum network. Make sure you're using the {this.props.networkName}.{" "}
            <a href="/wp-admin/admin.php?page=civil-newsroom-protocol-help#TODO" target="_blank">
              Help?
            </a>
          </p>
          <p>Once you are on the correct network, refresh this page.</p>
          <p>
            <ActionButton isPrimary={true} onClick={() => window.location.reload()}>
              Refresh
            </ActionButton>
          </p>
        </Wrapper>
      );
    } else if (this.props.walletAddress) {
      return (
        <Wrapper>
          <h2>Wallet Connected</h2>
          <p>Your wallet is connected. Now it’s time to set up your smart contract.</p>
          <p>
            Your Wallet Address is
            <WalletAddress>{this.props.walletAddress}</WalletAddress>
          </p>
        </Wrapper>
      );
    } else {
      return null;
    }
  }
}
