import * as React from "react";
import { MainHeading, Body, BodySection } from "../styles";
import { TxHash } from "@joincivil/core";
import { PublishButton } from "./PublishButton";
import { ArchiveOptions } from "./BlockchainPublishPanel";
import { ArchiveControls } from "./ArchiveControls";

export interface PublishPanelFirstTimeState {
  archiveSelected: boolean;
  ipfsSelected: boolean;
  ethTransaction: boolean;
  estimate?: number;
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

export class PublishPanelFirstTime extends React.Component<PublishPanelFirstTimeProps, PublishPanelFirstTimeState> {
  constructor(props: PublishPanelFirstTimeProps) {
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
          <MainHeading>Publish Index</MainHeading>
          <p>
            Publishing the index adds this post’s metadata and hash to IPFS and Ethereum Blockchain. It will appear in
            the Civil network, and provides proof that the contents have not changed since last publish. The metadata
            will include a record and the link to the post.
          </p>
        </BodySection>
        <BodySection>
          <ArchiveControls
            archiveSelected={this.state.archiveSelected}
            ethTransaction={this.state.ethTransaction}
            ipfsSelected={this.state.ipfsSelected}
            onHeaderClick={this.selectArchive}
            onSelectEthTransaction={this.selectEthTransaction}
          />
          <p>
            Archive will save the full text of this post to IPFS and, optionally, the Ethereum network. An index will be
            published to connect this archive to your newsroom.
          </p>
          <p>
            When you archive the full text, please make note that the text will be public and will be visible outside of
            your paywall.
          </p>
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
  private selectArchive = (): void => {
    this.setState({ archiveSelected: !this.state.archiveSelected });
  };
  private selectEthTransaction = (): void => {
    this.setState({ ethTransaction: !this.state.ethTransaction });
  };
}
