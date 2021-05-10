import React from "react";
import { ENABLE_PTZ } from "../common/constants";

const RenderIfPtzEnabled = <P extends object>(C: React.ComponentType<P>) => (
  props: P,
) => (ENABLE_PTZ ? <C {...props} /> : null);

export default RenderIfPtzEnabled;
