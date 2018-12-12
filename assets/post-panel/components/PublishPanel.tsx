import * as React from "react";
import styled from "styled-components";
import { TxHash } from "@joincivil/core";
import { Collapsable } from "@joincivil/components";
import { ArchiveOptions } from "./BlockchainPublishPanel";
import { Body, BodySection, MainHeading, colors } from "../styles";
import { urls } from "../../constants";
import { ArchiveControls } from "./ArchiveControls";
import { PublishButton } from "./PublishButton";

export interface PublishPanelState {
  archiveSelected: boolean;
  ipfsSelected: boolean;
  ethTransaction: boolean;
}

export interface PublishPanelProps {
  revisionUrl: string;
  revisionJsonHash: string;
  revisionJson: any;
  isPublished: boolean;
  isArchived: boolean;
  civilContentID?: number;
  currentPostLastRevisionId?: number;
  txHash?: TxHash;
  disabled?: boolean;
  walletReady?: boolean;
  publishContent?(
    contentId: number,
    revisionId: number,
    revisionJson: any,
    txHash: TxHash,
    ipfs: string,
    archive: ArchiveOptions,
  ): Promise<void>;
  updateContent?(
    revisionId: number,
    revisionJson: any,
    txHash: TxHash,
    ipfs: string,
    archive?: ArchiveOptions,
  ): Promise<void>;
  saveTxHash?(txHash: TxHash, ipfs: string, archive: ArchiveOptions): void;
}

const CollapsableHeader = styled.span`
  color: #0073af;
  vertical-align: middle;
  margin-bottom: 10px;
  cursor: pointer;
`;

const CollapsableHeaderOpen = CollapsableHeader.extend`
  background-color: #fffef6;
`;

const Arrow = styled.div`
  width: 6px;
  height: 6px;
  border-left: 2px solid #0073af;
  border-bottom: 2px solid #0073af;
  transform: ${(props: { open: boolean }) => (props.open ? "rotate(135deg)" : "rotate(-45deg)")};
  transition: transform 1s;
  display: inline-block;
  veritical-align: middle;
`;

const CollapsableText = styled.div`
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.42;
  letter-spacing: 0px;
  color: ${colors.DARK_GRAY};
  background-color: #fffef6;
  padding: 20px;
  padding-top: 30px;
  margin: -20px;
  margin-top: -25px;
`;

export class PublishPanel extends React.Component<PublishPanelProps, PublishPanelState> {
  constructor(props: PublishPanelProps) {
    super(props);
    this.state = {
      archiveSelected: false,
      ipfsSelected: true,
      ethTransaction: false,
    };
  }
  public render(): JSX.Element {
    return (
      <Body>
        <BodySection>
          <MainHeading>Update Index</MainHeading>
          <p>Update the record and link to your post on the Civil network.</p>
          <Collapsable
            header={<CollapsableHeader>Read more about Index</CollapsableHeader>}
            headerOpen={<CollapsableHeaderOpen>Hide</CollapsableHeaderOpen>}
            ArrowComponent={Arrow}
            open={false}
          >
            <CollapsableText>
              <p>
                This publishes a permanent record of your post to the{" "}
                <a href={`${urls.HELP_BASE}articles/360017702211-What-is-the-Civil-network-`} target="_blank">
                  Civil network
                </a>{" "}
                by putting a link and record of the post onto{" "}
                <a href={`${urls.HELP_BASE}articles/360017702191-What-is-IPFS-`} target="_blank">
                  IPFS
                </a>{" "}
                and the{" "}
                <a href={`${urls.HELP_BASE}articles/360017428692-What-is-the-Ethereum-blockchain-`} target="_blank">
                  Ethereum Blockchain
                </a>
                . The index points back to your site where the story is hosted on your servers. Indexing provides proof
                that the story hasn't changed since its last publish date.
              </p>
              <p>
                We recommend updatting this only if there is a significant change in the story. This feature is always
                on by default.
              </p>
            </CollapsableText>
          </Collapsable>
        </BodySection>
        <BodySection>
          <ArchiveControls
            pendingTransaction={!!this.props.txHash}
            isArchived={this.props.isArchived}
            archiveSelected={this.state.archiveSelected}
            ethTransaction={this.state.ethTransaction}
            ipfsSelected={this.state.ipfsSelected}
            onHeaderClick={this.selectArchive}
            onSelectEthTransaction={this.onSelectEthTransaction}
            intro={
              <>
                {this.props.isArchived ? (
                  <p>
                    Include an updated archive of the full text of your post to the Civil network. Text will be public
                    even if this post is behind a paywall.
                  </p>
                ) : (
                  <p>
                    This will add the full text of this post to the index you publish to{" "}
                    <a href={`${urls.HELP_BASE}articles/360017702191-What-is-IPFS-`} target="_blank">
                      IPFS
                    </a>{" "}
                    and/or the{" "}
                    <a href={`${urls.HELP_BASE}articles/360017428692-What-is-the-Ethereum-blockchain-`} target="_blank">
                      Ethereum Blockchain
                    </a>
                    . <strong>Tip:</strong> If this post is behind a paywall and you don't want the full text to be
                    public, we recommend you only index instead of archiving.
                  </p>
                )}

                <Collapsable
                  header={<CollapsableHeader>Read more about Archive</CollapsableHeader>}
                  headerOpen={<CollapsableHeaderOpen>Hide</CollapsableHeaderOpen>}
                  ArrowComponent={Arrow}
                  open={false}
                >
                  <CollapsableText>
                    <p>
                      This adds the full text of your story to your index on the{" "}
                      <a href={`${urls.HELP_BASE}articles/360017702211-What-is-the-Civil-network-`} target="_blank">
                        Civil network
                      </a>
                      . The benefit of archiving is that the story lives on regardless of what happens to your servers
                      over time.
                    </p>
                    <p>
                      <strong>Note:</strong> If you choose this option it will make your story public, which makes it
                      viewable outside a paywall. This option also adds slightly more in fees (gas) to your transaction.
                      This feature is optional and you can always archive at a later date.
                    </p>
                  </CollapsableText>
                </Collapsable>
              </>
            }
          />
        </BodySection>
        <BodySection>
          <PublishButton
            archive={!!this.state.archiveSelected}
            archiveTx={!!this.state.ethTransaction}
            revisionJson={this.props.revisionJson}
            revisionUrl={this.props.revisionUrl}
            revisionJsonHash={this.props.revisionJsonHash}
            civilContentID={this.props.civilContentID}
            currentPostLastRevisionId={this.props.currentPostLastRevisionId}
            txHash={this.props.txHash}
            disabled={this.props.disabled}
            walletReady={this.props.walletReady}
            isPublished={this.props.isPublished}
            saveTxHash={this.props.saveTxHash}
            publishContent={this.props.publishContent}
            updateContent={this.props.updateContent}
            modalBodyText="You will use MetaMask to confirm this transaction and publish your post."
          />
        </BodySection>
      </Body>
    );
  }
  private selectArchive = async (): Promise<void> => {
    this.setState({ archiveSelected: !this.state.archiveSelected });
  };
  private onSelectEthTransaction = async (): Promise<void> => {
    this.setState({ ethTransaction: !this.state.ethTransaction });
  };
}
