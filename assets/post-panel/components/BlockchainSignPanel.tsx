const { Button } = window.wp.components;
import * as React from "react";
import { EthAddress, ApprovedRevision } from "@joincivil/core";
import { ArticleSignPanelIcon } from "@joincivil/components";
import { SignatureData } from "../store/interfaces";
import { PanelWalletStatus } from "./PanelWalletStatus";
import { PostStatus } from "./PostStatus";
import { Signature } from "./Signature";
import {
  Wrapper,
  IconWrap,
  Heading,
  MainHeading,
  IntroSection,
  Body,
  BodySection,
  ErrorText,
  HelpText,
} from "../styles";

export interface BlockchainSignPanelProps {
  currentUserId: number;
  isWpEditor: boolean;
  signatures: SignatureData;
  signDisabled: boolean;
  isDirty: boolean;
  latestRevisionJson: any;
  postAuthors: any[];
  currentUserIsPostAuthor: boolean;
  signArticle(): void;
  isValidSignature(signature: ApprovedRevision): boolean;
}

export class BlockchainSignPanelComponent extends React.Component<BlockchainSignPanelProps> {
  public render(): JSX.Element {
    const ownSigData = this.props.signatures[this.props.currentUserId];
    const ownSigValid = ownSigData && this.props.isValidSignature(ownSigData);
    const needsReSign = ownSigData && !ownSigValid;
    const ownSig = <Signature authorUserId={this.props.currentUserId} sigData={ownSigData} isValid={ownSigValid} />;

    const othersSigs = Object.entries(this.props.signatures)
      .filter(
        ([userId, sigData]: [string, ApprovedRevision]): boolean => parseInt(userId, 10) !== this.props.currentUserId,
      )
      .map(
        ([userId, sigData]: [string, ApprovedRevision]): JSX.Element => (
          <Signature
            authorUserId={parseInt(userId, 10)}
            sigData={sigData}
            isValid={this.props.isValidSignature(sigData)}
          />
        ),
      )
      // create placeholder signature elements for any remaining post authors who haven't signed:
      .concat(
        this.props.postAuthors
          .filter(author => !this.props.signatures[author.ID])
          .map(author => <Signature authorUserId={author.ID} />),
      );

    return (
      <Wrapper>
        <IntroSection>
          <Heading>Sign</Heading>
          <p>
            We recommend you sign your posts for enhanced credibility.
            {this.props.currentUserIsPostAuthor
              ? " By signing this post, you are acknowledging that you are its author and are fully aware of its content. "
              : " By signing this post, you are acknowledging that you are fully aware of its content as a representative of your newsroom. "}
            {/*TODO confirm this copy*/}
            <a href="#TODO">Learn more</a>
          </p>
        </IntroSection>
        <Body>
          <PanelWalletStatus />
          <PostStatus actionString="signing" />

          <BodySection>
            <MainHeading>
              Signatures
              <IconWrap style={{ top: 5 }}>
                <ArticleSignPanelIcon />
              </IconWrap>
            </MainHeading>

            {!this.props.signDisabled &&
              (needsReSign ? (
                <ErrorText>Post updated and signature is no longer valid. Needs to be re-signed.</ErrorText>
              ) : (
                <p>Post ready to sign.</p>
              ))}
            {ownSig}

            <HelpText disabled={this.props.signDisabled}>
              This will open a MetaMask pop-up that will ask you to sign a statement. Note: this step is optional.
            </HelpText>
            <p>
              <Button isPrimary={true} disabled={this.props.signDisabled} onClick={() => this.props.signArticle()}>
                {needsReSign ? "Re-s" : "S"}ign Post
              </Button>
            </p>
          </BodySection>

          {this.props.isWpEditor && !!othersSigs.length && <BodySection>{othersSigs}</BodySection>}
        </Body>
      </Wrapper>
    );
  }
}
