import * as React from "react";
import { MainHeading, Body, BodySection } from "../styles";
import { TxHash } from "@joincivil/core";
import { PublishButton } from "./PublishButton";
import { ArchiveOptions } from "./BlockchainPublishPanel";
import { ArchiveControls } from "./ArchiveControls";
import { urls } from "../../constants";

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
          <MainHeading>Index</MainHeading>
          <p>
            This publishes a permanent record of your post to the Civil network by putting a link and record of the post
            onto{" "}
            <a href={`${urls.HELP_BASE}articles/360017702191-What-is-IPFS-`} target="_blank">
              IPFS
            </a>{" "}
            and the{" "}
            <a href={`${urls.HELP_BASE}articles/360017428692-What-is-the-Ethereum-blockchain-`} target="_blank">
              Ethereum Blockchain
            </a>
            . The index points back to your site where the story is hosted on your servers. Indexing provides proof that
            the story hasn't changed since its last publish date.
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
            intro={
              <p>
                This will add the full text of this post to the index you publish to{" "}
                <a href={`${urls.HELP_BASE}articles/360017702191-What-is-IPFS-`} target="_blank">
                  IPFS
                </a>{" "}
                and/or the{" "}
                <a href={`${urls.HELP_BASE}articles/360017428692-What-is-the-Ethereum-blockchain-`} target="_blank">
                  Ethereum Blockchain
                </a>
                . <strong>Tip:</strong> If this post is behind a paywall and you don't want the full text to be public,
                we recommend you only index instead of archiving.
              </p>
            }
          />
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
            modalBodyText="You will use MetaMask to confirm this transaction and publish your post."
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
