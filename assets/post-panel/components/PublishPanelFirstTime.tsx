import * as React from "react";
import { MainHeading, Body, BodySection } from "../styles";
import { BorderlessButton, Modal, ModalHeading, buttonSizes, Button } from "@joincivil/components";
import { TxHash } from "@joincivil/core";
import { PublishButton } from "./PublishButton";
import { ArchiveOptions } from "./BlockchainPublishPanel";
import { ArchiveControls } from "./ArchiveControls";
import styled from "styled-components";

export interface PublishPanelFirstTimeState {
  archiveSelected: boolean;
  ipfsSelected: boolean;
  ethTransaction: boolean;
  estimate?: number;
  modalOpen?: boolean;
}

export interface PublishPanelFirstTimeProps {
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
  ): Promise<void>;
  updateContent?(
    revisionId: number,
    revisionJson: any,
    txHash: TxHash,
    ipfs: string,
    archive?: ArchiveOptions,
  ): Promise<void>;
  saveTxHash?(txHash: TxHash, ipfs: string, archive: ArchiveOptions): void;
}

const WhatsTheDifference = styled(BorderlessButton)`
  padding-left: 0;
  margin-left: 0;
  font-size: 13px;
  font-weight: 400;
  text-decoration: underline;
`;

export class PublishPanelFirstTime extends React.Component<PublishPanelFirstTimeProps, PublishPanelFirstTimeState> {
  constructor(props: PublishPanelFirstTimeProps) {
    super(props);
    this.state = {
      archiveSelected: false,
      ipfsSelected: true,
      ethTransaction: false,
      modalOpen: false,
    };
  }

  public renderModal(): JSX.Element | null {
    if (!this.state.modalOpen) {
      return null;
    }
    return (
      <Modal>
        <ModalHeading>What's ths difference?</ModalHeading>
        <p>
          <strong>IPFS (InterPlanetary File System)</strong> is a peer-to-peer file sharing protocol that lets you save
          your posts across a distributed network that tracks changes to these files over time. It creates a new
          resilient decentralized archive. Every article indexed or archived to the blockchain on the Civil Publisher
          will also by default be indexed or archived onto IPFS. The benefits of IPFS are that it’s free and can host
          multimedia content. However, like other peer-to-peer systems, the content on IPFS is as permanent as the
          number of people willing to host or store it. We currently use Infura as our IPFS provider. Eventually, other
          users and nodes may also pin the content as well.
        </p>
        <p>
          <strong>Ethereum blockchain</strong> is an open platform where data is replicated accross all computers using
          the network. All information on this network is public can't be shut down as long as all the computers are
          contributing to the network. Since the records are all shared, there is no one central location of the data
          which allows for redundancy, limits on censorship or attempts to remove posts and a place for permanent
          archiving. The Ethereum blockchain option requires users to pay a transaction fee (also known as gas) to post
          content and can only include text at this time.
        </p>
        <div>
          <Button size={buttonSizes.SMALL} onClick={() => this.setState({ modalOpen: false })}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  public render(): JSX.Element {
    return (
      <Body>
        <BodySection>
          <MainHeading>Publish Index</MainHeading>
          <p>
            Publishing the index adds this post’s metadata and hash to IPFS and Ethereum Blockchain. It will appear in
            the Civil network, and provides proof that the contents have not changed since last publish. The metadata
            will include a link and record of the post. We recommend updating the index only if there is a significant
            change in your post.
          </p>
          <p>
            <strong>Tip:</strong> If this post is behind a paywall and you don't want the full text to be public, we
            recommend you only index instead of archiving.
          </p>
        </BodySection>
        <BodySection>
          <ArchiveControls
            pendingTransaction={!!this.props.txHash}
            archiveSelected={this.state.archiveSelected}
            ethTransaction={this.state.ethTransaction}
            ipfsSelected={this.state.ipfsSelected}
            onHeaderClick={this.selectArchive}
            onSelectEthTransaction={this.selectEthTransaction}
          />
          <p>
            Archive will save the full text of this post to IPFS and, optionally, the Ethereum network. An index will be
            published to connect this archive to your newsroom to provide proof that its contents have not changed.
          </p>
          <p>
            When you archive the full text, please make note that the text will be public and will be visible outside of
            any paywalls that might be in place. You can always archive at a later date.
          </p>
          <WhatsTheDifference onClick={() => this.setState({ modalOpen: true })} size={buttonSizes.SMALL}>
            What’s the difference?
          </WhatsTheDifference>
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
        {this.renderModal()}
      </Body>
    );
  }
  private selectArchive = (): void => {
    this.setState({ archiveSelected: !this.state.archiveSelected });
  };
  private selectEthTransaction = (): void => {
    this.setState({ ethTransaction: !this.state.ethTransaction });
  };
}
