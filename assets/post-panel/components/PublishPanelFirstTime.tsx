import * as React from "react";
import {
  IconWrap,
  Heading,
  MainHeading,
  IntroSection,
  Body,
  BodySection,
  ModalHeader,
  ModalP,
  ModalButtonContainer,
  HelpText,
} from "../styles";
import { SlideCheckbox, Checkbox } from "@joincivil/components";
import { TxHash } from "@joincivil/core";
import { hashContent } from "@joincivil/utils";
import styled from "styled-components";
import { getNewsroom, getCivil } from "../../util";
import { PublishButton } from "./PublishButton";
const { apiRequest } = window.wp;
import { ArchiveOptions } from "./BlockchainPublishPanel";
import { ArchiveControls } from "./ArchiveControls";

export interface PublishPanelFirstTimeState {
  archiveSelected: boolean;
  ipfsSelected: boolean;
  ethTransaction: boolean;
  estimate?: number;
}

export interface PublishPanelFirstTimeProps {
  revisionUrl: string;
  revisionJsonHash: string;
  revisionJson: any;
  civilContentID?: number;
  currentPostLastRevisionId?: number;
  txHash?: TxHash;
  disabled?: boolean;
  publishContent?(
    contentId: number,
    revisionId: number,
    revisionJson: any,
    txHash: TxHash,
    ipfs: string,
    archive: ArchiveOptions,
  ): void;
  updateContent?(revisionId: number, revisionJson: any, txHash: TxHash, ipfs: string, archive?: ArchiveOptions): void;
  saveTxHash?(txHash: TxHash, ipfs: string, archive: ArchiveOptions): void;
}

export class PublishPanelFirstTime extends React.Component<PublishPanelFirstTimeProps, PublishPanelFirstTimeState> {
  constructor(props: PublishPanelFirstTimeProps) {
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
          <Heading>Publish Index</Heading>
          <p>
            Publishing the index adds this post’s metadata and hash to IPFS and Ethereum Blockchain. It will appear in
            the Civil network, and provides proof that the contents have not changed since last publish. The metadata
            will include a record and the link to the post.
          </p>
        </BodySection>
        <BodySection>
          <ArchiveControls
            archiveSelected={this.state.archiveSelected}
            ethTransaction={this.state.ethTransaction}
            ipfsSelected={this.state.ipfsSelected}
            onHeaderClick={this.selectArchive}
            onSelectEthTransaction={this.selectEthTransaction}
          />
          <p>
            Archive will save the full text of this post to IPFS and, optionally, the Ethereum network. And index will
            be published to connect this archive to your newsroom.
          </p>
          <p>
            When you archive the full text, please make note that the text will be public and will be visible outside of
            your paywall.
          </p>
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
            saveTxHash={this.props.saveTxHash}
            publishContent={this.props.publishContent}
            updateContent={this.props.updateContent}
          />
        </BodySection>
      </Body>
    );
  }
  private selectArchive = (): void => {
    this.setState({ archiveSelected: !this.state.archiveSelected });
  };
  private selectEthTransaction = (): void => {
    this.setState({ ethTransaction: !this.state.ethTransaction });
  };
}
