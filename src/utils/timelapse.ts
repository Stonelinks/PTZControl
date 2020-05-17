import * as shell from "shelljs";
import { getConfig } from "./config";
import { takeSnapshot } from "./videoDevices";
import { writeFileAsync, listDirectory, stat } from "./files";
import { CAPTURE_FOLDER } from "../common/constants";

export const getCaptureDir = async () => {
  const c = await getConfig();
  const captureDir = `${CAPTURE_FOLDER}/${c.captureName}`;
  shell.mkdir("-p", captureDir);
  return captureDir;
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
      const captureDir = await getCaptureDir();

      await writeFileAsync(
        `${captureDir}/${c.captureName}-${nowMs}.jpg`,
        snapshot,
      );
    }
  },
};
