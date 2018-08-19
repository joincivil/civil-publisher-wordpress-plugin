import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { Map } from "immutable";
import reducers from "../shared/reducer";
import App from "./App";

function init(): void {
  const { newsroomAddress, newsroomTxHash } = window.civilNamespace;
  const store = createStore(
    reducers,
    {
      user: Map<string, any>({ address: newsroomAddress, txHash: newsroomTxHash }),
    },
    applyMiddleware(thunk),
  );

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("civil-newsroom-management"),
  );
}

window.onload = init;
