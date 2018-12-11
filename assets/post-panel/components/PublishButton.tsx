import * as React from "react";
import styled from "styled-components";
import {
  Transaction,
  MetaMaskModal,
  Modal,
  buttonSizes,
  Button,
  TransactionButtonNoModal,
  TransactionButtonInnerProps,
  QuestionToolTip,
} from "@joincivil/components";
import { TxHash } from "@joincivil/core";
import { hashContent } from "@joincivil/utils";
import { getNewsroom, getIPFS, getCivil } from "../../util";
import { ModalHeader, ModalP, ModalButtonContainer, ErrorText, HelpText, PrimaryButtonWrap } from "../styles";
const { apiRequest } = window.wp;
import { IndexTransactionButton, WaitingButton } from "./Buttons";
import { toBuffer } from "ethereumjs-util";
import { ArchiveOptions } from "./BlockchainPublishPanel";
import { urls } from "../../constants";

export interface PublishButtonProps {
  archive: boolean;
  archiveTx: boolean;
  revisionUrl: string;
  revisionJsonHash: string;
  revisionJson: any;
  civilContentID?: number;
  currentPostLastRevisionId?: number;
  txHash?: TxHash;
  disabled?: boolean;
  walletReady?: boolean;
  isPublished?: boolean;
  modalBodyText?: string;
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

export interface PublishButtonState {
  ipfsPath?: string;
  isPreTransactionModalOpen: boolean;
  isWaitingTransactionModalOpen: boolean;
  isTransactionInProgressModalOpen: boolean;
  isTransactionCompleteModalOpen: boolean;
  isTransactionDeniedModalOpen: boolean;
  estimate?: number;
  startTransaction?(): any;
  cancelTransaction?(): any;
}

const Estimate = styled.p`
  font-weight: 600;
`;

export class PublishButton extends React.Component<PublishButtonProps, PublishButtonState> {
  constructor(props: PublishButtonProps) {
    super(props);
    this.state = {
      isPreTransactionModalOpen: false,
      isWaitingTransactionModalOpen: false,
      isTransactionInProgressModalOpen: false,
      isTransactionCompleteModalOpen: false,
      isTransactionDeniedModalOpen: false,
    };
  }
  public async componentDidUpdate(prevProps: PublishButtonProps): Promise<void> {
    if (this.props.civilContentID !== prevProps.civilContentID || this.props.archiveTx !== prevProps.archiveTx) {
      await this.calculateCost();
    }
  }
  public async componentDidMount(): Promise<void> {
    await this.calculateCost();
  }
  public renderPreTransactionModal(): JSX.Element | null {
    if (!this.state.isPreTransactionModalOpen) {
      return null;
    }
    return (
      <MetaMaskModal
        waiting={false}
        bodyText={this.props.modalBodyText}
        cancelTransaction={() => this.cancelTransaction()}
        startTransaction={() => this.startTransaction()}
      >
        <ModalHeader>Open MetaMask to confirm and publish your post</ModalHeader>
      </MetaMaskModal>
    );
  }

  public renderTransactionRejectedModal(): JSX.Element | null {
    if (!this.state.isTransactionDeniedModalOpen) {
      return null;
    }
    return (
      <MetaMaskModal
        waiting={false}
        denied={true}
        denialText={
          "To publish your post on the blockchain, you need to confirm the transaction in your MetaMask wallet."
        }
        cancelTransaction={() => this.cancelTransaction()}
        denialRestartTransactions={this.getTransaction(true)}
      >
        <ModalHeader>Your publish transaction did not complete</ModalHeader>
      </MetaMaskModal>
    );
  }

  public renderAwaitingTransactionModal(): JSX.Element | null {
    if (!this.state.isWaitingTransactionModalOpen) {
      return null;
    }
    return (
      <MetaMaskModal
        waiting={true}
        cancelTransaction={() => this.cancelTransaction()}
        startTransaction={() => this.startTransaction()}
      >
        <ModalHeader>Waiting to Confirm in MetaMask</ModalHeader>
      </MetaMaskModal>
    );
  }

