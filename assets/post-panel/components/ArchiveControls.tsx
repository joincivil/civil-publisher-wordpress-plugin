import * as React from "react";
import {
  SlideCheckbox,
  Checkbox,
  QuestionToolTip,
  BorderlessButton,
  Modal,
  ModalHeading,
  buttonSizes,
  Button,
} from "@joincivil/components";
import { MainHeading } from "../styles";
import { urls } from "../../constants";
import styled from "styled-components";

export interface ArchiveControlsProps {
  archiveSelected: boolean;
  ethTransaction: boolean;
  ipfsSelected: boolean;
  isArchived?: boolean;
  pendingTransaction?: boolean;
  intro?: React.ReactNode;
  onHeaderClick(): void;
  onSelectEthTransaction(): void;
}

export interface ArchiveControlsState {
  modalOpen?: boolean;
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

const WhatsTheDifference = styled(BorderlessButton)`
  padding-left: 0;
  margin-left: 0;
  font-size: 13px;
  font-weight: 400;
  text-decoration: underline;
`;

export class ArchiveControls extends React.Component<ArchiveControlsProps, ArchiveControlsState> {
  constructor(props: ArchiveControlsProps) {
    super(props);
    this.state = {
      modalOpen: false,
    };
  }

  public renderModal(): JSX.Element | null {
    if (!this.state.modalOpen) {
      return null;
    }
    return (
      <Modal>
        <ModalHeading>What's the difference?</ModalHeading>
        <p>
          <strong>IPFS:</strong> The InterPlanetary File System is a peer-to-peer file sharing protocol that lets you
          save your posts across a distributed network that tracks changes to these files over time. It creates a new,
          resilient decentralized archive. Every article indexed or archived to the blockchain on the Civil Publisher
          will also by default be indexed or archived onto IPFS. The benefits of IPFS are that it’s free and can host
          multimedia content. However, like other peer-to-peer systems, the content on IPFS is as permanent as the
          number of people willing to host or store it. We currently use Infura as our IPFS provider. Eventually, other
          users and nodes may also pin the content as well.
        </p>
        <p>
          <strong>Ethereum Blockchain:</strong> Ethereum is an open platform where data is replicated across all
          computers using the network. All information on this network is public can't be shut down as long as all the
          computers are contributing to the network. Since the records are all shared, there is no one central location
          of the data. This allows for redundancy, limits on censorship or attempts to remove posts, and a place for
          permanent archiving. The Ethereum Blockchain option requires users to pay a transaction fee (also known as
          gas) to post content and can only include text at this time.
        </p>
        <p>
          <a href={urls.FAQ_HOME} target="_blank">
            Read more about Publishing in our FAQ ↗
          </a>
        </p>
        <div>
          <Button size={buttonSizes.SMALL} onClick={() => this.setState({ modalOpen: false })}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  public render(): JSX.Element {
    const controls = this.props.archiveSelected ? (
      <>
        <p style={{ marginTop: 10 }}>Select where you would like to publish your archive.</p>
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
            permanent archive of your post. <strong>Cost: Free</strong>
          </p>
        </Wrapper>
        <Wrapper>
          <LowerHeader>
            <span>
              Ethereum blockchain
              <QuestionToolTip explainerText="This option lets you archive your post to the Ethereum blockchain. It will include the full text of your post. Since the blockchain is a public ledger, people will be able to find and see your article text from the transaction log." />
            </span>
            <Checkbox
              locked={this.props.pendingTransaction}
              checked={this.props.ethTransaction}
              onClick={this.props.onSelectEthTransaction}
            />
          </LowerHeader>
          <p>
            Archive to the Ethereum blockchain network to provide a permanent archive of your post.{" "}
            <strong>Cost: Varies</strong>
          </p>
        </Wrapper>
        <WhatsTheDifference onClick={() => this.setState({ modalOpen: true })} size={buttonSizes.SMALL}>
          What’s the difference?
        </WhatsTheDifference>
      </>
    ) : null;
    return (
      <>
        <HeaderWithFlex>
          {this.props.isArchived && "Update "}
          Full-Text Archive{" "}
          <SlideCheckbox
            locked={this.props.pendingTransaction}
            onClick={this.props.onHeaderClick}
            checked={this.props.archiveSelected}
          />
        </HeaderWithFlex>
        {this.props.intro}
        {controls}
        {this.renderModal()}
      </>
    );
  }
}
