import * as React from "react";
const { PluginPostPublishPanel } = window.wp.editPost;
const { withDispatch } = window.wp.data;
const { compose } = window.wp.element;
const { Button } = window.wp.components;

export interface CivilPostPublishPanelProps {
  openCivilSidebar(): void;
}

export class CivilPostPublishPanelComponent extends React.Component<CivilPostPublishPanelProps> {

  public render(): JSX.Element {
    return (
      <PluginPostPublishPanel
        title="Civil Newsroom"
        initialOpen={ true }
      >
        <p>You can now sign and index your post to your newsroom smart contract on the blockchain.</p>
        <Button isPrimary={true} onClick={this.props.openCivilSidebar}>Open Civil Tools</Button>
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
