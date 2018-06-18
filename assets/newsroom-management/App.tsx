const { apiRequest } = window.wp;
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Newsroom } from "@joincivil/newsroom-manager";
import { Civil, EthAddress } from "@joincivil/core";
import { ManagerState } from "./reducer";
import { addAddress } from "./actions";
import { getNewsroomAddress } from "../util";
import { apiNamespace, siteOptionKeys } from "../constants";

export interface AppProps {
  address?: EthAddress;
}

class App extends React.Component<AppProps & DispatchProp<any>> {
  public civil: Civil;

  constructor(props: AppProps & DispatchProp<any>) {
    super(props);
    this.civil = new Civil();
  }

  public render(): JSX.Element {
    return (
      <Newsroom
        civil={this.civil}
        address={this.props.address}
        onNewsroomCreated={this.onNewsroomCreated}
        getNameForAddress={this.getNameForAddress}
      />
    );
  }

  private onNewsroomCreated = async (address: EthAddress) => {
    const settings = await apiRequest({
      path: "/wp/v2/settings",
      method: "PUT",
      data: {
        [siteOptionKeys.NEWSROOM_ADDRESS]: address,
      },
    });
    this.props.dispatch(addAddress(settings[siteOptionKeys.NEWSROOM_ADDRESS]));
  };

  private getNameForAddress = async (address: EthAddress) => {
    try {
      const user = await apiRequest({
        path: apiNamespace + `user-by-eth-address/${address}`,
      });
      return user.display_name;
    } catch (e) {
      return "Could not find a user with that address.";
    }
  };
}

const mapStateToProps = (state: ManagerState): AppProps => {
  const { user } = state;
  const address = user.get("address");
  return {
    address,
  };
};

export default connect(mapStateToProps)(App);
