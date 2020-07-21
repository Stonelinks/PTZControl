import * as path from "path";

const formatPath = (s: string) =>
  process.env.BASE_PATH
    ? `${(process as any).env.BASE_PATH}/${s}`
    : path.resolve(s);

export const CACHE_FOLDER = formatPath(".cache");
export const CAPTURE_FOLDER = formatPath("captures");
export const THUMBS_FOLDER_NAME = ".thumbs";
export const VIEWER_FOLDER = formatPath("./ptz-viewer/build");
export const SERVER_PORT =
  parseInt((process as any).env.SERVER_PORT, 10) || 4001;
export const CONFIG_FILE = formatPath("config.json");
