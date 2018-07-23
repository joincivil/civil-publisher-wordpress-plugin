import * as React from "react";
import { EthAddress, Hex } from "@joincivil/core";
const { withSelect } = window.wp.data;
const { PanelRow } = window.wp.components;

export interface SignatureProps {
  authorUserId: number;
  authorAddress: EthAddress;
  sig: Hex;
  isDirty: boolean;
  isValid: boolean;
  userData: any;
}

function SignatureComponent(ownProps: SignatureProps): JSX.Element {
  const { userData, authorAddress, sig, isDirty, isValid } = ownProps;

  let validMessage;
  let sigColor;
  if (!isValid) {
    validMessage = "invalid";
    sigColor = "red";
  } else if (isDirty) {
    // Since we can't distinguish between dirty due to post content changes (which would invalidate sig) or dirty due to other changes (which wouldn't) this is the best we can do, unless we cache post content and repeatedly check against it, but that seems slow and messy.
    validMessage = "unknown, please save post";
    sigColor = "goldenrod";
  } else {
    validMessage = "valid";
    sigColor = "green";
  }

  const avatarUrl = userData.avatar_urls && userData.avatar_urls[48]; // TODO test if WP generates fallback or if we have to here

  return (
    <PanelRow>
      <img src={avatarUrl} style={{ width: "24px" }} />
      <span>{userData.name}</span>
      <span style={{ color: sigColor }}>{validMessage}</span>
    </PanelRow>
  );
}

export const Signature = withSelect(
  (selectStore: any, ownProps: Partial<SignatureProps>): Partial<SignatureProps> => {
    const { getUserData } = selectStore(
      "civil/blockchain",
    );

    return {
      ...ownProps,
      userData: getUserData(ownProps.authorUserId),
    };
  },
)(SignatureComponent);
