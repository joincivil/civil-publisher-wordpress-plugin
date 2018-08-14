const { withSelect, withDispatch } = window.wp.data;
const { compose } = window.wp.element;
import { revisionJsonSansDate } from "../util";
import { apiNamespace, postMetaKeys } from "../constants";
import { debounce } from "underscore";
import { hashContent } from "@joincivil/utils";
import { BlockchainPublishPanelComponent, BlockchainPublishPanelProps } from "./components/BlockchainPublishPanel";
import { TxHash } from "@joincivil/core";

const BlockchainPublishPanel = compose([
  withSelect(
    (selectStore: any, ownProps: Partial<BlockchainPublishPanelProps>): Partial<BlockchainPublishPanelProps> => {
      const { isEditedPostDirty } = selectStore("core/editor");
      const {
        isNewsroomEditor,
        getUserCapabilities,
        getCivilContentID,
        getPublishedRevisions,
        isPublishDisabled,
        getRevisionJSON,
        isCorrectNetwork,
        getTxHash,
        getLastPublishedRevision,
        getCurrentIsVersionPublished,
        getLastRevisionId,
      } = selectStore("civil/blockchain");
      const userCapabilities = getUserCapabilities();
      const publishDisabled = isPublishDisabled();
      const currentPostLastRevisionId = getLastRevisionId();
      const publishedRevisions = getPublishedRevisions();
      const civilContentID = getCivilContentID();
      const isDirty = isEditedPostDirty();
      const correctNetwork = isCorrectNetwork();
      let revisionJson;
      let revisionJsonHash;
      let revisionUrl;
      if (currentPostLastRevisionId) {
        revisionJson = getRevisionJSON(currentPostLastRevisionId);
        revisionJsonHash = hashContent(revisionJson);
        revisionUrl = `${window.civilNamespace.wpDomain}/wp-json${apiNamespace}revisions/${currentPostLastRevisionId}`;
      }

      return {
        txHash: getTxHash(),
        isNewsroomEditor: isNewsroomEditor(),
        userCapabilities,
        publishDisabled,
        civilContentID,
        currentPostLastRevisionId,
        publishedRevisions,
        revisionJson,
        revisionJsonHash,
        revisionUrl,
        isDirty,
        correctNetwork,
        currentIsVersionPublished: getCurrentIsVersionPublished(),
        lastPublishedRevision: getLastPublishedRevision(),
      };
    },
  ),

  withDispatch(
    (dispatch: any, ownProps: BlockchainPublishPanelProps): Partial<BlockchainPublishPanelProps> => {
      const { editPost, savePost } = dispatch("core/editor");
      const { setCivilContentID, updatePublishedState } = dispatch("civil/blockchain");
      const { publishedRevisions } = ownProps;

      // savePost fails if post is currently saving, leaving us unexpectedly in dirty state e.g. cause tx hash save happens right after saving updating published revisions data. so debounce.
      const debouncedSave = debounce(savePost, 200);

      const publishArticle = async (contentId: number, revisionId: number, revisionJson: any, txHash: TxHash): Promise<void> => {
        const publishedDate = new Date();
        const revisionJsonSansDateHash = hashContent(revisionJsonSansDate(revisionJson)); // publishing changes the revision date but nothing else, so publishing invalidates whats published
        const publishedRevisionData = {
          revisionID: revisionId,
          revisionJsonSansDateHash,
          published: publishedDate,
          txHash
        };
        publishedRevisions.push(publishedRevisionData);

        const updatedPublishedRevisions = JSON.stringify(publishedRevisions);
        setCivilContentID(contentId);
        const newPostMeta = {
          [postMetaKeys.CIVIL_CONTENT_ID]: `${contentId}`,
          [postMetaKeys.PUBLISHED_REVISIONS]: updatedPublishedRevisions,
        };
        editPost({ meta: newPostMeta });
        debouncedSave();
        dispatch(updatePublishedState(publishedRevisionData));
      };

      const updateArticle = async (revisionId: number, revisionJson: any, txHash: TxHash): Promise<void> => {
        const publishedDate = new Date();
        const revisionJsonSansDateHash = hashContent(revisionJsonSansDate(revisionJson));
        const publishedRevisionData = {
          revisionID: revisionId,
          revisionJsonSansDateHash,
          txHash,
          published: publishedDate,
        };
        publishedRevisions.push(publishedRevisionData);

        const updatedPublishedRevisions = JSON.stringify(publishedRevisions);
        const newPostMeta = {
          [postMetaKeys.PUBLISHED_REVISIONS]: updatedPublishedRevisions,
        };
        editPost({ meta: newPostMeta });
        debouncedSave();
        dispatch(updatePublishedState(publishedRevisionData));
      };

      const saveTxHash = (txHash: TxHash) => {
        const newPostMeta = {
          [postMetaKeys.CIVIL_PUBLISH_TXHASH]: `${txHash}`,
        };
        editPost({ meta: newPostMeta });
        debouncedSave();
      };

      return {
        publishContent: publishArticle,
        updateContent: updateArticle,
        saveTxHash,
      };
    },
  ),
])(BlockchainPublishPanelComponent);

export default BlockchainPublishPanel;
