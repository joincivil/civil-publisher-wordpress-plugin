import * as React from "react";
import styled from "styled-components";
import { TxHash } from "@joincivil/core";
import { Collapsable } from "@joincivil/components";
import { ArchiveOptions } from "./BlockchainPublishPanel";
import { Body, BodySection, Heading } from "../styles";
import { ArchiveControls } from "./ArchiveControls";
import { PublishButton } from "./PublishButton";

export interface PublishPanelState {
  archiveSelected: boolean;
  ipfsSelected: boolean;
  ethTransaction: boolean;
}

export interface PublishPanelProps {
  revisionUrl: string;
  revisionJsonHash: string;
  revisionJson: any;
  civilContentID?: number;
  currentPostLastRevisionId?: number;
  txHash?: TxHash;
  disabled?: boolean;
  walletReady?: boolean;
  publishContent?(
    contentId: number,
    revisionId: number,
    revisionJson: any,
    txHash: TxHash,
    ipfs: string,
    archive: ArchiveOptions,
  ): void;
  updateContent?(revisionId: number, revisionJson: any, txHash: TxHash, ipfs: string, archive?: ArchiveOptions): void;
  saveTxHash?(txHash: TxHash, ipfs: string, archive: ArchiveOptions): void;
}

const CollapsableHeader = styled.span`
  color: #0073af;
  vertical-align: middle;
  margin-bottom: 10px;
`;

const CollapsableHeaderOpen = CollapsableHeader.extend`
  background-color: #fffef6;
`;

const Arrow = styled.div`
  width: 6px;
  height: 6px;
  border-left: 2px solid #0073af;
  border-bottom: 2px solid #0073af;
  transform: ${(props: { open: boolean }) => (props.open ? "rotate(135deg)" : "rotate(-45deg)")};
  transition: transform 1s;
  display: inline-block;
  veritical-align: middle;
`;

const CollapsableText = styled.div`
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.42;
  letter-spacing: 0px;
  color: #5f5f5f;
  background-color: #fffef6;
  padding: 20px;
  padding-top: 30px;
  margin: -20px;
  margin-top: -30px;
`;

export class PublishPanel extends React.Component<PublishPanelProps, PublishPanelState> {
  constructor(props: PublishPanelProps) {
    super(props);
    this.state = {
      archiveSelected: false,
      ipfsSelected: true,
      ethTransaction: false,
    };
  }
  public render(): JSX.Element {
    return (
      <Body>
        <BodySection>
          <Heading>Index</Heading>
          <p>Update the post’s index metadata and hash to the Civil network.</p>
          <Collapsable
            header={<CollapsableHeader>Read more about Index</CollapsableHeader>}
            headerOpen={<CollapsableHeaderOpen>Hide</CollapsableHeaderOpen>}
            ArrowComponent={Arrow}
            open={false}
          >
            <CollapsableText>
              <p>
                Publishing the index adds this post’s metadata and hash to IPFS and Ethereum Blockchain. It will appear
                in the Civil network, and provides proof that the contents have not changed since last publish. The
                metadata will include a record of the post. We recommend updating the index only if there is a
                signfificant change in your post.
              </p>
              <p>
                If this post is behind a paywall and you don't want the full text to be public, we recommend you only
                index instead of archiving.
              </p>
            </CollapsableText>
          </Collapsable>
        </BodySection>
        <BodySection>
          <ArchiveControls
            archiveSelected={this.state.archiveSelected}
            ethTransaction={this.state.ethTransaction}
            ipfsSelected={this.state.ipfsSelected}
            onHeaderClick={this.selectArchive}
            onSelectEthTransaction={this.onSelectEthTransaction}
          />
          <p>
            Include an updated archive of the full text of your post to the permanent record. Text will be public even
            if this post is behind a paywall.
          </p>
          <Collapsable
            header={<CollapsableHeader>Read more about Archive</CollapsableHeader>}
            headerOpen={<CollapsableHeaderOpen>Hide</CollapsableHeaderOpen>}
            ArrowComponent={Arrow}
            open={false}
          >
            <CollapsableText>
              <p>
                Archive will save the full text of this post to IPFS and, opptionally, the Ethererum network. An index
                will be published to connect this archive to your newsroom to provide proof that it’s contents have not
                changed.
              </p>
              <p>
                When you archive, please make note that the text from this post will be public and visible even if this
                post is behind a paywall. You can always archive at a later date.
              </p>
            </CollapsableText>
          </Collapsable>
        </BodySection>
        <BodySection>
          <PublishButton
            archive={!!this.state.archiveSelected}
            archiveTx={!!this.state.ethTransaction}
            revisionJson={this.props.revisionJson}
            revisionUrl={this.props.revisionUrl}
            revisionJsonHash={this.props.revisionJsonHash}
            civilContentID={this.props.civilContentID}
            currentPostLastRevisionId={this.props.currentPostLastRevisionId}
            txHash={this.props.txHash}
            disabled={this.props.disabled}
            walletReady={this.props.walletReady}
            saveTxHash={this.props.saveTxHash}
            publishContent={this.props.publishContent}
            updateContent={this.props.updateContent}
          />
        </BodySection>
      </Body>
    );
  }
  private selectArchive = async (): Promise<void> => {
    this.setState({ archiveSelected: !this.state.archiveSelected });
  };
  private onSelectEthTransaction = async (): Promise<void> => {
    this.setState({ ethTransaction: !this.state.ethTransaction });
  };
}
