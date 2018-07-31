import * as React from "react";
import styled from "styled-components";
import { Modal, BorderlessButton, Button, buttonSizes, ClipLoader} from "@joincivil/components";
const modalImageUrl = window.civilImages.metamask_confim_modal;
const metamaskLogoUrl = window.civilImages.metamask_logo;

const ModalP = styled.p`
  font-size: 16px;
  color: #5f5f5f;
`;

const B = Button.extend`
  position: relative;
  display: flex;
  align-items: center;
  height: 46px;
  padding-left: 75px;
`;

const IB = BorderlessButton.extend`
    font-weight: 400;
    margin-right: 30px;
`;

const ImgWrapper = styled.div`
    width: 44px;
    height: 44px;
    background-color: #ffffff;
    position: absolute;
    top: 1px;
    left: 1px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ImgWrapperSmall = styled.span`
    width: 24px;
    height: 24px;
    padding: 4px;
    border-radius: 2px;
    border: 1px solid #dddddd;
    display: inline-block;
`;

const Img = styled.img`
    width: 16px;
    height: 16px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 19px 24px;
`;

const WaitingButton = styled.div`
    border: 1px solid #dddddd;
    padding: 12px 23px;
    color: #5f5f5f;
    display: flex;
    align-items: center;
    justify-content: space-around;
`;

const SpanWithMargin = styled.span`
    margin-right: 10px;
    font-weight: 600;
    font-size: 14px;
`;

export interface PreMetaMaskModalProps {
    waiting: boolean;
    cancelTransaction(): void;
    startTransaction(): void;
}

export const MetaMaskModal: React.StatelessComponent<PreMetaMaskModalProps> = props => {
    const buttonSection = !props.waiting ? (<ButtonContainer>
        <IB onClick={props.cancelTransaction}>Cancel</IB>
        <B onClick={props.startTransaction} size={buttonSizes.MEDIUM_WIDE}>
            <ImgWrapper><Img src={metamaskLogoUrl} /></ImgWrapper>
            Open MetaMask
        </B>
    </ButtonContainer>) : (<ButtonContainer>
        <WaitingButton><SpanWithMargin>Waiting for confirmation</SpanWithMargin><ClipLoader size={19} /></WaitingButton>
    </ButtonContainer>);

    const paragraph = !props.waiting ? (<ModalP> MetaMask will open a new window for you to confirm this transaction with your wallet.</ModalP>) :
        (<ModalP>
            You need to confirm this transaction in your wallet. MetaMask will open a new window to confirm. If you don't see it, please click the icon
            {" "}<ImgWrapperSmall><Img src={metamaskLogoUrl}/></ImgWrapperSmall>{" "}
            in the browser bar.
        </ModalP>);

    return (<Modal width={500} padding={"32px 26px 0 26px"}>
        {props.children}
        {paragraph}
        <img src={modalImageUrl}/>
        {buttonSection}
    </Modal>);
}
