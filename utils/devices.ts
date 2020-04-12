import * as shelljs from "shelljs";

export const listVideoDevices = () => {
  return shelljs.ls(`/dev/video*`);
};
