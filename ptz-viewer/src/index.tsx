import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { initUpdateCheckInterval } from "./utils/api";

initUpdateCheckInterval();

ReactDOM.render(<App />, document.getElementById("root"));
