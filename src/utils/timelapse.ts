import * as shell from "shelljs";
import { CAPTURE_FOLDER } from "../common/constants";
import { getConfig } from "./config";
import { writeFileAsync } from "./files";
import { takeSnapshot } from "./videoDevices";

export const getCaptureDir = async () => {
  const captureDir = `${CAPTURE_FOLDER}`;
  shell.mkdir("-p", captureDir);
  return captureDir;
};

export const getActiveCaptureDir = async () => {
  const captureDir = await getCaptureDir();
  const c = await getConfig();
  const activeCaptureDir = `${captureDir}/${c.captureName}`;
  shell.mkdir("-p", activeCaptureDir);
  return activeCaptureDir;
};

export const CaptureCronJob = {
  name: "capture",
  intervalMs: async () => {
    const c = await getConfig();
    return c.captureRateMs;
  },
  fn: async nowMs => {
    const c = await getConfig();
    if (c.captureEnable) {
      console.log(`${nowMs}: taking snapshot`);
      const snapshot = await takeSnapshot(c.captureDevice);
      const activeCaptureDir = await getActiveCaptureDir();

      await writeFileAsync(
        `${activeCaptureDir}/${c.captureName}-${nowMs}.jpg`,
        snapshot,
      );
    }
  },
};
