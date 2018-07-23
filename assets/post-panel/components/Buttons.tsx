import * as React from "react";
import { TransactionButtonInnerProps, Button, buttonSizes } from "@joincivil/components";
import styled, {StyledComponentClass} from "styled-components";

export const DisabledTransactionProcessingButton: StyledComponentClass<any, "button"> = styled.button`
    padding: 6px 40px;
    background: transparent;
    border-radius: 3px;
    border: solid 1px #dddddd;
`;

export const IndexTransactionButton: React.StatelessComponent<TransactionButtonInnerProps> = (props) => {
    let buttonComponent = <Button disabled={props.disabled} onClick={props.onClick} size={buttonSizes.MEDIUM_WIDE}>Index to Blockchain</Button>;
    switch (props.step) {
        case 1:
            buttonComponent = <Button disabled={true} size={buttonSizes.MEDIUM_WIDE}>Indexing...</Button>;
            break;
        case 2:
            buttonComponent = <DisabledTransactionProcessingButton>Transaction In Progress</DisabledTransactionProcessingButton>;
            break;
    }
    return buttonComponent;
};
