const { Button, PanelRow } = window.wp.components;
const { withSelect, withDispatch } = window.wp.data;
const { compose } = window.wp.element;
import * as React from "react";
import { EthAddress, Hex } from "@joincivil/core";

import { signMessage, getMessageToSign } from "../util";
import { postMetaKeys } from "../constants";
import { SignatureData } from "./store/interfaces";

export type signatureStatusType = "unsigned" | "valid" | "invalid";
export interface BlockchainSignPanelState {}
export interface BlockchainSignPanelProps {
  username: string;
  signatures: SignatureData;
  signDisabled: boolean;
  userWalletAddress?: EthAddress;
  signArticle(): void;
  isValidSignature(authorAddress: EthAddress, sig: Hex): boolean;
}

const SignButton = withDispatch((dispatch: any, ownProps: any) => {
  const { signArticle } = ownProps;
  return {
    onClick(): void {
      signArticle();
    },
  };
})(Button);

function Signature(ownProps: any): JSX.Element {
  const { authorUsername, authorAddress, sig, sigStatus, isYou } = ownProps;
  return (
    <PanelRow>
      <div style={{ border: "1px solid lightgray", padding: "5px" }}>
        <div>
          {authorUsername} {isYou && <b>(you) </b>}
          <span>
            (<code>{authorAddress}</code>)
          </span>
        </div>
        <div>
          Signature: <code>{sig}</code>
        </div>
        <div>
          Status: <span style={{ color: sigStatus === "invalid" ? "red" : "inherit" }}>{sigStatus}</span>
        </div>
      </div>
    </PanelRow>
  );
}

class BlockchainSignPanelComponent extends React.Component<BlockchainSignPanelProps, BlockchainSignPanelState> {
  constructor(props: BlockchainSignPanelProps) {
    super(props);
  }

  public componentDidMount(): void {
    this.initSignPanel();
  }

  public render(): JSX.Element {
    const signatures = Object.entries(this.props.signatures).map(([key, val]) => (
      <Signature
        authorUsername={key}
        authorAddress={val.authorAddress}
        sig={val.signature}
        sigStatus={this.props.isValidSignature(val.authorAddress, val.signature) ? "valid" : "invalid"}
        isYou={val.authorAddress === this.props.userWalletAddress}
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
          <SignButton isPrimary={true} disabled={this.props.signDisabled} signArticle={this.props.signArticle}>
            Sign Article
          </SignButton>
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

const BlockchainSignPanel = compose([
  withSelect(
    (selectStore: any, ownProps: Partial<BlockchainSignPanelProps>): Partial<BlockchainSignPanelProps> => {
      const { isEditedPostDirty, isCleanNewPost } = selectStore("core/editor");
      const { getUsername, getLoggedInUserAddress, getSignatures } = selectStore("civil/blockchain");

      const username = getUsername();

      let signatures = getSignatures();
      // testing starting off with dummy
      // if (! Object.keys(signatures).length) {
      //   signatures = {
      //     user1: { authorAddress: "0xauthor1", signature: "0xsig1" },
      //     user2: { authorAddress: "0xauthor2", signature: "0xsig2" },
      //   };
      // }

      /** Check if given signature is valid given the current post content. */
      const isValidSignature = (authorAddress: EthAddress, sig: Hex): boolean => {
        // TODO

        // FYI i have tested and both `select("core/editor").getCurrentPost().content` and `select("core/editor").getEditedPostAttribute("content")` return content that does NOT match content eventually served from server, so... not sure how to do this without first saving post to DB, and then fetching revision hash from server

        return true;
      };

      const isSignButtonDisabled = (): boolean => {
        if (!getLoggedInUserAddress()) {
          return true;
        }

        const ownSignature = signatures[username];
        if (ownSignature && isValidSignature!(ownSignature.authorAddress, ownSignature.signature)) {
          // No need to re-sign if signed and valid
          return true;
        } else {
          // Otherwise either they've previously signed but it's invalid, or they've never signed.
          // We only want to allow them to sign if the post has been saved to DB, so that we can fetch content hash from server in order to create sign message
          // TODO alert user about this (e.g. "you must save post before signing")
          return isEditedPostDirty() || isCleanNewPost();
        }
      };

      return {
        signatures,
        username,
        signDisabled: isSignButtonDisabled(),
        userWalletAddress: getLoggedInUserAddress(),
        isValidSignature,
      };
    },
  ),

  withDispatch(
    (dispatch: any, ownProps: BlockchainSignPanelProps): Partial<BlockchainSignPanelProps> => {
      const { editPost, savePost } = dispatch("core/editor");
      const { updateSignatures } = dispatch("civil/blockchain");
      const { username, userWalletAddress, signatures } = ownProps;

      const signArticle = async (): Promise<void> => {
        const messageToSign = await getMessageToSign();
        const signature = await signMessage(messageToSign);
        signatures[username] = {
          authorAddress: userWalletAddress!,
          signature,
        };

        editPost({ meta: { [postMetaKeys.SIGNATURES]: JSON.stringify(signatures) } });
        savePost();
        dispatch(updateSignatures(signatures));
      };

      return {
        signArticle,
      };
    },
  ),
])(BlockchainSignPanelComponent);

export default BlockchainSignPanel;
