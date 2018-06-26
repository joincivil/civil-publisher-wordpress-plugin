const { Button, PanelRow } = window.wp.components;
const { withSelect, withDispatch } = window.wp.data;
const { compose } = window.wp.element;
import * as React from "react";
import { EthAddress, Hex, ApprovedRevision } from "@joincivil/core";
import { recoverSignerPersonal, prepareUserFriendlyNewsroomMessage, hashPersonalMessage } from "@joincivil/utils";
import { bufferToHex } from "ethereumjs-util";
import { getRevisionContentHash, createSignatureData, getNewsroom, getNewsroomAddress } from "../util";
import { postMetaKeys } from "../constants";
import { SignatureData } from "./store/interfaces";
import { BlockchainSignPanelProps, BlockchainSignPanelComponent } from "./components/BlockchainSignPanel";

export type signatureStatusType = "unsigned" | "valid" | "invalid";

const BlockchainSignPanel = compose([
  withSelect(
    (selectStore: any, ownProps: Partial<BlockchainSignPanelProps>): Partial<BlockchainSignPanelProps> => {
      const { isEditedPostDirty, isCleanNewPost, getCurrentPostLastRevisionId } = selectStore("core/editor");
      const { getUsername, getLoggedInUserAddress, getSignatures, getRevisionJSON } = selectStore("civil/blockchain");

      const username = getUsername();
      const contentID = getCurrentPostLastRevisionId();
      const newsroomAddress = window.civilNamespace && window.civilNamespace.newsroomAddress;
      let revisionJson: any;
      if (contentID) {
        revisionJson = getRevisionJSON(contentID);
      }
      const signatures = getSignatures();

      /** Check if given signature is valid given the current post content. */
      const isValidSignature = (signature: ApprovedRevision): boolean => {
        if (!revisionJson) {
          return false;
        }
        if (revisionJson.revisionContentHash !== signature.contentHash) {
          return false;
        }
        if (revisionJson.newsroomAddress !== newsroomAddress) {
          return false;
        }
        if (
          recoverSignerPersonal({
            message: prepareUserFriendlyNewsroomMessage(signature.newsroomAddress, signature.contentHash),
            signature: signature.signature,
          }) !== signature.author
        ) {
          return false;
        }
        return true;
      };

      const isSignButtonDisabled = (): boolean => {
        if (!getLoggedInUserAddress()) {
          return true;
        }

        const ownSignature = signatures[username];
        if (ownSignature && isValidSignature(ownSignature)) {
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
        isDirty: isEditedPostDirty(),
      };
    },
  ),

  withDispatch(
    (dispatch: any, ownProps: BlockchainSignPanelProps): Partial<BlockchainSignPanelProps> => {
      const { editPost, savePost } = dispatch("core/editor");
      const { updateSignatures } = dispatch("civil/blockchain");
      const { username, userWalletAddress, signatures } = ownProps;

      const signArticle = async (): Promise<void> => {
        const signature = await createSignatureData();
        signatures[username] = signature;
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
