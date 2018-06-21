const { Button, PanelRow } = window.wp.components;
import * as React from "react";
import { EthAddress, Hex, ApprovedRevision } from "@joincivil/core";
import { SignatureData } from "../store/interfaces";
import { Signature } from "./Signature";

export interface BlockchainSignPanelProps {
    username: string;
    signatures: SignatureData;
    signDisabled: boolean;
    userWalletAddress?: EthAddress;
    signArticle(): void;
    isValidSignature(signature: ApprovedRevision): boolean;
  }

export class BlockchainSignPanelComponent extends React.Component<BlockchainSignPanelProps> {
    public componentDidMount(): void {
      this.initSignPanel();
    }

    public render(): JSX.Element {
      const signatures = Object.entries(this.props.signatures).map(([key, val]: [string, ApprovedRevision]): JSX.Element => (
        <Signature
          authorUsername={key}
          authorAddress={val.author}
          sig={val.signature}
          sigStatus={this.props.isValidSignature(val) ? "valid" : "invalid"}
          isYou={val.author === this.props.userWalletAddress}
        />
      ));

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

    private initSignPanel(): void {
      // TODO Hook into gutenberg such that if article content is changed, we can mark signature as invalid, show helper text "article has changed since it was signed" etc.
      // one shitty option would be to use setInterval to keep checking `select("core/editor").isEditedPostDirty()` and if so, running `this.isValidSignature` or something and setting sig to invalid if necessary, but that would be an expensive option. or we could simply assume sig is invalid if post has changed at all, but we'd need to work around the fact that signing the article itself makes the post dirty, so the sig would immediately become "invalid".
      // (TODO if user undo's changes, would be nice to show that signature is valid again (we can cache initial article state and check against it?))
    }
}
