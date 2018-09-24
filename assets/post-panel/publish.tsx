const { withSelect, withDispatch } = window.wp.data;
import { SelectType, DispatchType } from "../../typings/gutenberg";
const { compose } = window.wp.element;
import { revisionJsonSansDate, updatePostMeta, createIpfsUrl } from "../util";
import { apiNamespace, postMetaKeys } from "../constants";
import { hashContent } from "@joincivil/utils";
import {
  BlockchainPublishPanelComponent,
  BlockchainPublishPanelProps,
  ArchiveOptions,
} from "./components/BlockchainPublishPanel";
import { TxHash } from "@joincivil/core";

const BlockchainPublishPanel = compose([
  withSelect(
    (selectStore: SelectType, ownProps: Partial<BlockchainPublishPanelProps>): Partial<BlockchainPublishPanelProps> => {
      const { isEditedPostDirty } = selectStore("core/editor");
      const {
        isNewsroomEditor,
        getUserCapabilities,
        getCivilContentID,
        getPublishedRevisions,
        isPublishDisabled,
        getRevisionJSON,
        isWalletReady,
        getTxHash,
        getArchiveOptions,
        getIpfsPath,
        getLastPublishedRevision,
        getLastArchivedRevision,
        getCurrentIsVersionPublished,
        getLastRevisionId,
      } = selectStore("civil/blockchain");
      const userCapabilities = getUserCapabilities();
      const publishDisabled = isPublishDisabled();
      const currentPostLastRevisionId = getLastRevisionId();
      const publishedRevisions = getPublishedRevisions();
      const civilContentID = getCivilContentID();
      const isDirty = isEditedPostDirty();
      const walletReady = isWalletReady();
      let revisionJson;
      let revisionJsonHash;
      let revisionUrl;
      if (currentPostLastRevisionId) {
        revisionJson = getRevisionJSON(currentPostLastRevisionId);
        revisionJsonHash = hashContent(revisionJson);
        revisionUrl = `${window.civilNamespace.wpSiteUrl}/wp-json${apiNamespace}revisions/${currentPostLastRevisionId}`;
      }

      return {
        txHash: getTxHash(),
        archiveOptions: getArchiveOptions(),
        ipfs: getIpfsPath(),
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
        walletReady,
        currentIsVersionPublished: getCurrentIsVersionPublished(),
        lastPublishedRevision: getLastPublishedRevision(),
        lastArchivedRevision: getLastArchivedRevision(),
      };
    },
  ),

  withDispatch(
    (dispatch: DispatchType, ownProps: BlockchainPublishPanelProps): Partial<BlockchainPublishPanelProps> => {
      const { savePost } = dispatch("core/editor");
      const { setCivilContentID, updatePublishedState } = dispatch("civil/blockchain");
      const { publishedRevisions } = ownProps;

      // Note: the reason we're explicitly bunding savePost into this function is because it gets called by publish/update functions, which also need to trigger a save, but Gutenberg's savePost fails if post is currently saving, so we want to only call it once during publish/update.
      const updateTxHashAndSavePost = (txHash: TxHash, ipfs: string, archive?: ArchiveOptions): void => {
        const newPostMeta = {
          [postMetaKeys.CIVIL_PUBLISH_TXHASH]: `${txHash}`,
          [postMetaKeys.CIVIL_PUBLISH_IPFS]: ipfs,
          [postMetaKeys.CIVIL_PUBLISH_ARCHIVE_STATUS]: archive ? JSON.stringify(archive) : undefined,
        };
        updatePostMeta(newPostMeta);
        savePost();
      };

      const publishArticle = async (
        contentId: number,
        revisionId: number,
        revisionJson: any,
        txHash: TxHash,
        ipfs: string,
        archive?: ArchiveOptions,
      ): Promise<void> => {
        const publishedDate = new Date();
        const revisionJsonSansDateHash = hashContent(revisionJsonSansDate(revisionJson)); // publishing changes the revision date but nothing else, so publishing invalidates whats published
        const publishedRevisionData = {
          revisionID: revisionId,
          revisionJsonSansDateHash,
          published: publishedDate,
          ipfsUrl: createIpfsUrl(ipfs),
          archive,
          txHash,
        };
        publishedRevisions.push(publishedRevisionData);

        const updatedPublishedRevisions = JSON.stringify(publishedRevisions);
        setCivilContentID(contentId);
        const newPostMeta = {
          [postMetaKeys.CIVIL_CONTENT_ID]: `${contentId}`,
          [postMetaKeys.PUBLISHED_REVISIONS]: updatedPublishedRevisions,
        };
        updatePostMeta(newPostMeta);
        updatePublishedState(publishedRevisionData);
        updateTxHashAndSavePost("", "");
      };

      const updateArticle = async (
        revisionId: number,
        revisionJson: any,
        txHash: TxHash,
        ipfs: string,
        archive?: ArchiveOptions,
      ): Promise<void> => {
        const publishedDate = new Date();
        const revisionJsonSansDateHash = hashContent(revisionJsonSansDate(revisionJson));
        const publishedRevisionData = {
          revisionID: revisionId,
          revisionJsonSansDateHash,
          txHash,
          published: publishedDate,
          ipfsUrl: createIpfsUrl(ipfs),
          archive,
        };
        publishedRevisions.push(publishedRevisionData);

        const updatedPublishedRevisions = JSON.stringify(publishedRevisions);
        const newPostMeta = {
          [postMetaKeys.PUBLISHED_REVISIONS]: updatedPublishedRevisions,
        };
        updatePostMeta(newPostMeta);
        updatePublishedState(publishedRevisionData);
        updateTxHashAndSavePost("", "");
      };

      return {
        publishContent: publishArticle,
        updateContent: updateArticle,
        saveTxHash: updateTxHashAndSavePost,
      };
    },
  ),
])(BlockchainPublishPanelComponent);

export default BlockchainPublishPanel;
