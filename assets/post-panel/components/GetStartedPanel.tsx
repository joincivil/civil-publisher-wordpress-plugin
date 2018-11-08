import * as React from "react";
import { Body, BodySection, PrimaryButtonWrap } from "../styles";
import { Button, buttonSizes } from "@joincivil/components";
import styled from "styled-components";

export interface GetStartedPanelProps {
  getStarted(): void;
}

const TextArea = styled("div")`
  overflow-y: scroll;
  height: 35vh;
`

export class GetStartedPanel extends React.Component<GetStartedPanelProps> {
  public render(): JSX.Element {
    return (
      <Body>
        <BodySection>
          <TextArea>
            <p>
              To publish your post to the Civil network, you'll need to create an index and select if you want to
              additionally archive its content.
            </p>
            <p>
              Index will publish a permanent record of the post’s metadata to the Civil network, which means that anyone
              who finds that index can track it back to your site where the story will continue to be hosted on your
              servers. The index provides proof that its contents have not changed since the last publish date.
            </p>
            <p>
              The benefits of archiving your full story are that you will permanently save a copy of your content that
              will live on regardless of what happens to your servers over time. Note that if you choose to archive your
              full text it will make it public, which will mean it’s viewable outside of any paywall that might be in
              place. You'll also be asked to pay more in transaction fees (or gas) in order to upload the full text in
              addition to the index.You’ll be given the option each time you publish a story to select whether to publish
              the index or the full archive.
            </p>
          </TextArea>
          <PrimaryButtonWrap>
            <Button size={buttonSizes.MEDIUM_WIDE} fullWidth onClick={this.props.getStarted}>
              Get Started
            </Button>
          </PrimaryButtonWrap>
        </BodySection>
      </Body>
    );
  }
}
