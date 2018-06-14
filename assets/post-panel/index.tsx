const { Button, PanelBody, PanelRow } = window.wp.components;
const { PluginPostStatusInfo } = window.wp.editPost;
const { registerPlugin } = window.wp.plugins;
import * as React from "react";
import "./store";

import BlockchainSignPanel from "./sign";
import BlockchainPublishPanel from "./publish";

interface BlockchainPluginState {}
interface BlockchainPluginProps {}

class BlockchainPlugin extends React.Component<BlockchainPluginProps, BlockchainPluginState> {
  constructor(props: BlockchainPluginProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <PluginPostStatusInfo>
        <BlockchainSignPanel />
        <BlockchainPublishPanel />
      </PluginPostStatusInfo>
    );
  }
}

registerPlugin("blockchain-publish", {
  render: () => new BlockchainPlugin({}).render(),
});
