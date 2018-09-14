import * as React from "react";
import { TransactionButtonInnerProps, Button, buttonSizes, ClipLoader } from "@joincivil/components";
import styled, { StyledComponentClass } from "styled-components";

export const DisabledTransactionProcessingButton: StyledComponentClass<any, "button"> = styled.button`
  padding: 6px 20px 6px 40px;
  background: transparent;
  border-radius: 3px;
  border: solid 1px #dddddd;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ClipL = ClipLoader.extend`
  margin-left: 5px;
`;

export interface IndexTransactionButtonProps extends TransactionButtonInnerProps {
  isPublished?: boolean;
  archive?: boolean;
}

export const IndexTransactionButton: React.StatelessComponent<IndexTransactionButtonProps> = props => {
  let buttonComponent = (
    <Button disabled={props.disabled} onClick={props.onClick} size={buttonSizes.MEDIUM_WIDE} fullWidth>
      {props.isPublished ? "Update " : "Publish " }
      {props.archive ? "Index and Archive" : "Index"}
    </Button>
  );
  switch (props.step) {
    case 1:
      buttonComponent = (
        <Button disabled={true} size={buttonSizes.MEDIUM_WIDE} fullWidth>
          Awaiting Confirmation
        </Button>
      );
      break;
    case 2:
      buttonComponent = (
        <DisabledTransactionProcessingButton>
          Transaction In Progress... <ClipL size={15} />
        </DisabledTransactionProcessingButton>
      );
      break;
  }
  return buttonComponent;
};
