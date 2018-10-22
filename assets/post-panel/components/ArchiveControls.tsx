import * as React from "react";
import { SlideCheckbox, Checkbox, QuestionToolTip } from "@joincivil/components";
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

export const ArchiveControls = (props: ArchiveControlsProps): JSX.Element => {
  const controls = props.archiveSelected ? (
    <>
      <Wrapper>
        <LowerHeader>
          <span>
            IPFS (Peer-to-Peer)
            <QuestionToolTip explainerText="This option is always on by default. IPFS is a decentralized file storage system. Your post will be added to IPFS, where it will be stored and pinned on a node run by Infura.  Anybody can also access the content and pin it themselves if they so choose." />
          </span>
          <Checkbox checked={props.ipfsSelected} onClick={() => {}} locked={true} />
        </LowerHeader>
        <p>Archive to the InterPlanetary File System, a decentralized peer to peer file system.</p>
      </Wrapper>
      <Wrapper>
        <LowerHeader>
          <span>
            Ethereum blockchain
            <QuestionToolTip explainerText="This option lets you archive your post to the Ethereum blockchain. It will include the full text of your post. Since the blockchain is a public ledger, people will be able to find and see your article text from the transaction log." />
          </span>
          <Checkbox checked={props.ethTransaction} onClick={props.onSelectEthTransaction} />
        </LowerHeader>
        <p>Archive to the Ethereum network by appending the post to a transaction.</p>
      </Wrapper>
    </>
  ) : null;
  return (
    <>
      <HeaderWithFlex>
        {props.isArchived ? "Update" : "Add"} Archive{" "}
        <SlideCheckbox onClick={props.onHeaderClick} checked={props.archiveSelected} />
      </HeaderWithFlex>
      {controls}
    </>
  );
};
