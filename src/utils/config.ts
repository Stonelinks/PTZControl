import * as fs from "fs";
import { listVideoDevices } from "./videoDevices";
import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";
import { CONFIG_FILE } from "../common/constants";
import { writeJsonAsync, readJsonAsync } from "./files";
import { Application } from "express";
import { decode } from "../common/encode";
import { Config } from "../common/types";
import { isNumeric } from "../common/number";

let config: Config | undefined;

const makeDefaultConfig = async (): Promise<Config> => {
  const devices = await listVideoDevices();
  const firstDevice = devices.length ? devices[0] : "unknown";
  return {
    captureDevice: firstDevice,
    controlsDevice: firstDevice,

    captureName: "capture",
    captureEnable: false,
    captureRateMs: 5 * MILLISECONDS_IN_SECOND,
  };
};

export const getConfig = async () => {
  while (!config) {
    await timeout(MILLISECONDS_IN_SECOND * 0.5);
  }
  return config;
};

export const setConfigValue = async <K extends keyof Config>(
  k: K,
  v: Config[K],
) => {
  config[k] = v;
  await saveConfig();
};

const saveConfig = async (c?: Config) => {
  if (!c) {
    c = config;
  }

  console.log("writing config", c);
  await writeJsonAsync(CONFIG_FILE, c);
};

export const initConfig = async () => {
  // init a default config
  const defaultConfig = await makeDefaultConfig();
  if (!fs.existsSync(CONFIG_FILE)) {
    await saveConfig(defaultConfig);
  }
  config = await readJsonAsync(CONFIG_FILE);

  let dirty = false;
  for (const key in defaultConfig) {
    if (defaultConfig.hasOwnProperty(key)) {
      const defaultValue = defaultConfig[key];
      if (!config.hasOwnProperty(key)) {
        dirty = true;
        config[key] = defaultValue;
      }
    }
  }
  if (dirty) {
    await saveConfig(config);
  }
};
