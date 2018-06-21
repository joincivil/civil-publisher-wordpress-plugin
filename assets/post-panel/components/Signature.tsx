import * as React from "react";
import { EthAddress, Hex, ApprovedRevision } from "@joincivil/core";
const { PanelRow } = window.wp.components;

export interface SignatureProps {
    authorUsername: string;
    authorAddress: EthAddress;
    sig: Hex;
    sigStatus: string;
    isYou: boolean;
}

export function Signature(ownProps: SignatureProps): JSX.Element {
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