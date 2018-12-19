import styled, { StyledComponentClass } from "styled-components";

export const colors = {
  LINK_BLUE: "#0073AA",
  DARK_GRAY: "#5F5F5F",
  GRAY: "#D8D8D8",
  ERROR_RED: "#F2524A",

  navIcon: {
    BG: "#EAEAEA",
    COLOR: "#444444",
    BG_ACTIVE: "#555D65",
    COLOR_ACTIVE: "#FFFFFF",
  },
};

export const Wrapper = styled.div`
  overflow-x: hidden;
  background-color: #edeff0;

  p {
    margin-bottom: 10px;
    font-size: 13px;
    line-height: 1.31;
    letter-spacing: -0.1px;
    color: ${colors.DARK_GRAY};

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const IconWrap = styled.span`
  position: relative;
  top: 2px;
`;

export interface HelpTextProps {
  disabled?: boolean;
}
export const HelpText: StyledComponentClass<HelpTextProps, "p"> = styled<HelpTextProps, "p">("p")`
  opacity: ${props => (props.disabled ? 0.3 : 1)};
  && {
    color: #72777c;
  }
`;

export const ErrorText = styled.p`
  && {
    font-weight: normal;
    color: ${colors.ERROR_RED};
  }
`;

export const Heading = styled.div`
  margin-bottom: 8px;
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

  ${ErrorText} {
    font-size: 13px;
    float: right;
  }
`;
export const MainHeading = Heading.extend`
  font-weight: 600;
`;
export const ErrorHeading = Heading.extend`
  font-weight: 600;
  color: ${colors.ERROR_RED};
`;

export const Intro = styled.div`
  background-color: #fff;
  padding: 20px 0px;
  border-bottom: 1px solid ${colors.GRAY};

  ${Heading} {
    font-size: 16px;
    letter-spacing: -0.3px;
  }
`;

export const Body = styled.div`
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: solid 1px #dddddd;
  border-top: solid 1px #dddddd;
  &:first-child {
    border-top: none;
  }
`;
export const BodySection = styled.div`
  padding: 20px 17px;
  border-bottom: 1px solid ${colors.GRAY};
  margin: 0 -20px;
  &:last-child {
    border-bottom: 0;
  }
`;

export const ModalHeader = styled.h2`
  font-size: 20px;
`;

export const ModalP = styled.p`
  font-size: 16px;
  color: ${colors.DARK_GRAY};
`;

export const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const PrimaryButtonWrap = styled.div`
  margin-top: 16px;
`;
