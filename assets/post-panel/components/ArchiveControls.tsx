import * as React from "react";
import { SlideCheckbox, Checkbox } from "@joincivil/components";
import { MainHeading } from "../styles";
import styled from "styled-components";

export interface ArchiveControlsProps {
  archiveSelected: boolean;
  ethTransaction: boolean;
  ipfsSelected: boolean;
  onHeaderClick(): void;
  onSelectEthTransaction(): void;
}

const HeaderWithFlex = MainHeading.extend`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
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
          IPFS (Peer-to-Peer) <Checkbox checked={props.ipfsSelected} onClick={() => {}} locked={true} />
        </LowerHeader>
        <p>Archive to the InterPlanetary File System, a decentralized peer to peer file system.</p>
      </Wrapper>
      <Wrapper>
        <LowerHeader>
          Ethereum blockchain <Checkbox checked={props.ethTransaction} onClick={props.onSelectEthTransaction} />
        </LowerHeader>
        <p>Archive to the Ethereum network by appending the post to a transaction.</p>
      </Wrapper>
    </>
  ) : null;
  return (
    <>
      <HeaderWithFlex>
        Add Archive <SlideCheckbox onClick={props.onHeaderClick} checked={props.archiveSelected} />
      </HeaderWithFlex>
      {controls}
    </>
  );
};
