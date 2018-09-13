import * as React from "react";
import { getNewsroom } from "../../util";
import { TxHash } from "@joincivil/core";
import { PostStatus } from "./PostStatus";
import { PanelWalletStatus } from "./PanelWalletStatus";
import { Wrapper, Body } from "../styles";
import { GetStartedPanel } from "./GetStartedPanel";
import { PublishPanelFirstTime } from "./PublishPanelFirstTime";
import { PublishPanel } from "./PublishPanel";

export interface ArchiveOptions {
  ipfs: boolean;
  transaction: boolean;
}

export interface BlockchainPublishPanelProps {
  isNewsroomEditor: boolean;
  publishDisabled?: boolean;
  civilContentID?: number;
  currentPostLastRevisionId?: number;
  publishedRevisions: any[];
  revisionJson: any;
  revisionJsonHash: string;
  revisionUrl: string;
  isDirty: boolean;
  walletReady: boolean;
  txHash?: TxHash;
  ipfs?: string;
  archiveOptions?: ArchiveOptions;
  archive?: { ipfs: boolean; transaction: boolean };
  lastPublishedRevision: any;
  lastArchivedRevision: any;
  currentIsVersionPublished: boolean;
  userCapabilities: { [capability: string]: boolean };
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

export interface BlockchainPublishPanelState {
  loadedWithTxHash: boolean;
  isPreTransactionModalOpen: boolean;
  isWaitingTransactionModalOpen: boolean;
  isTransactionInProggressModalOpen: boolean;
  isTransactionCompleteModalOpen: boolean;
  isTransactionDeniedModalOpen: boolean;
  isGetStartedDismissed: boolean;
  startTransaction?(): any;
  cancelTransaction?(): any;
}

const StatusWrapper = Body.extend`
  margin-bottom: 16px;
`;

export class BlockchainPublishPanelComponent extends React.Component<
  BlockchainPublishPanelProps,
  BlockchainPublishPanelState
> {
  constructor(props: BlockchainPublishPanelProps) {
    super(props);
    this.state = {
      loadedWithTxHash: false,
      isWaitingTransactionModalOpen: false,
      isPreTransactionModalOpen: false,
      isTransactionInProggressModalOpen: false,
      isTransactionCompleteModalOpen: false,
      isTransactionDeniedModalOpen: false,
      isGetStartedDismissed: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    if (this.props.txHash && this.props.txHash.length > 0 && this.props.ipfs) {
      this.setState({ loadedWithTxHash: true });
      const newsroom = await getNewsroom();
      if (!this.props.civilContentID) {
        const contentId = await newsroom.contentIdFromTxHash(this.props.txHash);
        await this.props.publishContent!(
          contentId,
          this.props.currentPostLastRevisionId!,
          this.props.revisionJson,
          this.props.txHash,
          this.props.ipfs,
          this.props.archiveOptions!,
        );
        this.setState({ loadedWithTxHash: false });
      } else {
        await this.props.updateContent!(
          this.props.currentPostLastRevisionId!,
          this.props.revisionJson,
          this.props.txHash,
          this.props.ipfs,
          this.props.archiveOptions!,
        );
        this.setState({ loadedWithTxHash: false });
      }
    }
  }

  public renderPanelContent(): JSX.Element {
    let insufficientPermissions: boolean | null = false;
    // let permissionsMessage;
    if (!this.props.userCapabilities.publish_posts) {
      insufficientPermissions = true;
      // permissionsMessage = "Only Editors and Admins have the ability to publish and index posts.";
    } else if (this.props.isNewsroomEditor === null) {
      // still loading this from contract
      insufficientPermissions = null;
    } else if (!this.props.isNewsroomEditor) {
      insufficientPermissions = true;
      // permissionsMessage = "You are not listed on your newsroom contract.";
    }

    if (!this.state.isGetStartedDismissed && !this.props.civilContentID) {
      return <GetStartedPanel getStarted={this.getStarted} />;
    } else if (!this.props.civilContentID) {
      return (
        <PublishPanelFirstTime
          revisionUrl={this.props.revisionUrl}
          revisionJsonHash={this.props.revisionJsonHash}
          revisionJson={this.props.revisionJson}
          civilContentID={this.props.civilContentID}
          currentPostLastRevisionId={this.props.currentPostLastRevisionId}
          txHash={this.props.txHash}
          walletReady={this.props.walletReady}
          disabled={this.props.publishDisabled || !this.props.walletReady || !!insufficientPermissions}
          saveTxHash={this.props.saveTxHash}
          publishContent={this.props.publishContent}
          updateContent={this.props.updateContent}
        />
      );
    }

    return (
      <PublishPanel
        revisionUrl={this.props.revisionUrl}
        revisionJsonHash={this.props.revisionJsonHash}
        revisionJson={this.props.revisionJson}
        civilContentID={this.props.civilContentID}
        currentPostLastRevisionId={this.props.currentPostLastRevisionId}
        txHash={this.props.txHash}
        disabled={this.props.publishDisabled || !this.props.walletReady || !!insufficientPermissions}
        walletReady={this.props.walletReady}
        saveTxHash={this.props.saveTxHash}
        publishContent={this.props.publishContent}
        updateContent={this.props.updateContent}
      />
    );
  }

  public render(): JSX.Element {
    return (
      <Wrapper>
        <StatusWrapper>
          <PostStatus
            requirePublish={true}
            actionString={(this.props.lastPublishedRevision ? "re-" : "") + "indexing"}
            contentId={this.props.civilContentID}
            lastPublishedRevision={this.props.lastPublishedRevision}
            lastArchivedRevision={this.props.lastArchivedRevision}
          />
          <PanelWalletStatus />
        </StatusWrapper>
        {this.renderPanelContent()}
      </Wrapper>
    );
  }

  private getStarted = (): void => {
    this.setState({ isGetStartedDismissed: true });
  };
}