  public renderTransactionPendingModal(): JSX.Element | null {
    if (!this.state.isTransactionInProgressModalOpen) {
      return null;
    }
    return (
      <Modal>
        <ModalHeader>Your post is being published</ModalHeader>
        <ModalP>This can take some time depending on traffic on the Ethereum network.</ModalP>
        <ModalP>
          You can continue editing or close out of this post and the publish transaction will continue to process.
          However, this publish transaction won't reflect any further changes you make to the post unless you
          re-publish.
        </ModalP>
        <ModalButtonContainer>
          <Button
            size={buttonSizes.MEDIUM_WIDE}
            onClick={() => this.setState({ isTransactionInProgressModalOpen: false })}
          >
            OK
          </Button>
        </ModalButtonContainer>
      </Modal>
    );
  }

  public renderTransactionCompleteModal(): JSX.Element | null {
    if (!this.state.isTransactionCompleteModalOpen) {
      return null;
    }
    return (
      <Modal>
        <ModalHeader>Post published!</ModalHeader>
        <ModalP>Your post was successfully published to the Civil network.</ModalP>
        <ModalP>
          Note that any time you make a significant update or revision to your post on your site, we recommend you also
          index and archive that revision.
        </ModalP>
        <ModalButtonContainer>
          <Button
            size={buttonSizes.MEDIUM_WIDE}
            onClick={() => this.setState({ isTransactionCompleteModalOpen: false })}
          >
            Great!
          </Button>
        </ModalButtonContainer>
      </Modal>
    );
  }

  public render(): JSX.Element {
    const costExplainer = (
      <>
        Current Prices based on{" "}
        <a href="https://ethgasstation.info" target="_blank">
          {"https://ethgasstation.info"}
        </a>
        . More information about gas prices and the blockchain can be found{" "}
        <a href={`${urls.HELP_BASE}sections/360002451451-Funding-and-ETH`} target="_blank">
          here
        </a>
        .
      </>
    );

    return (
      <>
        {!this.props.walletReady && <ErrorText>Waiting for wallet</ErrorText>}
        <Estimate>
          Estimated cost to publish this post <br />
          {this.state.estimate && "ETH: " + this.state.estimate.toFixed(6)}
          <QuestionToolTip explainerText={costExplainer} />
        </Estimate>
        <HelpText>This will open a window and you must complete the transacation in MetaMask to publish.</HelpText>
        <PrimaryButtonWrap>
          {this.props.txHash ? (
            <WaitingButton />
          ) : (
            <TransactionButtonNoModal
              Button={(props: TransactionButtonInnerProps) => (
                <IndexTransactionButton {...props} archive={this.props.archive} isPublished={this.props.isPublished} />
              )}
              transactions={this.getTransaction()}
              disabled={this.props.disabled}
            />
          )}
        </PrimaryButtonWrap>
        {this.renderPreTransactionModal()}
        {this.renderTransactionPendingModal()}
        {this.renderTransactionCompleteModal()}
        {this.renderAwaitingTransactionModal()}
        {this.renderTransactionRejectedModal()}
      </>
    );
  }

  private getTransaction = (noPreModal?: boolean): Transaction[] => {
    const isUpdate = !!this.props.civilContentID;
    return [
      {
        transaction: async () => {
          this.setState({
            isTransactionDeniedModalOpen: false,
            isWaitingTransactionModalOpen: true,
            isPreTransactionModalOpen: false,
          });
          const newsroom = await getNewsroom();
          const ipfs = getIPFS();
          if (!this.props.archive) {
            const files = await ipfs.add(toBuffer(JSON.stringify(this.props.revisionJson)), {
              hash: "keccak-256",
              pin: true,
            });
            this.setState({ ipfsPath: files[0].path });
            if (isUpdate) {
              return newsroom.updateRevisionURIAndHash(
                this.props.civilContentID!,
                this.props.revisionUrl,
                this.props.revisionJsonHash,
              );
            } else {
              return newsroom.publishURIAndHash(this.props.revisionUrl, this.props.revisionJsonHash);
            }
          } else {
            const content = await apiRequest({
              method: "GET",
              path: `/civil-publisher/v1/revisions-content/${this.props.revisionJson.revisionContentHash}`,
            });
            const revision = { ...this.props.revisionJson, content };
            const revisionHash = hashContent(revision);
            const files = await ipfs.add(toBuffer(JSON.stringify(revision)), { hash: "keccak-256", pin: true });
            this.setState({ ipfsPath: files[0].path });
            if (isUpdate) {
              if (this.props.archiveTx) {
                return newsroom.updateRevisionURIAndHashWithArchive(this.props.civilContentID!, revision, revisionHash);
              } else {
                return newsroom.updateRevisionURIAndHash(
                  this.props.civilContentID!,
                  this.props.revisionUrl,
                  this.props.revisionJsonHash,
                );
              }
            } else {
              if (this.props.archiveTx) {
                return newsroom.publishWithArchive(revision, revisionHash);
              } else {
                return newsroom.publishURIAndHash(`ipfs://${files[0].path}`, revisionHash);
              }
            }
          }
        },
        requireBeforeTransaction: noPreModal ? undefined : this.requireBeforeTransaction,
        postTransaction: async (result: number) => {
          this.setState({ isTransactionCompleteModalOpen: true, isTransactionInProgressModalOpen: false });
          if (isUpdate) {
            await this.props.updateContent!(
              this.props.currentPostLastRevisionId!,
              this.props.revisionJson,
              this.props.txHash!,
              this.state.ipfsPath!,
              { ipfs: this.props.archive, transaction: this.props.archiveTx },
            );
          } else {
            await this.props.publishContent!(
              result,
              this.props.currentPostLastRevisionId!,
              this.props.revisionJson,
              this.props.txHash!,
              this.state.ipfsPath!,
              { ipfs: this.props.archive, transaction: this.props.archiveTx },
            );
          }
        },
        handleTransactionHash: this.handleTransactionHash,
        handleTransactionError: this.handleTransactionError,
      },
    ];
  };

