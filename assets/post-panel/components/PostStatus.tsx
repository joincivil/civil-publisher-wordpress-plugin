import * as React from "react";
const { withSelect } = window.wp.data;
const { dateI18n, getSettings } = window.wp.date;
import { ErrorText, Heading, BodySection } from "../styles";
import { RevisionLinks } from "./RevisionLinks";

export interface PostStatusProps {
  requirePublish?: boolean;
  actionString?: string;
  lastPublishedRevision?: any;
  lastArchivedRevision?: any;
  saved: boolean;
  published: boolean;
  updated: boolean;
  timestamp: string;
  url: string;
  isSavingPost: boolean;
  pluginDataMissing: boolean;
  contentId?: number;
}

const ErrorHeading = Heading.extend`
  color: #f2524a;
`;

const NoMarginHeading = Heading.extend`
  margin-bottom: 0;
`;

class PostStatusComponent extends React.Component<PostStatusProps> {
  public render(): JSX.Element {
    let content;
    let heading = <Heading>Post Status</Heading>;

    if (this.props.saved && this.props.pluginDataMissing) {
      heading = <ErrorHeading>Post Status</ErrorHeading>;
      content = (
        <ErrorText>
          This post was {this.props.published ? "published" : "last saved"} before the Civil plugin was activated, and
          so isn't fully processed. Please{" "}
          {this.props.published ? 're-publish by hitting the "Update" button' : "save again"} before continuing.
        </ErrorText>
      );
    } else if (this.props.published) {
      content = <p>Your post is published to your site and is ready to be published on the Civil network.</p>;
    } else {
      if (this.props.requirePublish) {
        heading = <ErrorHeading>Post Status</ErrorHeading>;
        content = (
          <ErrorText>
            Waiting for this post to be published on your site before you can publish to the Civil network.
          </ErrorText>
        );
      } else if (this.props.saved) {
        content = <p>Post saved.</p>;
      }
    }

    if (!this.props.saved && !(this.props.requirePublish && !this.props.published)) {
      content = (
        <>
          {content}
          <ErrorText>
            {this.props.isSavingPost ? (
              "Saving post..."
            ) : (
              <>
                Please save {this.props.published && "updates to"} this post before{" "}
                {this.props.actionString || "continuing"}.
              </>
            )}
          </ErrorText>
        </>
      );
    }

    if (this.props.contentId && this.props.lastPublishedRevision) {
      heading = <NoMarginHeading>Civil publish status</NoMarginHeading>;
      content = (
        <RevisionLinks
          lastArchivedRevision={this.props.lastArchivedRevision}
          lastPublishedRevision={this.props.lastPublishedRevision}
        />
      );
    }

    return (
      <BodySection>
        {heading}
        {content}
      </BodySection>
    );
  }
}

export const PostStatus = withSelect(
  (selectStore: any, ownProps: Partial<PostStatusProps>): Partial<PostStatusProps> => {
    const {
      getEditedPostAttribute,
      isEditedPostDirty,
      isCleanNewPost,
      isCurrentPostPublished,
      isSavingPost,
    } = selectStore("core/editor");
    const { isPluginDataMissing } = selectStore("civil/blockchain");

    const date = getEditedPostAttribute("date_gmt");
    const modifiedDate = getEditedPostAttribute("modified_gmt");

    return {
      requirePublish: ownProps.requirePublish,
      saved: !isEditedPostDirty() && !isCleanNewPost(),
      published: isCurrentPostPublished(),
      updated: modifiedDate && modifiedDate !== date,
      timestamp: modifiedDate || date,
      url: getEditedPostAttribute("link"),
      isSavingPost: isSavingPost(),
      pluginDataMissing: isPluginDataMissing(),
    };
  },
)(PostStatusComponent);
