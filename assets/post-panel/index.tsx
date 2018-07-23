const { PluginSidebar, PluginSidebarMoreMenuItem } = window.wp.editPost;
const { registerPlugin } = window.wp.plugins;
const { withDispatch } = window.wp.data;
const { compose, PanelBody } = window.wp.element;
import * as React from "react";
import { getCivil } from "../util";
import { Civil } from "@joincivil/core";
import "./store";
import { ThemeProvider } from "styled-components";
import BlockchainSignPanel from "./sign";
import BlockchainPublishPanel from "./publish";

export interface BlockchainPluginProps {
  onNetworkChange(networkName: string): void;
}

class BlockchainPluginInnerComponent extends React.Component<BlockchainPluginProps> {
  public civil: Civil | undefined;
  public networkStream: any;

  constructor(props: BlockchainPluginProps) {
    super(props);
    this.civil = getCivil();
  }
  public componentDidMount(): void {
    if (this.civil) {
      this.networkStream = this.civil.networkNameStream.subscribe(this.props.onNetworkChange);
    }
  }
  public componentWillUnmount(): void {
    if (this.networkStream) {
      this.networkStream.unsubscribe();
    }
  }
  public render(): JSX.Element {
    const content = this.civil ? (
      this.props.children
    ) : (
      <h3>
        You need an in-browser Ethereum wallet. We recommend <a href="https://metamask.io/">MetaMask</a>.
      </h3>
    );
    return <>{content}</>;
  }
}

const BlockchainPluginInner = compose([
  withDispatch(
    (dispatch: any): BlockchainPluginProps => {
      const { setIsCorrectNetwork } = dispatch("civil/blockchain");
      const onNetworkChange = (networkName: string) => dispatch(setIsCorrectNetwork(networkName));
      return {
        onNetworkChange,
      };
    },
  ),
])(BlockchainPluginInnerComponent);

const CivilSidebarToggle = (
  // TODO: Style this. It's hard, because it's automatically wrapped in a button, but a poorly styled button that only looks like a button when it's active. But if we put another <Button> in here, then when active we have a button within a button. Might need to hack with custom styles or even add/remove classes from the parent button we get wrapped in. Might be improved in latest version of Gutenberg.
  <>Civil</>
);

const CivilSidebar = () => {
  let panelContent = (
    <h3>
      Please take a moment to set up your<a href="/wp-admin/admin.php?page=civil-newsroom-protocol-management">
        Civil Newsroom contract
      </a>
    </h3>
  );
  if (window.civilNamespace.newsroomAddress) {
    panelContent = (
      <BlockchainPluginInner>
        <BlockchainSignPanel />
        <BlockchainPublishPanel />
      </BlockchainPluginInner>
    );
  }
  return (
    <>
      <PluginSidebar name="civil-sidebar" title="Civil">
        <ThemeProvider theme={
          {
            primaryButtonBackground: "#0085ba",
            primaryButtonColor: "#fff",
            primaryButtonHoverBackground: "#008ec2",
            primaryButtonDisabledBackground: "#008ec2",
            primaryButtonDisabledColor: "#66c6e4",
            primaryButtonTextTransform: "none",
            secondaryButtonColor: "#555555",
            secondaryButtonBackground: "transparent",
            secondaryButtonBorder: "#cccccc",
            borderlessButtonColor: "#0085ba",
            borderlessButtonHoverColor: "#008ec2",
          }
        }>
          {panelContent}
        </ThemeProvider>
      </PluginSidebar>
      <PluginSidebarMoreMenuItem target="civil-sidebar">Civil</PluginSidebarMoreMenuItem>
    </>
  );
};

registerPlugin("civil-sidebar", {
  icon: CivilSidebarToggle,
  render: CivilSidebar,
});
