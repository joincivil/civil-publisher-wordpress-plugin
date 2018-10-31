import * as React from "react";
import {
  SlideCheckbox,
  Checkbox,
  QuestionToolTip,
  BorderlessButton,
  Button,
  buttonSizes,
  Modal,
  ModalHeading,
} from "@joincivil/components";
import { MainHeading } from "../styles";
import styled from "styled-components";

export interface ArchiveControlsProps {
  archiveSelected: boolean;
  ethTransaction: boolean;
  ipfsSelected: boolean;
  isArchived?: boolean;
  onHeaderClick(): void;
  onSelectEthTransaction(): void;
}

const HeaderWithFlex = MainHeading.extend`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const LowerHeader = HeaderWithFlex.extend`
  font-size: 13px;
`;

const Wrapper = styled.div`
  margin-bottom: 15px;
`;

export class ArchiveControls extends React.Component<ArchiveControlsProps> {
  public render(): JSX.Element {
    const controls = this.props.archiveSelected ? (
      <>
        <Wrapper>
          <LowerHeader>
            <span>
              IPFS (Peer-to-Peer)
              <QuestionToolTip explainerText="This option is always on by default. IPFS is a decentralized file storage system. Your post will be added to IPFS, where it will be stored and pinned on a node run by Infura. Anybody can also access the content and pin it themselves if they so choose." />
            </span>
            <Checkbox checked={this.props.ipfsSelected} onClick={() => {}} locked={true} />
          </LowerHeader>
          <p>
            Archive to a peer-to-peer distribution network where members of the network pin content to provide a
            permanent archive of your post. Cost: Free
          </p>
        </Wrapper>
        <Wrapper>
          <LowerHeader>
            <span>
              Ethereum blockchain
              <QuestionToolTip explainerText="This option lets you archive your post to the Ethereum blockchain. It will include the full text of your post. Since the blockchain is a public ledger, people will be able to find and see your article text from the transaction log." />
            </span>
            <Checkbox checked={this.props.ethTransaction} onClick={this.props.onSelectEthTransaction} />
          </LowerHeader>
          <p>Archive to the Ethereum blockchain network to provide a permanent archive of your post. Cost: Varies</p>
        </Wrapper>
      </>
    ) : null;
    return (
      <>
        <HeaderWithFlex>
          {this.props.isArchived ? "Update" : "Add"} Archive{" "}
          <SlideCheckbox onClick={this.props.onHeaderClick} checked={this.props.archiveSelected} />
        </HeaderWithFlex>
        {controls}
      </>
    );
  }
}
