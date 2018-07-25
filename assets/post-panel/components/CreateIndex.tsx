import * as React from "react";
import styled from "styled-components";
const { withSelect } = window.wp.data;
const { dateI18n, getSettings } = window.wp.date;
import { hashContent } from "@joincivil/utils";
import { NorthEastArrow } from "@joincivil/components";
import { revisionJsonSansDate, siteFormatTimeString } from "../../util";
import { colors, ErrorText, HelpText } from "../styles";

export interface CreateIndexProps {
  lastPublishedRevision?: any;
  revisionJson?: any;
  transactionButton: JSX.Element;
  insufficientPermissions: boolean;
  permissionsMessage?: string;
  currentIsVersionPublished: boolean;
}

const ArrowWrap = styled.span`
  position: relative;
  top: 2px;
  left: 4px;
  path {
    fill: ${colors.LINK_BLUE};
  }
`;

export class CreateIndex extends React.Component<CreateIndexProps> {
  public render(): JSX.Element {
    let indexTextUrl;
    let indexTimestamp;

    if (this.props.lastPublishedRevision) {
      indexTimestamp = siteFormatTimeString(this.props.lastPublishedRevision.published);
      indexTextUrl = this.props.lastPublishedRevision.data && this.props.lastPublishedRevision.data.revisionContentUrl;
    }

    return (
      <>
        {this.props.insufficientPermissions ? (
          <>
            <p>
              You are not able to index this post to your newsroom contract on the Ethereum blockchain. {this.props.permissionsMessage}
            </p>
            {/* TODO: Right now Sign and Record are on same panel so Sign is above this message. When we move them to separate tabs, "sign your post" should be a link that opens the Sign tab. */}
            <p>You can sign your post above for enhanced credibility and verification using your wallet address.</p>
          </>
        ) : (
          <>
            {this.props.lastPublishedRevision ? (
              <>
                <p>
                  Your post is indexed to the blockchain. If you update your post on your site in any way, we also
                  recommend updating it on the blockchain.{" "}
                  <a href="#TODO" target="_blank">
                    Why?
                  </a>
                </p>
                <p>
                  <a href={indexTextUrl} target="_blank">
                    {indexTimestamp}
                    <ArrowWrap>
                      <NorthEastArrow />
                    </ArrowWrap>
                  </a>
                </p>
              </>
            ) : (
              <p>Your post is published to your site and is now ready to be indexed to the Ethereum blockchain.</p>
            )}
          </>
        )}

        {this.props.lastPublishedRevision &&
          !this.props.currentIsVersionPublished && (
            <ErrorText>
              Your published update no longer matches what's indexed on the smart contract and will not validate.
            </ErrorText>
          )}

        {!this.props.currentIsVersionPublished && (
          <>
            <HelpText>
              This will open a MetaMask pop-up and you must complete the transacation to index your post.
            </HelpText>

            <p>{this.props.transactionButton}</p>
          </>
        )}
      </>
    );
  }
}
