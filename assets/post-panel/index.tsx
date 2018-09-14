const { PluginSidebar, PluginSidebarMoreMenuItem } = window.wp.editPost;
const { registerPlugin } = window.wp.plugins;
const { PanelRow } = window.wp.components;
const { withDispatch, withSelect } = window.wp.data;
const { compose } = window.wp.element;
import * as React from "react";
import { getCivil } from "../util";
import { Civil, EthAddress } from "@joincivil/core";
import { Tabs, Tab, TabComponentProps, Button, buttonSizes, CivilLogo, NorthEastArrow } from "@joincivil/components";
import "./store";
import styled, { ThemeProvider } from "styled-components";
import { theme, urls } from "../constants";
import { colors, IconWrap } from "./styles";
import BlockchainSignPanel from "./sign";
import BlockchainPublishPanel from "./publish";
import { CivilSidebarWithComposed } from "./components/CivilSidebarToggleComponent";

export interface BlockchainPluginProps {
  openTab: number;
  onNetworkChange(networkName: string): void;
  onAccountChange(address?: EthAddress): void;
  onTabChange(openTabIndex: number): void;
}

const StyledLi = styled.li`
  border-bottom: ${(props: TabComponentProps) => (props.isActive ? "3px solid #01a0d2" : "none")};
  box-sizing: border-box;
  font-family: ${props => props.theme.sansSerifFont};
  font-weight: ${(props: TabComponentProps) => (props.isActive ? "600" : "400")};
  color: #000000;
  margin-bottom: 0;
  padding: 17px 0 14px;
  text-align: center;
  width: 75px;
  cursor: ${(props: TabComponentProps) => (props.isActive ? "default" : "pointer")};

  & a {
    color: inherit;
  }
`;

const Wrapper = styled.div`
  padding: 30px 20px;
`;

const P = styled.p`
  margin-bottom: 0;
`;

const LinkButton = Button.extend`
  width: 100%;
  text-align: center;
`;

const NavHelp = styled.a`
  && {
    color: ${colors.DARK_GRAY};
  }
  svg path {
    fill: ${colors.DARK_GRAY};
  }
  text-decoration: none;

  svg {
    width: 8px;
    height: auto;
  }
`;
const LogoWrap = IconWrap.extend`
  top: 1px;
  svg {
    height: 12px;
    width: auto;
  }
`;
const navLogo = (
  <LogoWrap>
    <CivilLogo />
  </LogoWrap>
);
const navHelp = (
  <NavHelp href={`${urls.HELP}#TODO`} target="_blank">
    Help <NorthEastArrow />
  </NavHelp>
);

class BlockchainPluginInnerComponent extends React.Component<BlockchainPluginProps> {
  public civil: Civil | undefined;
  public accountStream: any;
  public networkStream: any;

  constructor(props: BlockchainPluginProps) {
    super(props);
    this.civil = getCivil();
  }
  public componentDidMount(): void {
    if (this.civil) {
      this.accountStream = this.civil.accountStream.subscribe(this.props.onAccountChange);
      this.networkStream = this.civil.networkNameStream.subscribe(this.props.onNetworkChange);
    }
  }
  public componentWillUnmount(): void {
    if (this.accountStream) {
      this.accountStream.unsubscribe();
    }
    if (this.networkStream) {
      this.networkStream.unsubscribe();
    }
  }
  public render(): JSX.Element {
    return (
      <Tabs
        activeIndex={this.props.openTab}
        onActiveTabChange={this.props.onTabChange}
        TabComponent={StyledLi}
        TabsNavBefore={navLogo}
        TabsNavAfter={navHelp}
      >
        <Tab title="Sign">
          <BlockchainSignPanel />
        </Tab>
        <Tab title="Publish">
          <BlockchainPublishPanel />
        </Tab>
      </Tabs>
    );
  }
}

const BlockchainPluginInner = compose([
  withDispatch(
    (dispatch: any): Partial<BlockchainPluginProps> => {
      const { setIsCorrectNetwork, setWeb3ProviderAddress, setOpenTab } = dispatch("civil/blockchain");
      const onAccountChange = (address?: EthAddress) => dispatch(setWeb3ProviderAddress(address));
      const onNetworkChange = (networkName: string) => dispatch(setIsCorrectNetwork(networkName));
      const onTabChange = (openTabIndex: number) => dispatch(setOpenTab(openTabIndex));
      return {
        onAccountChange,
        onNetworkChange,
        onTabChange,
      };
    },
  ),
  withSelect(
    (selectStore: any): Partial<BlockchainPluginProps> => {
      const { getTabIndex } = selectStore("civil/blockchain");
      return {
        openTab: getTabIndex(),
      };
    },
  ),
])(BlockchainPluginInnerComponent);

const CivilSidebar = () => {
  let panelContent = (
    <Wrapper>
      <PanelRow>
        <P>
          A newsroom contract has not been set up. Please got to your{" "}
          <a href="/wp-admin/admin.php?page=civil-newsroom-protocol-management">Civil Newsroom Manager</a> page to
          create a Newsroom smart contract.
        </P>
      </PanelRow>
      <PanelRow>
        <LinkButton size={buttonSizes.MEDIUM_WIDE} href="/wp-admin/admin.php?page=civil-newsroom-protocol-management">
          Newsroom Manager
        </LinkButton>
      </PanelRow>
    </Wrapper>
  );
  if (window.civilNamespace.newsroomAddress) {
    panelContent = <BlockchainPluginInner />;
  }
  return (
    <>
      <PluginSidebar name="civil-sidebar" title="Civil">
        <ThemeProvider theme={theme}>{panelContent}</ThemeProvider>
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
