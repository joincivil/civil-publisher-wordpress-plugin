import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { Map } from "immutable";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";
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
    <ErrorBoundary section="content-viewer">
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>,
    document.getElementById("civil-newsroom-content-viewer"),
  );
}

window.onload = init;
