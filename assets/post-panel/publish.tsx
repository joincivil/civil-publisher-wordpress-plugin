const { Button, PanelRow, CheckboxControl } = window.wp.components;
import * as React from "react";
const { select, withSelect, withDispatch } = window.wp.data;
const { compose } = window.wp.element;
// import { ApprovedRevision } from "@joincivil/core";

import { getNewsroom, revisionJsonSansDate } from "../util";
import { postMetaKeys } from "./store/constants";
import { SignatureData } from "./store/interfaces";
import { hashContent } from "@joincivil/utils";
import { TransactionButton, buttonSizes } from "@joincivil/components";

const PublishButton = withDispatch((dispatch: any, ownProps: any) => {
  const { publishContent } = ownProps;
  return {
    onClick(): void {
      publishContent();
    },
  };
})(Button);

export interface BlockchainPublishPanelState {
  archiveChecked: boolean;
}
export interface BlockchainPublishPanelProps {
  publishStatus?: string;
  publishDisabled?: boolean;
  civilContentID?: string;
  currentPostLastRevisionId?: number;
  publishedRevisions: any[];
  signatures: SignatureData;
  revisionJson: string;
  revisionJsonHash: string;
  revisionUrl: string;
  publishContent?(contentId: number, revisionId: number, revisionJson: any): void;
  updateContent?(revisionId: number, revisionJson: any): void;
}

class BlockchainPublishPanelComponent extends React.Component<
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
              this.props.civilContentID,
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
      <div>
        <hr />
        <h2 className="components-panel__body-title">Publish to Blockchain</h2>
        <PanelRow>Status: {this.props.publishStatus}</PanelRow>
        <PanelRow>
          <TransactionButton disabled={this.props.publishDisabled} transactions={transactions} size={buttonSizes.SMALL}>
            Publish to Blockchain
          </TransactionButton>
        </PanelRow>
        {/* <PanelRow>
          <CheckboxControl
            label="Archive full text"
            checked={this.state.archiveChecked}
            onChange={this.onArchiveChange}
          />
        </PanelRow> */}
      </div>
    );
  }

  private onArchiveChange = (checked: boolean): void => {
    this.setState({ archiveChecked: checked });
  };
}

const BlockchainPublishPanel = compose([
  withSelect(
    (selectStore: any, ownProps: Partial<BlockchainPublishPanelProps>): Partial<BlockchainPublishPanelProps> => {
      const { getCurrentPostLastRevisionId } = selectStore("core/editor");
      const {
        getCivilContentID,
        getPublishedStatus,
        getPublishedRevisions,
        getPublishStatusString,
        getSignatures,
        isPublishDisabled,
        getRevisionJSON,
      } = selectStore("civil/blockchain");
      const publishDisabled = isPublishDisabled();
      const currentPostLastRevisionId = getCurrentPostLastRevisionId();
      const publishedRevisions = getPublishedRevisions();
      const publishStatus = getPublishStatusString(publishedRevisions);
      const signatures = getSignatures();
      const civilContentID = getCivilContentID();
      let revisionJson;
      let revisionJsonHash;
      let revisionUrl;
      if (currentPostLastRevisionId) {
        revisionJson = getRevisionJSON(currentPostLastRevisionId);
        revisionJsonHash = hashContent(revisionJson);
        revisionUrl = `${window.location.origin}/wp-json/civil/newsroom-protocol/v1/revisions/${currentPostLastRevisionId}`;
      }

      return {
        publishStatus,
        publishDisabled,
        civilContentID,
        currentPostLastRevisionId,
        publishedRevisions,
        signatures,
        revisionJson,
        revisionJsonHash,
        revisionUrl,
      };
    },
  ),

  withDispatch(
    (dispatch: any, ownProps: BlockchainPublishPanelProps): Partial<BlockchainPublishPanelProps> => {
      const { editPost, savePost } = dispatch("core/editor");
      const { publishContent, setCivilContentID, updatePublishedState } = dispatch("civil/blockchain");
      const { civilContentID, currentPostLastRevisionId, publishedRevisions, signatures } = ownProps;

      const publishArticle = async (contentId: number, revisionId: number, revisionJson: any): Promise<void> => {
        const publishedDate = new Date();
        const revisionJsonSansDateHash = hashContent(revisionJsonSansDate(revisionJson)); // publishing changes the revision date but nothing else, so publishing invalidates whats published
        const publishedRevisionData = {
          revisionID: revisionId,
          revisionJsonSansDateHash,
          published: publishedDate,
        };
        publishedRevisions.push(publishedRevisionData);

        const updatedPublishedRevisions = JSON.stringify(publishedRevisions);
        setCivilContentID(contentId);
        const newPostMeta = {
          [postMetaKeys.CIVIL_CONTENT_ID]: `${contentId}`,
          [postMetaKeys.PUBLISHED_REVISIONS]: updatedPublishedRevisions,
        };
        editPost({ meta: newPostMeta });
        savePost();
        dispatch(updatePublishedState(publishedRevisionData));
      };

      const updateArticle = async (revisionId: number, revisionJson: any): Promise<void> => {
        const publishedDate = new Date();
        const revisionJsonSansDateHash = hashContent(revisionJsonSansDate(revisionJson));
        const publishedRevisionData = {
          revisionID: revisionId,
          revisionJsonSansDateHash,
          published: publishedDate,
        };
        publishedRevisions.push(publishedRevisionData);

        const updatedPublishedRevisions = JSON.stringify(publishedRevisions);
        const newPostMeta = {
          [postMetaKeys.PUBLISHED_REVISIONS]: updatedPublishedRevisions,
        };
        editPost({ meta: newPostMeta });
        savePost();
        dispatch(updatePublishedState(publishedRevisionData));
      };

      return {
        publishContent: publishArticle,
        updateContent: updateArticle,
      };
    },
  ),
])(BlockchainPublishPanelComponent);

export default BlockchainPublishPanel;
