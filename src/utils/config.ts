import * as fs from "fs";
import { listVideoDevices } from "./videoDevices";
import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";
import { CONFIG_FILE } from "../common/constants";
import { JsonObject } from "../common/json";
import { writeJsonAsync, readJsonAsync } from "./files";
import { Application } from "express";

interface Config extends JsonObject {
  captureDevice: string;
  controlsDevice: string;
}

let config: Config | undefined;

const makeDefaultConfig = async (): Promise<Config> => {
  const devices = await listVideoDevices();
  const firstDevice = devices.length ? devices[0] : "unknown";
  return {
    captureDevice: firstDevice,
    controlsDevice: firstDevice,
  };
};

export const getConfig = async () => {
  while (!config) {
    await timeout(MILLISECONDS_IN_SECOND * 0.5);
  }
  return config;
};

export const setConfig = async <K extends keyof Config>(k: K, v: Config[K]) => {
  config[k] = v;
  await writeJsonAsync(CONFIG_FILE, config);
};

export const initConfig = async () => {
  // init a default config
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = await makeDefaultConfig();
    await writeJsonAsync(CONFIG_FILE, defaultConfig);
  }
  config = await readJsonAsync(CONFIG_FILE);
};

export const registerConfigRoutes = async (app: Application) => {
  app.get("/config/get", async (req, res) => {
    const c = await getConfig();
    res.send(JSON.stringify(c));
  });

  app.get("/config/:configKey/get", async (req, res) => {
    const configKey = decodeURIComponent(req.params.configKey) as keyof Config;
    const c = await getConfig();
    res.send(JSON.stringify(c[configKey]));
  });

  app.get("/config/:configKey/set/:configValue", async (req, res) => {
    const configKey = decodeURIComponent(req.params.configKey) as keyof Config;
    const configValue = decodeURIComponent(
      req.params.configValue,
    ) as Config[keyof Config];
    await setConfig(configKey, configValue);
    res.send(JSON.stringify(true));
  });
};
