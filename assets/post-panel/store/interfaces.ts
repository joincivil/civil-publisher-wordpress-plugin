import { ApprovedRevision } from "@joincivil/core";

/** Maps from author wordpress user ID to ETH address and signature hex. */
export interface SignatureData {
  [authorId: number]: ApprovedRevision;
}
