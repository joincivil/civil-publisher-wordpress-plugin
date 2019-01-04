import * as React from "react";
import { BorderlessButton } from "@joincivil/components";
import styled from "styled-components";
import { siteTimezoneFormat } from "../../util";
import { urls } from "../../constants";
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
  let archiveSection;

  if (props.lastArchivedRevision) {
    const transactionArchive = props.lastArchivedRevision.archive.transaction ? (
      <Link href={`https://${urls.ETHERSCAN_DOMAIN}/tx/${props.lastArchivedRevision.txHash}`} target="_blank">
        View on Ethereum
      </Link>
    ) : (
      <Link disabled>Not Archived to Ethereum</Link>
    );

    archiveSection = (
      <BodySectionNoPaddingBottom>
        <P>Archive · {siteTimezoneFormat(props.lastArchivedRevision.published)}</P>
        <Link href={props.lastArchivedRevision.ipfsUrl} target="_blank">
          View on IPFS
        </Link>
        {transactionArchive}
      </BodySectionNoPaddingBottom>
    );
  } else {
    archiveSection = (
      <BodySectionNoPaddingBottom>
        <p>Archive · Not Archived</p>
      </BodySectionNoPaddingBottom>
    );
  }

  return (
    <div>
      <BodySection>
        <P>Index · {siteTimezoneFormat(props.lastPublishedRevision.published)}</P>
        <Link href={props.lastPublishedRevision.ipfsUrl} target="_blank">
          View on IPFS
        </Link>
        <Link href={`https://${urls.ETHERSCAN_DOMAIN}/tx/${props.lastPublishedRevision.txHash}`} target="_blank">
          View on Ethereum
        </Link>
      </BodySection>
      {archiveSection}
    </div>
  );
};
