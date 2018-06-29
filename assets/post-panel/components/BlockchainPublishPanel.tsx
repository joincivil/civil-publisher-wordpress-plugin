const { PanelBody, PanelRow } = window.wp.components;
import * as React from "react";
import { TransactionButton, buttonSizes } from "@joincivil/components";
import { getNewsroom } from "../../util";

export interface BlockchainPublishPanelState {
  archiveChecked: boolean;
}

export interface BlockchainPublishPanelProps {
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
  publishContent?(contentId: number, revisionId: number, revisionJson: any): void;
  updateContent?(revisionId: number, revisionJson: any): void;
}

export class BlockchainPublishPanelComponent extends React.Component<
  BlockchainPublishPanelProps,
  BlockchainPublishPanelState
> {
  constructor(props: BlockchainPublishPanelProps) {
    super(props);
    this.state = {
      archiveChecked: false,
    };
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
    return (
      <PanelBody title="Record to Blockchain">
        <PanelRow>Status: {this.props.publishStatus && this.props.correctNetwork}</PanelRow>
        <PanelRow>
          <TransactionButton disabled={this.props.publishDisabled} transactions={transactions} size={buttonSizes.SMALL}>
            Publish to Blockchain
          </TransactionButton>
          {this.props.isDirty && <i>Please save this post before publishing.</i>}
        </PanelRow>
      </PanelBody>
    );
  }

  // private onArchiveChange = (checked: boolean): void => {
  //   this.setState({ archiveChecked: checked });
  // };
}
