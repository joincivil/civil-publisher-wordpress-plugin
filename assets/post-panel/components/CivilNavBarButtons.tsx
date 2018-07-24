import * as React from "react";
import { ArticleIndexIcon, ArticleSignIcon } from "@joincivil/components";
import { TxHash } from "@joincivil/core";
import { CircleIndicator, indicatorColors } from "./CircleIndicator";
import styled from "styled-components";

const Wrapper = styled.div`
  border: 1px solid #dddddd;
  border-radius: 4px;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const CivilButton = styled.span`
  color: #0073af;
  padding: 7px 13px;
  margin: 0;
  border-right: 1px solid #dddddd;
`;

const IconSection = styled.span`
  display: flex;
  align-items: center;
  background-color: ${(props: CivilNavBarButtonsProps): string => (props.isClosed ? "#555d65" : "transparent")};
  color: ${(props: CivilNavBarButtonsProps): string => (props.isClosed ? "#ffffff" : "#444444")};
  padding: 5px 13px;
  border-radius: 0 4px 4px 0;
`;

const DividingLine = styled.div`
  border-right: 1px solid ${(props: CivilNavBarButtonsProps): string => (props.isClosed ? "#ffffff" : "#444444")};
  height: 17px;
  width: 0;
  margin: 0 13px;
  opacity: 0.6;
`;

export interface CivilNavBarButtonsProps {
  isClosed?: boolean;
  txHash?: TxHash;
  lastpublishedRevision?: any;
  currentIsVersionPublished?: boolean;
  isSignaturePresent?: boolean;
  isSignatureValid?: boolean;
}

export class CivilNavBarButtons extends React.Component<CivilNavBarButtonsProps> {
  public render(): JSX.Element {
    const color = this.props.isClosed ? "#ffffff" : "#444444";
    return (
      <Wrapper>
        <CivilButton> Civil </CivilButton>
        <IconSection isClosed={this.props.isClosed}>
          <ArticleSignIcon color={color} />
          <CircleIndicator border={!this.props.isClosed!} indicatorColor={this.signIndicatorColor()} />
          <DividingLine isClosed={this.props.isClosed} />
          <ArticleIndexIcon color={color} />
          <CircleIndicator border={!this.props.isClosed!} indicatorColor={this.indexIndicatorColor()} />
        </IconSection>
      </Wrapper>
    );
  }

  private indexIndicatorColor = (): indicatorColors => {
    if (this.props.txHash && this.props.txHash.length) {
      return indicatorColors.YELLOW;
    } else if (this.props.lastpublishedRevision && !this.props.currentIsVersionPublished) {
      return indicatorColors.RED;
    } else if (this.props.currentIsVersionPublished) {
      return indicatorColors.GREEN;
    }
    return indicatorColors.WHITE;
  };

  private signIndicatorColor = (): indicatorColors => {
    if (!this.props.isSignaturePresent) {
      return indicatorColors.WHITE;
    }
    if (this.props.isSignatureValid) {
      return indicatorColors.GREEN;
    }
    return indicatorColors.RED;
  };
}
