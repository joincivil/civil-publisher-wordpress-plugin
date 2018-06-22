import * as React from "react";
const { select, withSelect, withDispatch } = window.wp.data;
const { compose } = window.wp.element;
import { getNewsroom, revisionJsonSansDate } from "../util";
import { apiNamespace, postMetaKeys } from "../constants";
import { hashContent } from "@joincivil/utils";
import { TransactionButton, buttonSizes } from "@joincivil/components";
import { BlockchainPublishPanelComponent, BlockchainPublishPanelProps } from "./components/BlockchainPublishPanel";

const BlockchainPublishPanel = compose([
  withSelect(
    (selectStore: any, ownProps: Partial<BlockchainPublishPanelProps>): Partial<BlockchainPublishPanelProps> => {
      const { getCurrentPostLastRevisionId, isEditedPostDirty } = selectStore("core/editor");
      const {
        getCivilContentID,
        getPublishedStatus,
        getPublishedRevisions,
        getPublishStatusString,
        isPublishDisabled,
        getRevisionJSON,
      } = selectStore("civil/blockchain");
      const publishDisabled = isPublishDisabled();
      const currentPostLastRevisionId = getCurrentPostLastRevisionId();
      const publishedRevisions = getPublishedRevisions();
      const publishStatus = getPublishStatusString(publishedRevisions);
      const civilContentID = getCivilContentID();
      const isDirty = isEditedPostDirty();
      let revisionJson;
      let revisionJsonHash;
      let revisionUrl;
      if (currentPostLastRevisionId) {
        revisionJson = getRevisionJSON(currentPostLastRevisionId);
        revisionJsonHash = hashContent(revisionJson);
        revisionUrl = `${window.location.origin}/wp-json${apiNamespace}revisions/${currentPostLastRevisionId}`;
      }

      return {
        publishStatus,
        publishDisabled,
        civilContentID,
        currentPostLastRevisionId,
        publishedRevisions,
        revisionJson,
        revisionJsonHash,
        revisionUrl,
        isDirty,
      };
    },
  ),

  withDispatch(
    (dispatch: any, ownProps: BlockchainPublishPanelProps): Partial<BlockchainPublishPanelProps> => {
      const { editPost, savePost } = dispatch("core/editor");
      const { publishContent, setCivilContentID, updatePublishedState } = dispatch("civil/blockchain");
      const { civilContentID, currentPostLastRevisionId, publishedRevisions } = ownProps;

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
