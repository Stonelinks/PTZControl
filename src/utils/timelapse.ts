import * as shell from "shelljs";
import { CAPTURE_FOLDER } from "../common/constants";
import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";
import { getConfig } from "./config";
import { writeFileAsync } from "./files";
import {
  getOrCreateCameraDevice,
  moveAxisSpeedStart,
  moveAxisSpeedStop,
  takeSnapshot,
} from "./videoDevices";

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

export const PanCronJob = {
  name: "pan",
  intervalMs: async () => {
    const c = await getConfig();
    return c.panStepRateMs;
  },
  fn: async () => {
    const c = await getConfig();
    if (c.panStepEnable) {
      const { cam } = getOrCreateCameraDevice(c.controlsDevice);
      moveAxisSpeedStart(cam, "pan", c.panStepDirection);
      await timeout(0.2 * MILLISECONDS_IN_SECOND);
      moveAxisSpeedStop(cam, "pan");
    }
  },
};

export const TiltCronJob = {
  name: "tilt",
  intervalMs: async () => {
    const c = await getConfig();
    return c.tiltStepRateMs;
  },
  fn: async () => {
    const c = await getConfig();
    if (c.tiltStepEnable) {
      const { cam } = getOrCreateCameraDevice(c.controlsDevice);
      moveAxisSpeedStart(cam, "tilt", c.tiltStepDirection);
      await timeout(0.2 * MILLISECONDS_IN_SECOND);
      moveAxisSpeedStop(cam, "tilt");
    }
  },
};
