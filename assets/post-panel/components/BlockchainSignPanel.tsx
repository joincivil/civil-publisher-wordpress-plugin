const { Button } = window.wp.components;
import * as React from "react";
import { EthAddress, ApprovedRevision } from "@joincivil/core";
import { ArticleSignIcon } from "@joincivil/components";
import { SignatureData } from "../store/interfaces";
import { PostStatus } from "./PostStatus";
import { Signature } from "./Signature";
import { Wrapper, IconWrap, Heading, MainHeading, IntroSection, Body, BodySection, HelpText } from "../styles";

export interface BlockchainSignPanelProps {
  username: string;
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
          authorUsername={key}
          authorAddress={val.author}
          sig={val.signature}
          isDirty={this.props.isDirty}
          isValid={this.props.isValidSignature(val)}
          isYou={val.author === this.props.userWalletAddress}
        />
      ),
    );

    return (
      <Wrapper>
        <IntroSection>
          <Heading>Sign</Heading>
          <p>
            We recommend you sign your posts for enhanced credibility. By signing this post, you are acknowledging that
            you are its author and are fully aware of its content. <a href="TODO">Learn more</a>
          </p>
        </IntroSection>
        <Body>
          <PostStatus actionString="signing" />

          <BodySection>
            <MainHeading>
              Signatures
              <IconWrap>
                <ArticleSignIcon />
              </IconWrap>
            </MainHeading>
            {Object.keys(this.props.signatures).length > 0 && <>{signatures}</>}
          </BodySection>

          <BodySection>
            <Button isPrimary={true} disabled={this.props.signDisabled} onClick={() => this.props.signArticle()}>
              Sign Article
            </Button>
          </BodySection>

          <BodySection>
            <i>
              {this.props.userWalletAddress ? (
                <>
                  Signing as <code>{this.props.userWalletAddress}</code>
                </>
              ) : (
                <>
                  Please set your wallet address in your <a href="/wp-admin/profile.php">your profile</a> before signing.
                </>
              )}
            </i>
          </BodySection>
        </Body>
      </Wrapper>
    );
  }
}
