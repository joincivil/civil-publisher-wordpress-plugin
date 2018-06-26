import * as React from "react";
import { EthAddress, Hex, ApprovedRevision } from "@joincivil/core";
const { PanelRow } = window.wp.components;

export interface SignatureProps {
  authorUsername: string;
  authorAddress: EthAddress;
  sig: Hex;
  isDirty: boolean;
  isValid: boolean;
  isYou: boolean;
}

export function Signature(ownProps: SignatureProps): JSX.Element {
  const { authorUsername, authorAddress, sig, isDirty, isValid, isYou } = ownProps;

  let validMessage, sigColor;
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
          Status: <span style={{ color: sigColor }}>{validMessage}</span>
        </div>
      </div>
    </PanelRow>
  );
}
