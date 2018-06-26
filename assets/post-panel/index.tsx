const { Button, PanelBody, PanelRow } = window.wp.components;
const { PluginPostStatusInfo } = window.wp.editPost;
const { registerPlugin } = window.wp.plugins;
const { withDispatch } = window.wp.data;
const { compose } = window.wp.element;
import * as React from "react";
import { getCivil } from "../util";
import { setIsCorrectNetwork } from "./store/actions";
import "./store";

import BlockchainSignPanel from "./sign";
import BlockchainPublishPanel from "./publish";

export interface BlockchainPluginProps {
  onNetworkChange(): void;
}

class BlockchainPluginInnerComponent extends React.Component<BlockchainPluginProps> {
  public componentDidMount(): void {
    const civil = getCivil();
    civil.addCallbackToSetNetworkEmitter(this.props.onNetworkChange);
  }
  public componentWillUnmount(): void {
    const civil = getCivil();
    civil.removeCallbackFromSetNetworkEmitter(this.props.onNetworkChange);
  }
  public render(): JSX.Element {
    return <>{this.props.children}</>;
  }
}

const BlockchainPluginInner = compose([
  withDispatch(
    (dispatch: any): BlockchainPluginProps => {
      const onNetworkChange = () => dispatch(setIsCorrectNetwork());
      return {
        onNetworkChange,
      };
    },
  ),
])(BlockchainPluginInnerComponent);

class BlockchainPlugin extends React.Component {
  public render(): JSX.Element {
    return (
      <PluginPostStatusInfo>
        <BlockchainPluginInner>
          <BlockchainSignPanel />
          <BlockchainPublishPanel />
        </BlockchainPluginInner>
      </PluginPostStatusInfo>
    );
  }
}

registerPlugin("blockchain-publish", {
  render: () => new BlockchainPlugin({}).render(),
});
