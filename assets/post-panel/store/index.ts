const { registerStore } = window.wp.data;

import { REDUCER_KEY } from "./constants";
import reducer from "./reducers";
import * as actions from "./actions";
import * as selectors from "./selectors";
import * as resolvers from "./resolvers";

const store = registerStore(REDUCER_KEY, {
  reducer,
  actions,
  selectors,
  resolvers,
});

export default store;
