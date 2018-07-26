import * as React from "react";
import styled, { StyledComponentClass } from "styled-components";
import { CivilLogo } from "@joincivil/components";

export const colors = {
  LINK_BLUE: "#0073AA",
};

export const Wrapper = styled.div`
  overflow-x: hidden;

  // TODO temporary until we separate them into tabs:
  &:first-child {
    border-bottom: 1px solid #d8d8d8;
  }

  p {
    margin-bottom: 16px;
    font-size: 13px;
    line-height: 1.31;
    letter-spacing: -0.1px;
    color: #5f5f5f;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const IconWrap = styled.span`
  position: relative;
  top: 2px;
`;

export const Heading = styled.div`
  margin-bottom: 16px;
  font-size: 14px;
  letter-spacing: -0.2px;
  color: #23282d;

  ${IconWrap} {
    top: 3px;
    left: 6px;
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;
export const MainHeading = Heading.extend`
  font-weight: 600;
`;

export const Intro = styled.div`
  background-color: #fffef6;
  padding: 24px 18px;
  border-bottom: 1px solid #d8d8d8;

  ${Heading} {
    font-size: 16px;
    letter-spacing: -0.3px;
  }
`;
export const IntroHeader = styled.div`
  margin-bottom: 24px;
  svg {
    height: 12px;
    width: auto;
  }
  a {
    float: right;
  }
`;

export const Body = styled.div`
  padding: 0 18px;
`;
export const BodySection = styled.div`
  padding: 24px 0;
  border-bottom: 1px solid #d8d8d8;
  &:last-child {
    border-bottom: 0;
  }
`;

export interface HelpTextProps {
  disabled?: boolean;
}
export const HelpText: StyledComponentClass<HelpTextProps, "p"> = styled<HelpTextProps, "p">("p")`
  opacity: ${props => (props.disabled ? 0.3 : 1)};
  && {
    color: #72777C;
  }
`;

export const ErrorText = styled.p`
  && {
    color: #f2524a;
  }
`;

export class IntroSection extends React.Component {
  public render(): JSX.Element {
    return (
      <Intro>
        <IntroHeader>
          <IconWrap>
            <CivilLogo />
          </IconWrap>
          <a href="#TODO">Help</a>
        </IntroHeader>
        {this.props.children}
      </Intro>
    );
  }
}
