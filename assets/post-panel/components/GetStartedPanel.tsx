import * as React from "react";
import {
  Wrapper,
  IconWrap,
  Heading,
  MainHeading,
  IntroSection,
  Body,
  BodySection,
  ModalHeader,
  ModalP,
  ModalButtonContainer,
} from "../styles";
import { Button, buttonSizes } from "@joincivil/components";

export interface GetStartedPanelProps {
  getStarted(): void;
}

export class GetStartedPanel extends React.Component<GetStartedPanelProps> {
  public render(): JSX.Element {
    return (
      <Body>
        <BodySection>
          <p>
            To publish your post to the Civil network, you'll need to select if you want to create an index of your post
            or additionally archive its content.
          </p>
          <p>
            Index will publish a permanent record of the post’s metadata to the Civil network, and provides proof that
            its contents have not changed since since the last publish date.
          </p>
          <p>
            Archive will backup your content and make the full text public by creating a permanent record as well as an
            index of the post. Your full text will be viewable outside of your paywall. You'll be able to select how you
            want to publish.
          </p>
          <Button size={buttonSizes.MEDIUM_WIDE} fullWidth onClick={this.props.getStarted}>
            Get Started
          </Button>
        </BodySection>
      </Body>
    );
  }
}
