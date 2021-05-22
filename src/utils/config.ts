import * as fs from "fs";
import { CONFIG_FILE } from "../common/constants";
import {
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_SECOND,
  timeout,
} from "../common/time";
import { AnyConfig, Config, ConfigV0, ConfigV1 } from "../common/types";
import { readJsonAsync, writeJsonAsync } from "./files";
import { listVideoDevices } from "./videoDevices";
import * as _ from "lodash";

let config: Config | undefined;

const makeDefaultConfig = async (): Promise<Config> => {
  const devices = await listVideoDevices();
  const firstDevice = devices.length ? devices[0] : "unknown";
  return {
    version: 1,
    configs: [
      {
        captureDevice: firstDevice,
        captureName: "capture",
        captureEnable: false,
        captureRateMs: MILLISECONDS_IN_MINUTE,
      },
    ],
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

const migrateConfigV0_to_V1 = (c0: ConfigV0): ConfigV1 => {
  return {
    version: 1,
    configs: [c0],
  };
};

const migrateConfig = (c: AnyConfig): ConfigV1 => {
  if (c?.version === 1) {
    return c as ConfigV1;
  } else {
    return migrateConfigV0_to_V1(c as ConfigV0);
  }
};

export const initConfig = async () => {
  // init a default config if it doesn't exist
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = await makeDefaultConfig();
    await saveConfig(defaultConfig);
  }

  // read config
  config = await readJsonAsync(CONFIG_FILE);

  // migrate
  const migratedConfig = migrateConfig(config);

  // save if its different
  if (!_.isEqual(migratedConfig, config)) {
    await saveConfig(config);
    config = migratedConfig;
  }
};
