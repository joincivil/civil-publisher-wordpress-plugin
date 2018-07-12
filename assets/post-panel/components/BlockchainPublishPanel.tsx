const { PanelBody, PanelRow } = window.wp.components;
import * as React from "react";
import { TransactionButton, buttonSizes } from "@joincivil/components";
import { getNewsroom } from "../../util";

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
  userCapabilities: {[capability: string]: boolean};
  publishContent?(contentId: number, revisionId: number, revisionJson: any): void;
  updateContent?(revisionId: number, revisionJson: any): void;
}

export class BlockchainPublishPanelComponent extends React.Component<BlockchainPublishPanelProps> {
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
          postTransaction: (result: number) => {
            this.props.publishContent!(result, this.props.currentPostLastRevisionId!, this.props.revisionJson);
          },
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
      <PanelBody title="Create Blockchain Record">
        <PanelRow>
          Status: {this.props.publishStatus}
          {insufficientPermissions && `. Permissions not set to publish: ${permissionsMessage}.`}
        </PanelRow>
        {insufficientPermissions && <PanelRow>
          <p>You do not have permission to record this post to your Newsroom contract on the Ethereum blockchain.</p>
        { /* TODO: Right now Sign and Record are on same panel so Sign is above this message. When we move them to separate tabs, "sign your post" should be a link that opens the Sign tab. */ }
          <p>You can sign your post above for enhanced credibility and verification using your wallet address.</p>
        </PanelRow>}
        <PanelRow>
          <TransactionButton
            disabled={this.props.publishDisabled || !this.props.correctNetwork || insufficientPermissions}
            transactions={transactions}
            size={buttonSizes.SMALL}
          >
            Create Blockchain Record
          </TransactionButton>
        </PanelRow>
        {this.props.isDirty && <i>Please save this post before publishing.</i>}
      </PanelBody>
    );
  }
}
