import * as React from "react";
import styled from "styled-components";
const { withSelect } = window.wp.data;
const { dateI18n, getSettings } = window.wp.date;
import { hashContent } from "@joincivil/utils";
import { ViewTransactionLink } from "@joincivil/components";
import { revisionJsonSansDate, siteFormatTimeString } from "../../util";
import { colors, ErrorText, HelpText } from "../styles";

export interface CreateIndexProps {
  lastPublishedRevision?: any;
  revisionJson?: any;
  transactionButton: JSX.Element;
  transactionButtonDisabled: boolean;
  transactionInProgress: boolean;
  insufficientPermissions: boolean | null;
  permissionsMessage?: string;
  currentIsVersionPublished: boolean;
}

const ArrowWrap = styled.span`
  position: relative;
  top: 2px;
  left: 4px;
  path {
    fill: ${colors.LINK_BLUE};
  }
`;

export class CreateIndex extends React.Component<CreateIndexProps> {
  public render(): JSX.Element {
    let indexTextUrl;
    let indexTimestamp;

    if (this.props.lastPublishedRevision) {
      indexTimestamp = siteFormatTimeString(this.props.lastPublishedRevision.published);
      indexTextUrl = this.props.lastPublishedRevision.data && this.props.lastPublishedRevision.data.revisionContentUrl;
    }

    let insufficientPermissions = null;
    if (this.props.insufficientPermissions === true) {
      insufficientPermissions = (
        <>
          <p>
            You are not able to index this post to your newsroom contract on the Ethereum blockchain.{" "}
            {this.props.permissionsMessage}
          </p>
          {/* TODO: Right now Sign and Record are on same panel so Sign is above this message. When we move them to separate tabs, "sign your post" should be a link that opens the Sign tab. */}
          <p>You can sign your post above for enhanced credibility and verification using your wallet address.</p>
        </>
      );
    }

    let publishedRevisionInfo = null;
    if (this.props.lastPublishedRevision && !this.props.transactionInProgress) {
      publishedRevisionInfo = (
        <>
          <p>
            Your post is indexed to the blockchain. If you update your post on your site in any way, we also recommend
            updating it on the blockchain.{" "}
            <a href="#TODO" target="_blank">
              Why?
            </a>
          </p>
          <p>
            <ViewTransactionLink
              txHash={this.props.lastPublishedRevision.txHash}
              network="rinkeby"
              text={indexTimestamp}
            />
          </p>
        </>
      );
    }

    let readyForFirstIndex = null;
    if (
      !this.props.transactionInProgress &&
      !this.props.lastPublishedRevision &&
      !this.props.insufficientPermissions &&
      !this.props.transactionButtonDisabled
    ) {
      readyForFirstIndex = (
        <p>Your post is published to your site and is now ready to be indexed to the Ethereum blockchain.</p>
      );
    }

    let outdatedIndexMessage = null;
    if (
      this.props.lastPublishedRevision &&
      !this.props.currentIsVersionPublished &&
      !this.props.transactionInProgress
    ) {
      outdatedIndexMessage = (
        <ErrorText>
          Your published update no longer matches what's indexed on the smart contract and will not validate.
        </ErrorText>
      );
    }

    let createIndex = null;
    if (!this.props.insufficientPermissions && !this.props.currentIsVersionPublished) {
      createIndex = (
        <>
          {this.props.transactionInProgress ? (
            <ErrorText>Your {this.props.lastPublishedRevision && "re-"}index is currently processing...</ErrorText>
          ) : (
            <HelpText disabled={this.props.transactionButtonDisabled}>
              This will open a MetaMask pop-up and you must complete the transacation to index your post.
            </HelpText>
          )}
          <p>{this.props.transactionButton}</p>
        </>
      );
    }

    return (
      <>
        {insufficientPermissions}
        {publishedRevisionInfo}
        {readyForFirstIndex}
        {outdatedIndexMessage}
        {createIndex}
      </>
    );
  }
}
