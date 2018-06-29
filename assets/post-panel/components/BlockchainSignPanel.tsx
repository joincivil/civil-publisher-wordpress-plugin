const { Button, PanelRow } = window.wp.components;
import * as React from "react";
import { EthAddress, ApprovedRevision } from "@joincivil/core";
import { SignatureData } from "../store/interfaces";
import { Signature } from "./Signature";

export interface BlockchainSignPanelProps {
  username: string;
  signatures: SignatureData;
  signDisabled: boolean;
  userWalletAddress?: EthAddress;
  isDirty: boolean;
  signArticle(): void;
  isValidSignature(signature: ApprovedRevision): boolean;
}

export class BlockchainSignPanelComponent extends React.Component<BlockchainSignPanelProps> {
  public render(): JSX.Element {
    const signatures = Object.entries(this.props.signatures).map(
      ([key, val]: [string, ApprovedRevision]): JSX.Element => (
        <Signature
          authorUsername={key}
          authorAddress={val.author}
          sig={val.signature}
          isDirty={this.props.isDirty}
          isValid={this.props.isValidSignature(val)}
          isYou={val.author === this.props.userWalletAddress}
        />
      ),
    );

    return (
      <div>
        <hr />
        <h2 className="components-panel__body-title">Signing</h2>
        <PanelRow>
          <i>Sign article for enhanced credibility</i>
        </PanelRow>
        {Object.keys(this.props.signatures).length > 0 && <>{signatures}</>}
        <PanelRow>
          <Button isPrimary={true} disabled={this.props.signDisabled} onClick={() => this.props.signArticle()}>
            Sign Article
          </Button>
          {this.props.isDirty && <i>Please save this post before signing.</i>}
        </PanelRow>
        <PanelRow>
          <i>
            {this.props.userWalletAddress ? (
              <>
                Signing as <code>{this.props.userWalletAddress}</code>
              </>
            ) : (
              <>
                Please set your wallet address in your <a href="/wp-admin/profile.php">your profile</a> before signing.
              </>
            )}
          </i>
        </PanelRow>
      </div>
    );
  }
}
