import * as React from "react";
import { ArticleIndexPanelIcon, TransactionButtonNoModal, Modal, buttonSizes, BorderlessButton, Button } from "@joincivil/components";
import { getNewsroom } from "../../util";
import { TxHash } from "@joincivil/core";
import { PostStatus } from "./PostStatus";
import { CreateIndex } from "./CreateIndex";
import { Wrapper, IconWrap, Heading, MainHeading, IntroSection, Body, BodySection } from "../styles";
import { IndexTransactionButton, DisabledTransactionProcessingButton } from "./Buttons";

export interface BlockchainPublishPanelProps {
  isNewsroomEditor: boolean;
  publishDisabled?: boolean;
  civilContentID?: number;
  currentPostLastRevisionId?: number;
  publishedRevisions: any[];
  revisionJson: string;
  revisionJsonHash: string;
  revisionUrl: string;
  isDirty: boolean;
  correctNetwork: boolean;
  txHash?: TxHash;
  lastPublishedRevision: any;
  currentIsVersionPublished: boolean;
  userCapabilities: { [capability: string]: boolean };
  publishContent?(contentId: number, revisionId: number, revisionJson: any): void;
  updateContent?(revisionId: number, revisionJson: any): void;
  saveTxHash?(txHash: TxHash): void;
}

export interface BlockchainPublishPanelState {
  loadedWithTxHash: boolean;
  isPreTransactionModalOpen: boolean;
  isTransactionInProggressModalOpen: boolean;
  isTransactionCompleteModalOpen: boolean;
  startTransaction?(): any;
  cancelTransaction?(): any;
}

export class BlockchainPublishPanelComponent extends React.Component<
  BlockchainPublishPanelProps,
  BlockchainPublishPanelState
