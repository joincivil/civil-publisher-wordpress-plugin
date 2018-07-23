const { registerStore } = window.wp.data;
const { combineReducers } = window.wp.data;

import { REDUCER_KEY } from "./constants";
import * as reducers from "./reducers";
import * as actions from "./actions";
import * as selectors from "./selectors";
import * as resolvers from "./resolvers";

const store = registerStore(REDUCER_KEY, {
  reducer: combineReducers(reducers),
  actions,
  selectors,
  resolvers,
});

export default store;
