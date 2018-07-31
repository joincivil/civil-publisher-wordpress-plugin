import * as React from "react";
import styled from "styled-components";
const { PluginPostPublishPanel } = window.wp.editPost;
const { withDispatch } = window.wp.data;
const { compose } = window.wp.element;
const { Button } = window.wp.components;
import { CivilLogo } from "@joincivil/components";

export interface CivilPostPublishPanelProps {
  openCivilSidebar(): void;
}

// TODO Is this a common usage? Should we put in @joincivil/components?
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
      <PluginPostPublishPanel
        title="Civil Newsroom"
        initialOpen={ true }
      >
        <LogoWrapOuter><LogoWrapInner><CivilLogo /></LogoWrapInner></LogoWrapOuter>
        <p>You can now sign and index your post to your newsroom smart contract on the blockchain.</p>
        <Button isPrimary={true} onClick={this.props.openCivilSidebar}>Open Civil</Button>
      </PluginPostPublishPanel>
    );
  }
}

export const CivilPostPublishPanel = compose([
  withDispatch(
    (dispatch: any): CivilPostPublishPanelProps => {
      const { openGeneralSidebar, closePublishSidebar } = dispatch('core/edit-post')

      function openCivilSidebar() {
        openGeneralSidebar("civil-sidebar/civil-sidebar");
        closePublishSidebar();
      }

      return {
        openCivilSidebar
      };
    },
  ),
])(CivilPostPublishPanelComponent);
