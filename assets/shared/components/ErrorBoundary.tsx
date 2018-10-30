import * as React from "react";
import styled from "styled-components";
import { Body, BodySection, ErrorHeading } from "../../post-panel/styles";

export interface ErrorBoundaryProps {
  section?: string;
}
export interface ErrorBoundaryState {
  isBroken: boolean;
  error?: Error;
  errorInfo?: object;
}

const Pre = styled.pre`
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
`;

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static defaultProps = {
    section: "plugin",
  };

  constructor(props: any) {
    super(props);
    this.state = { isBroken: false };
  }

  public componentDidCatch(error: Error, info: object): void {
    console.error("Error in", this.props.section, error, info);
    this.setState({
      isBroken: true,
      error,
      errorInfo: info,
    });
  }

  public render(): JSX.Element {
    if (this.state.isBroken) {
      return (
        <Body>
          <BodySection>
            <ErrorHeading>The Civil Publisher has encountered an unexpected error.</ErrorHeading>
            {this.state.error && (
              <>
                <Pre>{this.state.error.toString()}</Pre>
                {this.state.error.stack && <Pre>{this.state.error.stack}</Pre>}
              </>
            )}
            {this.state.errorInfo && <Pre>{JSON.stringify(this.state.errorInfo, null, 2)}</Pre>}
          </BodySection>
        </Body>
      );
    }
    return <>{this.props.children}</>;
  }
}
