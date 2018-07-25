const { Button } = window.wp.components;
import * as React from "react";
import { EthAddress, ApprovedRevision } from "@joincivil/core";
import { ArticleSignPanelIcon } from "@joincivil/components";
import { SignatureData } from "../store/interfaces";
import { PostStatus } from "./PostStatus";
import { Signature } from "./Signature";
import { Wrapper, IconWrap, Heading, MainHeading, IntroSection, Body, BodySection, HelpText } from "../styles";

export interface BlockchainSignPanelProps {
  currentUserId: number;
  signatures: SignatureData;
  signDisabled: boolean;
  userWalletAddress?: EthAddress;
  isDirty: boolean;
  signArticle(): void;
  isValidSignature(signature: ApprovedRevision): boolean;
}

export class BlockchainSignPanelComponent extends React.Component<BlockchainSignPanelProps> {
  public render(): JSX.Element {
    const signatures = Object.entries(this.props.signatures).map(
      ([key, val]: [string, ApprovedRevision]): JSX.Element => (
        <Signature
          authorUserId={key}
          authorAddress={val.author}
          sig={val.signature}
          isDirty={this.props.isDirty}
          isValid={this.props.isValidSignature(val)}
        />
      ),
    );

    return (
      <Wrapper>
        <IntroSection>
          <Heading>Sign</Heading>
          <p>
            We recommend you sign your posts for enhanced credibility. By signing this post, you are acknowledging that
            you are its author and are fully aware of its content. <a href="#TODO">Learn more</a>
          </p>
        </IntroSection>
        <Body>
          <PostStatus actionString="signing" />

          <BodySection>
            <MainHeading>
              Signatures
              <IconWrap style={{ top: 5 }}>
                <ArticleSignPanelIcon />
              </IconWrap>
            </MainHeading>
            {signatures}
            <HelpText style={{ marginTop: 16 }}>
              This will open a MetaMask pop-up that will ask you to sign a statement. Note: that this step is optional.
            </HelpText>
            <p>
              <Button isPrimary={true} disabled={this.props.signDisabled} onClick={() => this.props.signArticle()}>
                Sign Article
              </Button>
            </p>
          </BodySection>

          <BodySection>
            <i>
              {this.props.userWalletAddress ? (
                <>
                  Signing as <code>{this.props.userWalletAddress}</code>
                </>
              ) : (
                <>
                  Please set your wallet address in your <a href="/wp-admin/profile.php">your profile</a> before
                  signing.
                </>
              )}
            </i>
          </BodySection>
        </Body>
      </Wrapper>
    );
  }
}
