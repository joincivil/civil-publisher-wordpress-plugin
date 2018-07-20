import * as React from "react";
import { ArticleIndexIcon, TransactionButton, buttonSizes } from "@joincivil/components";
import { getNewsroom } from "../../util";
import { TxHash } from "@joincivil/core";
import { PostStatus } from "./PostStatus";
import { Wrapper, IconWrap, Heading, MainHeading, IntroSection, Body, BodySection, HelpText } from "../styles";

export interface BlockchainPublishPanelProps {
  isNewsroomEditor: boolean;
  publishStatus?: string;
  publishDisabled?: boolean;
  civilContentID?: number;
  currentPostLastRevisionId?: number;
  publishedRevisions: any[];
  revisionJson: string;
  revisionJsonHash: string;
  revisionUrl: string;
  isDirty: boolean;
  correctNetwork: boolean;
  txHash?: string;
  userCapabilities: {[capability: string]: boolean};
  publishContent?(contentId: number, revisionId: number, revisionJson: any): void;
  updateContent?(revisionId: number, revisionJson: any): void;
  saveTxHash?(txHash: TxHash): void;
}

export class BlockchainPublishPanelComponent extends React.Component<BlockchainPublishPanelProps> {
  public async componentDidMount(): Promise<void> {
    if (this.props.txHash && this.props.txHash.length > 0) {
      const newsroom = await getNewsroom();
      if (!this.props.civilContentID) {
        const contentId = await newsroom.contentIdFromTxHash(this.props.txHash);
        this.props.publishContent!(contentId, this.props.currentPostLastRevisionId!, this.props.revisionJson);
        this.props.saveTxHash!("");
      } else {
        const revisionId = await newsroom.revisionFromTxHash(this.props.txHash)
        this.props.updateContent!(this.props.currentPostLastRevisionId!, this.props.revisionJson);
        this.props.saveTxHash!("");
      }
    }
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
          postTransaction: (result: number) => {
            this.props.updateContent!(this.props.currentPostLastRevisionId!, this.props.revisionJson);
            this.props.saveTxHash!("");
          },
          handleTransactionHash: (txHash: TxHash) => {
            this.props.saveTxHash!(txHash);
          }
        },
      ];
    } else {
      transactions = [
        {
          transaction: async () => {
            const newsroom = await getNewsroom();
            return newsroom.publishURIAndHash(this.props.revisionUrl, this.props.revisionJsonHash);
          },
          postTransaction: (result: number) => {
            this.props.publishContent!(result, this.props.currentPostLastRevisionId!, this.props.revisionJson);
            this.props.saveTxHash!("");
          },
          handleTransactionHash: (txHash: TxHash) => {
            this.props.saveTxHash!(txHash);
          }
        },
      ];
    }

    let insufficientPermissions = false;
    let permissionsMessage;
    if (!this.props.userCapabilities.publish_posts) {
      insufficientPermissions = true;
      permissionsMessage = "your WordPress user account cannot publish posts";
    } else if (!this.props.isNewsroomEditor) {
      insufficientPermissions = true;
      permissionsMessage = "you are not listed as an editor on your Newsroom contract";
    }

    return (
      <Wrapper>
        <IntroSection>
          <Heading>Index</Heading>
          <p>Index this post’s metadata and hash to your newsroom contract on the Ethereum blockchain. <a href="TODO">Learn more</a></p>
        </IntroSection>

        <Body>
          <PostStatus requirePublish={true} actionString="indexing" />

          <BodySection>
            <Heading>Post Status</Heading>
            Status: {this.props.publishStatus}
            {insufficientPermissions && `. Permissions not set to publish: ${permissionsMessage}.`}
          </BodySection>

          {insufficientPermissions && <BodySection>
            <p>You do not have permission to record this post to your Newsroom contract on the Ethereum blockchain.</p>
            { /* TODO: Right now Sign and Record are on same panel so Sign is above this message. When we move them to separate tabs, "sign your post" should be a link that opens the Sign tab. */ }
            <p>You can sign your post above for enhanced credibility and verification using your wallet address.</p>
          </BodySection>}

          <BodySection>
            <MainHeading>
              Create Index
              <IconWrap>
                <ArticleIndexIcon />
              </IconWrap>
            </MainHeading>
            <HelpText>
              This will open a MetaMask pop-up and you must complete the transacation to index your post.
            </HelpText>
            <TransactionButton
              disabled={this.props.publishDisabled || !this.props.correctNetwork || insufficientPermissions}
              transactions={transactions}
              size={buttonSizes.SMALL}
            >
              Index to Blockchain
            </TransactionButton>
          </BodySection>
        </Body>
      </Wrapper>
    );
  }
}
