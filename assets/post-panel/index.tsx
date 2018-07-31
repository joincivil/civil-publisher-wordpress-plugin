const { PluginSidebar, PluginSidebarMoreMenuItem } = window.wp.editPost;
const { registerPlugin } = window.wp.plugins;
const { withDispatch, withSelect } = window.wp.data;
const { compose, PanelBody } = window.wp.element;
import * as React from "react";
import * as ReactDom from "react-dom";
import { getCivil } from "../util";
import { Civil } from "@joincivil/core";
import { Tabs, Tab, TabComponentProps } from "@joincivil/components";
import "./store";
import styled, { ThemeProvider } from "styled-components";
import BlockchainSignPanel from "./sign";
import BlockchainPublishPanel from "./publish";
import { CivilSidebarWithComposed } from "./components/CivilSidebarToggleComponent";

export interface BlockchainPluginProps {
  onNetworkChange(networkName: string): void;
}

const StyledLi = styled.li`
  border-bottom: ${(props: TabComponentProps) => (props.isActive ? "3px solid #01a0d2" : "none")};
  box-sizing: border-box;
  font-family: ${props => props.theme.sansSerifFont};
  font-weight: 600;
  margin-bottom: 0;
  padding: 15px 0 18px;
  text-align: center;
  width: 75px;

  & a {
    color: inherit;
  }
`;

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
        <Tabs TabComponent={StyledLi}>
        <Tab title="Sign">
          <BlockchainSignPanel />
        </Tab>
        <Tab title="index">
          <BlockchainPublishPanel />
        </Tab>
        </Tabs>
      </BlockchainPluginInner>
    );
  }
  return (
    <>
      <PluginSidebar name="civil-sidebar" title="Civil">
        <ThemeProvider
          theme={{
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
            linkColor: "#0085ba",
            linkColorHover: "#008ec2",
            sansSerifFont: `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif`,
          }}
        >
          {panelContent}
        </ThemeProvider>
      </PluginSidebar>
      <PluginSidebarMoreMenuItem target="civil-sidebar">Civil</PluginSidebarMoreMenuItem>
    </>
  );
};

const CivilSidebarToggle = (
  <>
    <CivilSidebarWithComposed />
  </>
);

registerPlugin("civil-sidebar", {
  icon: CivilSidebarToggle,
  render: CivilSidebar,
});
