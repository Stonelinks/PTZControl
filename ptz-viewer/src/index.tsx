import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { initUpdateCheckInterval } from "./utils/api";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./redux";

const { LocationProvider } = require("react-location");

initUpdateCheckInterval();

const store = createStore(rootReducer, applyMiddleware(thunk));

ReactDOM.render(
  <LocationProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </LocationProvider>,
  document.getElementById("root"),
);
