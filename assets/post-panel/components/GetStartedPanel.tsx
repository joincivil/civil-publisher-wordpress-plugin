import * as React from "react";
import { Body, BodySection, PrimaryButtonWrap } from "../styles";
import { urls } from "../../constants";
import { Button, buttonSizes } from "@joincivil/components";
import styled from "styled-components";

export interface GetStartedPanelProps {
  getStarted(): void;
}

const TextArea = styled("div")`
  overflow-y: scroll;
  height: 35vh;
`;

export class GetStartedPanel extends React.Component<GetStartedPanelProps> {
  public render(): JSX.Element {
    return (
      <Body>
        <BodySection>
          <TextArea>
            <p>
              To publish your post to the{" "}
              <a href={`${urls.HELP_BASE}articles/360017702211-What-is-the-Civil-network-`} target="_blank">
                Civil network
              </a>
              , you'll need to create an <strong>index</strong> and select if you want to additionally{" "}
              <strong>archive</strong> your full text.
            </p>
            <p>
              <strong>Index:</strong> this publishes a permanent record of your post to the{" "}
              <a href={`${urls.HELP_BASE}articles/360017702211-What-is-the-Civil-network-`} target="_blank">
                Civil network
              </a>
              . The index points back to your site where the story is hosted on your servers. The benefit of indexing is
              you have proof that the story hasn't changed since its last publish date. This feature is always on by
              default.
            </p>
            <p>
              <strong>Full-Text Archive</strong>: this adds the full text of your story to your index on the{" "}
              <a href={`${urls.HELP_BASE}articles/360017702211-What-is-the-Civil-network-`} target="_blank">
                Civil network
              </a>
              . The benefit of archiving is that the story lives on regardless of what happens to your servers over
              time. <strong>Note:</strong> if you choose this option it will make your story public, which makes it
              viewable outside a paywall. This option also adds slightly more in fees (gas) to your transaction. This
              feature is optional.
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
