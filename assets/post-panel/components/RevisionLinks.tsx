import * as React from "react";
import * as moment from "moment";
import { BorderlessButton, ToolTip } from "@joincivil/components";
import styled from "styled-components";
import { BodySection } from "../styles";

export interface RevisionLinksProps {
  lastPublishedRevision: any;
  lastArchivedRevision?: any;
}

const Link = BorderlessButton.extend`
  font-weight: normal;
  font-size: 12px;
  padding: 0;
  margin: 0;
  margin-bottom: 2px;
  display: block;
  &.disabled {
    color: #72777c;
    cursor: default;
  }
`;

const P = styled.p`
  margin-bottom: 4px !important;
`;

const BodySectionNoPaddingBottom = BodySection.extend`
  padding-bottom: 0;
`;

export const RevisionLinks = (props: RevisionLinksProps): JSX.Element => {
  console.log({ props });
  let transactionArchive = (
    <Link
      href={`https://rinkeby.etherscan.io/tx/${props.lastArchivedRevision.txHash}`}
      disabled={!props.lastArchivedRevision.archive.transaction}
    >
      View on Ethereum{" "}
    </Link>
  );
  if (!props.lastArchivedRevision.archive.transaction) {
    transactionArchive = <ToolTip explainerText={"Not Archived to Ehereum"}>{transactionArchive}</ToolTip>;
  }
  const archiveSection = props.lastArchivedRevision ? (
    <BodySectionNoPaddingBottom>
      <P>Archive · {moment(props.lastArchivedRevision.published).format("MMM DD YYYY h:mm a")}</P>
      <Link href={props.lastArchivedRevision.ipfsUrl}>View on IPFS</Link>
      {transactionArchive}
    </BodySectionNoPaddingBottom>
  ) : (
    <BodySectionNoPaddingBottom>
      <p>Archive · Not Available</p>
    </BodySectionNoPaddingBottom>
  );

  return (
    <div>
      <BodySection>
        <P>Index · {moment(props.lastPublishedRevision.published).format("MMM DD YYYY h:mm a")}</P>
        <Link href={props.lastPublishedRevision.ipfsUrl}>View on IPFS</Link>
        <Link href={`https://rinkeby.etherscan.io/tx/${props.lastPublishedRevision.txHash}`}>View on Ethereum</Link>
      </BodySection>
      {archiveSection}
    </div>
  );
};
