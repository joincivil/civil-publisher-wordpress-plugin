import styled, { StyledComponentClass } from "styled-components";

export enum indicatorColors {
  GREEN = "#29cb42",
  YELLOW = "#ffce2e",
  RED = "#f2524a",
  WHITE = "#ffffff",
}

export interface CircleIndicatorProps {
  indicatorColor: indicatorColors;
  border: boolean;
}

export const CircleIndicator: StyledComponentClass<CircleIndicatorProps, "div"> = styled<CircleIndicatorProps, "div">(
  "div",
)`
  width: 8px;
  height: 8px;
  border-radius: ${props => (props.indicatorColor === indicatorColors.RED ? "0" : "50%")};
  background-color: ${props => props.indicatorColor};
  border: ${props => (props.border ? "1px solid #979797" : "none")};
`;
