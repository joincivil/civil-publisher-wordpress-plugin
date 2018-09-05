import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { ContentViewer } from "@joincivil/newsroom-manager";
import { EthAddress } from "@joincivil/core";
import { ManagerState } from "../shared/reducer";
import { Newsroom } from "@joincivil/core/build/src/contracts/newsroom";
import { getCivil } from "../util";

export interface AppProps {
  address: EthAddress;
}

export interface AppState {
  newsroom: Newsroom | null;
}

class App extends React.Component<AppProps & DispatchProp<any>, AppState> {
  constructor(props: AppProps & DispatchProp<any>) {
    super(props);
    this.state = {
      newsroom: null,
    };
  }
  public async componentDidMount(): Promise<void> {
    const civil = getCivil();
    const newsroom = await civil!.newsroomAtUntrusted(this.props.address);
    this.setState({ newsroom });
  }
  public render(): JSX.Element {
    if (this.state.newsroom) {
      return <ContentViewer newsroom={this.state.newsroom} />;
    } else {
      return <div>no newsroom</div>;
    }
  }
}

const mapStateToProps = (state: ManagerState): AppProps => {
  const { user } = state;
  const address = user.get("address");
  return {
    address,
  };
};

export default connect(mapStateToProps)(App);
