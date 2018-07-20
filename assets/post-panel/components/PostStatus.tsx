import * as React from "react";
const { withSelect } = window.wp.data;
const { dateI18n, getSettings } = window.wp.date;
import { ErrorText, Heading, BodySection, HelpText } from "../styles";

export interface PostStatusProps {
  requirePublish?: boolean;
  actionString?: string;
  saved: boolean;
  published: boolean;
  updated: boolean;
  timestamp: string;
  url: string;
}

class PostStatusComponent extends React.Component<PostStatusProps> {
  public async componentDidMount(): Promise<void> {
  }

  public render(): JSX.Element {
    let content;
    if (this.props.published) {
      const timestampString = dateI18n(getSettings().formats.datetime, this.props.timestamp);
      content = (
        <p>
          Post published
          {this.props.updated && ", last updated"}
          {" "}
          <a href={this.props.url} target="_blank" style={{ display: "inline-block" }}>{timestampString}</a>
        </p>
      );
    } else {
      if (this.props.requirePublish) {
        content = (
          <ErrorText>Waiting for post to be published to your site.</ErrorText>
        );
      } else if (this.props.saved) {
        content = (
          <p>Post saved.</p>
        );
      }
    }

    if (!this.props.saved && !(this.props.requirePublish && !this.props.published)) {
      content = (
        <>
          {content}
          <ErrorText>Please save {this.props.published && "updates to"} this post before {this.props.actionString || "continuing"}.</ErrorText>
        </>
      );
    }

    return (
      <BodySection>
        <Heading>Post Status</Heading>
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
    } = selectStore("core/editor");

    const date = getEditedPostAttribute("date");
    const modifiedDate = getEditedPostAttribute("modified");

    return {
      requirePublish: ownProps.requirePublish,
      saved: !isEditedPostDirty() && !isCleanNewPost(),
      published: isCurrentPostPublished(),
      updated: modifiedDate && modifiedDate !== date,
      timestamp: modifiedDate || date,
      url: getEditedPostAttribute("link"),
    };
  }
)(PostStatusComponent);
