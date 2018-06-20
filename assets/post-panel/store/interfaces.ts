import { EthAddress, Hex, ApprovedRevision } from "@joincivil/core";

/** Maps from author wordpress user to ETH address and signature hex. */
export interface SignatureData {
  [authorUsername: string]: ApprovedRevision;
}
