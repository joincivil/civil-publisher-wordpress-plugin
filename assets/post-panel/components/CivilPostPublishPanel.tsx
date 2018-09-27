import * as React from "react";
import styled from "styled-components";
import { DispatchType } from "../../../typings/gutenberg";
const { PluginPostPublishPanel } = window.wp.editPost;
const { withDispatch } = window.wp.data;
const { compose } = window.wp.compose;
const { Button } = window.wp.components;
import { CivilLogo } from "@joincivil/components";

export interface CivilPostPublishPanelProps {
  openCivilSidebar(): void;
}

const LogoWrapOuter = styled.div`
  display: table;
  width: 100px;
  height: 100px;
  background: #000;
`;
const LogoWrapInner = styled.div`
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  top: 2px;
  position: relative;

  svg g {
    fill: #fff;
  }
`;

export class CivilPostPublishPanelComponent extends React.Component<CivilPostPublishPanelProps> {
  public render(): JSX.Element {
    return (
      <PluginPostPublishPanel title="Civil Newsroom" initialOpen={true}>
        <LogoWrapOuter>
          <LogoWrapInner>
            <CivilLogo />
          </LogoWrapInner>
        </LogoWrapOuter>
        <p>
          Your post is live on your website. You can now sign, publish, and archive your post to your newsroom smart
          contract on the blockchain.
        </p>
        <Button isPrimary={true} onClick={this.props.openCivilSidebar}>
          Open Civil Panel
        </Button>
      </PluginPostPublishPanel>
    );
  }
}

export const CivilPostPublishPanel = compose([
  withDispatch(
    (dispatch: DispatchType): CivilPostPublishPanelProps => {
      const { openGeneralSidebar, closePublishSidebar } = dispatch("core/edit-post");

      function openCivilSidebar(): void {
        openGeneralSidebar("civil-sidebar/civil-sidebar");
        closePublishSidebar();
      }

      return {
        openCivilSidebar,
      };
    },
  ),
])(CivilPostPublishPanelComponent);