  private calculateCost = async (): Promise<void> => {
    const newsroom = await getNewsroom();
    const civil = await getCivil();
    let gas: number;
    if (!this.props.civilContentID) {
      if (this.props.archiveTx) {
        const content = await apiRequest({
          method: "GET",
          path: `/civil-publisher/v1/revisions-content/${this.props.revisionJson.revisionContentHash}`,
        });
        const revision = { ...this.props.revisionJson, content };
        gas = await newsroom.estimatePublishURIAndHash(revision, hashContent(revision), "", "", true);
      } else {
        gas = await newsroom.estimatePublishURIAndHash(this.props.revisionUrl, this.props.revisionJsonHash);
      }
    } else {
      if (this.props.archiveTx) {
        const content = await apiRequest({
          method: "GET",
          path: `/civil-publisher/v1/revisions-content/${this.props.revisionJson.revisionContentHash}`,
        });
        const revision = { ...this.props.revisionJson, content };
        gas = await newsroom.estimateUpdateURIAndHash(
          this.props.civilContentID,
          revision,
          hashContent(revision),
          "",
          true,
        );
      } else {
        gas = await newsroom.estimateUpdateURIAndHash(
          this.props.civilContentID,
          this.props.revisionUrl,
          hashContent(this.props.revisionJson),
        );
      }
    }
    const gasPrice = await civil!.getGasPrice();
    this.setState({
      estimate: gasPrice
        .times(gas)
        .div(civil!.toBigNumber(10).pow(18))
        .toNumber(),
    });
  };

  private requireBeforeTransaction = async () => {
    return new Promise((res, rej) => {
      this.setState({
        startTransaction: res,
        cancelTransaction: rej,
        isPreTransactionModalOpen: true,
      });
    });
  };

  private handleTransactionHash = (txHash: TxHash) => {
    this.setState({
      isTransactionInProgressModalOpen: true,
      isWaitingTransactionModalOpen: false,
    });
    this.props.saveTxHash!(txHash, this.state.ipfsPath!, {
      ipfs: this.props.archive,
      transaction: this.props.archiveTx,
    });
  };

  private handleTransactionError = (err: Error) => {
    this.setState({ isWaitingTransactionModalOpen: false });
    if (err.message === "Error: MetaMask Tx Signature: User denied transaction signature.") {
      this.setState({ isTransactionDeniedModalOpen: true });
    }
  };

  private cancelTransaction = () => {
    if (this.state.cancelTransaction) {
      this.state.cancelTransaction();
    }
    this.setState({
      cancelTransaction: undefined,
      startTransaction: undefined,
      isPreTransactionModalOpen: false,
      isTransactionDeniedModalOpen: false,
    });
  };

  private startTransaction = () => {
    if (this.state.startTransaction) {
      this.state.startTransaction();
    }
    this.setState({
      cancelTransaction: undefined,
      startTransaction: undefined,
    });
  };
}
