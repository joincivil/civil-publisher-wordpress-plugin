import * as React from "react";
import {
  Transaction,
  MetaMaskModal,
  Modal,
  buttonSizes,
  Button,
  TransactionButtonNoModal,
  TransactionButtonInnerProps,
} from "@joincivil/components";
import { TxHash } from "@joincivil/core";
import { hashContent } from "@joincivil/utils";
import { getNewsroom, getIPFS, getCivil } from "../../util";
import { ModalHeader, ModalP, ModalButtonContainer, HelpText } from "../styles";
const { apiRequest } = window.wp;
import { IndexTransactionButton } from "./Buttons";
import { toBuffer } from "ethereumjs-util";
import { ArchiveOptions } from "./BlockchainPublishPanel";

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

export interface PublishButtonState {
  ipfsPath?: string;
  isPreTransactionModalOpen: boolean;
  isWaitingTransactionModalOpen: boolean;
  isTransactionInProggressModalOpen: boolean;
  isTransactionCompleteModalOpen: boolean;
  isTransactionDeniedModalOpen: boolean;
  estimate?: number;
  startTransaction?(): any;
  cancelTransaction?(): any;
}

export class PublishButton extends React.Component<PublishButtonProps, PublishButtonState> {
  constructor(props: PublishButtonProps) {
    super(props);
    this.state = {
      isPreTransactionModalOpen: false,
      isWaitingTransactionModalOpen: false,
      isTransactionInProggressModalOpen: false,
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
        cancelTransaction={() => this.cancelTransaction()}
        startTransaction={() => this.startTransaction()}
      >
        <ModalHeader>Open MetaMask to confirm and complete publishing your post</ModalHeader>
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
    if (!this.state.isTransactionInProggressModalOpen) {
      return null;
    }
    return (
      <Modal>
        <ModalHeader>Your Post is being indexed</ModalHeader>
        <ModalP> This can take some time depending on traffic on the Ethereum network.</ModalP>
        <ModalP>
          {" "}
          You are welcome to leave this page open while continuing to work, but please note that any changes you make to
          a post once the blockchain indexing process has begun will not be reflected on that blockchain index unless
          you re-index.
        </ModalP>
        <ModalButtonContainer>
          <Button
            size={buttonSizes.MEDIUM_WIDE}
            onClick={() => this.setState({ isTransactionInProggressModalOpen: false })}
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
        <ModalHeader>Index added!</ModalHeader>
        <ModalP>Your post was successfully indexed to the Ethereum blockchain.</ModalP>
        <ModalP>
          Note that any time you make an update or revision to a post, we recommend you also index that revision to the
          blockchain
        </ModalP>
        <ModalButtonContainer>
          <Button
            size={buttonSizes.MEDIUM_WIDE}
            onClick={() => this.setState({ isTransactionCompleteModalOpen: false })}
          >
            OK
          </Button>
        </ModalButtonContainer>
      </Modal>
    );
  }

  public render(): JSX.Element {
    return (
      <>
        <HelpText>This will open a window and you must complete the transacation in MetaMask to publish.</HelpText>
        <p>
          Estimated cost to publish this post <br />
          {this.state.estimate && "ETH: " + this.state.estimate.toFixed(6)}
        </p>
        <TransactionButtonNoModal
          Button={(props: TransactionButtonInnerProps) => (
            <IndexTransactionButton {...props} archive={this.props.archive} />
          )}
          transactions={this.getTransaction()}
          disabled={this.props.disabled}
        />
        {this.renderPreTransactionModal()}
        {this.renderTransactionPendingModal()}
        {this.renderTransactionCompleteModal()}
        {this.renderAwaitingTransactionModal()}
        {this.renderTransactionRejectedModal()}
      </>
    );
  }

  private getTransaction = (noPreModal?: boolean): Transaction[] => {
    if (this.props.civilContentID) {
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
              return newsroom.updateRevisionURIAndHash(
                this.props.civilContentID!,
                this.props.revisionUrl,
                this.props.revisionJsonHash,
              );
            } else {
              const content = await apiRequest({
                method: "GET",
                path: `/civil-newsroom-protocol/v1/revisions-content/${this.props.revisionJson.revisionContentHash}`,
              });
              const revision = { ...this.props.revisionJson, content };
              const revisionHash = hashContent(revision);
              const files = await ipfs.add(toBuffer(JSON.stringify(revision)), { hash: "keccak-256", pin: true });
              this.setState({ ipfsPath: files[0].path });
              if (this.props.archiveTx) {
                return newsroom.updateRevisionURIAndHashWithArchive(this.props.civilContentID!, revision, revisionHash);
              } else {
                return newsroom.updateRevisionURIAndHash(
                  this.props.civilContentID!,
                  this.props.revisionUrl,
                  this.props.revisionJsonHash,
                );
              }
            }
          },
          requireBeforeTransaction: noPreModal ? undefined : this.requireBeforeTransaction,
          postTransaction: (result: number) => {
            this.setState({ isTransactionCompleteModalOpen: true, isTransactionInProggressModalOpen: false });
            this.props.updateContent!(
              this.props.currentPostLastRevisionId!,
              this.props.revisionJson,
              this.props.txHash!,
              this.state.ipfsPath!,
              { ipfs: this.props.archive, transaction: this.props.archiveTx },
            );
          },
          handleTransactionHash: this.handleTransactionHash,
          handleTransactionError: this.handleTransactionError,
        },
      ];
    } else {
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
              return newsroom.publishURIAndHash(this.props.revisionUrl, this.props.revisionJsonHash);
            } else {
              const content = await apiRequest({
                method: "GET",
                path: `/civil-newsroom-protocol/v1/revisions-content/${this.props.revisionJson.revisionContentHash}`,
              });
              const revision = { ...this.props.revisionJson, content };
              const revisionHash = hashContent(revision);
              const files = await ipfs.add(toBuffer(JSON.stringify(revision)), { hash: "keccak-256", pin: true });
              this.setState({ ipfsPath: files[0].path });
              if (this.props.archiveTx) {
                return newsroom.publishWithArchive(revision, revisionHash);
              } else {
                return newsroom.publishURIAndHash(`ipfs://${files[0].path}`, revisionHash);
              }
            }
          },
          requireBeforeTransaction: noPreModal ? undefined : this.requireBeforeTransaction,
          postTransaction: (result: number) => {
            this.setState({ isTransactionCompleteModalOpen: true, isTransactionInProggressModalOpen: false });
            this.props.publishContent!(
              result,
              this.props.currentPostLastRevisionId!,
              this.props.revisionJson,
              this.props.txHash!,
              this.state.ipfsPath!,
              { ipfs: this.props.archive, transaction: this.props.archiveTx },
            );
          },
          handleTransactionHash: this.handleTransactionHash,
          handleTransactionError: this.handleTransactionError,
        },
      ];
    }
  };

  private calculateCost = async (): Promise<void> => {
    const newsroom = await getNewsroom();
    const civil = await getCivil();
    let gas: number;
    if (!this.props.civilContentID) {
      if (this.props.archiveTx) {
        const content = await apiRequest({
          method: "GET",
          path: `/civil-newsroom-protocol/v1/revisions-content/${this.props.revisionJson.revisionContentHash}`,
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
          path: `/civil-newsroom-protocol/v1/revisions-content/${this.props.revisionJson.revisionContentHash}`,
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
      isTransactionInProggressModalOpen: true,
      isWaitingTransactionModalOpen: false,
    });
    console.log({ ipfs: this.props.archive, transaction: this.props.archiveTx });
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