> {
  constructor(props: BlockchainPublishPanelProps) {
    super(props);
    this.state = {
      loadedWithTxHash: false,
      isPreTransactionModalOpen: false,
      isTransactionInProggressModalOpen: false,
      isTransactionCompleteModalOpen: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    if (this.props.txHash && this.props.txHash.length > 0) {
      this.setState({ loadedWithTxHash: true });
      const newsroom = await getNewsroom();
      if (!this.props.civilContentID) {
        const contentId = await newsroom.contentIdFromTxHash(this.props.txHash);
        await this.props.publishContent!(contentId, this.props.currentPostLastRevisionId!, this.props.revisionJson);
        this.props.saveTxHash!("");
        this.setState({ loadedWithTxHash: false });
      } else {
        const revisionId = await newsroom.revisionFromTxHash(this.props.txHash);
        await this.props.updateContent!(this.props.currentPostLastRevisionId!, this.props.revisionJson);
        this.props.saveTxHash!("");
        this.setState({ loadedWithTxHash: false });
      }
    }
  }

  public renderPreTransactionModal(): JSX.Element | null {
    if (!this.state.isPreTransactionModalOpen) {
      return null;
    }
    return (<Modal>
      <h2>Open MetaMask to Index This Article on the Blockchain</h2>
      <p> MetaMask will open a new window for you to confirm this transaction with your wallet.</p>
      <BorderlessButton onClick={this.cancelTransaction}>Cancel</BorderlessButton>
      <Button onClick={this.startTransaction}>Open MetaMask</Button>
    </Modal>);
  }

  public renderTransactionPendingModal(): JSX.Element | null {
    if (!this.state.isTransactionInProggressModalOpen) {
      return null;
    }
    return (<Modal>
      <h2>Your Post is being indexed</h2>
      <p> This can take some time depending on traffic on the Ethereum network.</p>
      <p> You are welcome to leave this page open while continuing to work, but please note that any changes you make to a post once the blockchain indexing process has begun will not be reflected on that blockchain index unless you re-index.</p>
      <Button onClick={() => this.setState({isTransactionInProggressModalOpen: false})}>Close</Button>
    </Modal>);
  }

  public renderTransactionCompleteModal(): JSX.Element | null {
    if (!this.state.isTransactionCompleteModalOpen) {
      return null;
    }
    return (<Modal>
      <h2>Index added!</h2>
      <p>Your post was successfully indexed to the Ethereum blockchain.</p>
      <p>Note that any time you make an update or revision to a post, we recommend you also index that revision to the blockchain</p>
      <Button onClick={() => this.setState({isTransactionCompleteModalOpen: false})}>Close</Button>
    </Modal>);
  }

  public render(): JSX.Element {
    let transactions;
    if (this.props.civilContentID) {
      transactions = [
        {
          transaction: async () => {
            const newsroom = await getNewsroom();
            return newsroom.updateRevisionURIAndHash(
              this.props.civilContentID!,
              this.props.revisionUrl,
              this.props.revisionJsonHash,
            );
          },
          requireBeforeTransaction: () => {
            return new Promise((res, rej) => {
              this.setState({
                startTransaction: res,
                cancelTransaction: rej,
                isPreTransactionModalOpen: true,
              });
            });
          },
          postTransaction: (result: number) => {
            this.setState({isTransactionCompleteModalOpen: true});
            this.props.updateContent!(this.props.currentPostLastRevisionId!, this.props.revisionJson);
            this.props.saveTxHash!("");
          },
          handleTransactionHash: (txHash: TxHash) => {
            this.setState({isTransactionInProggressModalOpen: true});
            this.props.saveTxHash!(txHash);
          },
        },
      ];
    } else {
      transactions = [
        {
          transaction: async () => {
            const newsroom = await getNewsroom();
            return newsroom.publishURIAndHash(this.props.revisionUrl, this.props.revisionJsonHash);
          },
          requireBeforeTransaction: () => {
            return new Promise((res, rej) => {
              this.setState({
                startTransaction: res,
                cancelTransaction: rej,
                isPreTransactionModalOpen: true,
              });
            });
          },
          postTransaction: (result: number) => {
            this.setState({isTransactionCompleteModalOpen: true});
            this.props.publishContent!(result, this.props.currentPostLastRevisionId!, this.props.revisionJson);
            this.props.saveTxHash!("");
          },
          handleTransactionHash: (txHash: TxHash) => {
            this.setState({isTransactionInProggressModalOpen: true});
            this.props.saveTxHash!(txHash);
          },
        },
      ];
    }

    let insufficientPermissions = false;
    let permissionsMessage;
    if (!this.props.userCapabilities.publish_posts) {
      insufficientPermissions = true;
      permissionsMessage = "Only Editors and Admins have the ability to publish and index posts.";
    } else if (!this.props.isNewsroomEditor) {
      insufficientPermissions = true;
      permissionsMessage = "You are not listed on your newsroom contract.";
    }

    const buttonDisabled = this.props.publishDisabled || !this.props.correctNetwork || insufficientPermissions;
    const button = this.state.loadedWithTxHash ? (
      <DisabledTransactionProcessingButton>Transaction In Progress...</DisabledTransactionProcessingButton>
    ) : (
      <TransactionButtonNoModal
        Button={IndexTransactionButton}
        disabled={buttonDisabled}
        transactions={transactions}
      >
        Index to Blockchain
      </TransactionButtonNoModal>
    );

    return (
      <Wrapper>
        <IntroSection>
          <Heading>Index</Heading>
          <p>
            Index this post’s metadata and hash to your newsroom contract on the Ethereum blockchain.{" "}
            <a href="#TODO">Learn more</a>
          </p>
        </IntroSection>

        <Body>
          <PostStatus
            requirePublish={true}
            actionString={(this.props.lastPublishedRevision ? "re-" : "") + "indexing"}
          />
          <BodySection>
            <MainHeading>
              Create Index
              <IconWrap>
                <ArticleIndexPanelIcon />
              </IconWrap>
            </MainHeading>

            <CreateIndex
              lastPublishedRevision={this.props.lastPublishedRevision}
              transactionButton={button}
              transactionButtonDisabled={buttonDisabled}
              revisionJson={this.props.revisionJson}
              insufficientPermissions={insufficientPermissions}
              permissionsMessage={permissionsMessage}
              currentIsVersionPublished={this.props.currentIsVersionPublished}
            />
          </BodySection>
        </Body>
        {this.renderPreTransactionModal()}
        {this.renderTransactionPendingModal()}
        {this.renderTransactionCompleteModal()}
      </Wrapper>
    );
  }

  private cancelTransaction = () => {
    if (this.state.cancelTransaction) {
      this.state.cancelTransaction();
    }
    this.setState({
      cancelTransaction: undefined,
      startTransaction: undefined,
      isPreTransactionModalOpen: false,
    })
  }

  private startTransaction = () => {
    if (this.state.startTransaction) {
      this.state.startTransaction();
    }
    this.setState({
      cancelTransaction: undefined,
      startTransaction: undefined,
      isPreTransactionModalOpen: false,
    })
  }
}
