import * as shell from "shelljs";
import { CAPTURE_FOLDER } from "../common/constants";
import {
  MILLISECONDS_IN_SECOND,
  timeout,
  MILLISECONDS_IN_MINUTE,
} from "../common/time";
import { getConfig } from "./config";
import { getChronologicalFileList, writeFileAsync } from "./files";
import {
  stop,
  getOrCreateCameraDevice,
  moveAxisSpeedStart,
  moveAxisSpeedStop,
  takeSnapshot,
} from "./videoDevices";
import { DEFAULT_INTERVAL_MS } from "./cron";
import {
  isStreamingVideo,
  getLastUserDisconnectedMs,
} from "../routes/videoDevices";
import { fileIsGifOrMovie, fileIsImage } from "./images";

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

export const getChronologicalTimelapseImageList = async (dir: string) => {
  const files = await getChronologicalFileList(dir);
  return files.filter(fileIsImage);
};

export const getChronologicalResultsList = async (dir: string) => {
  const files = await getChronologicalFileList(dir);
  return files.filter(fileIsGifOrMovie);
};

export const CaptureCronJob = {
  name: "capture",
  intervalMs: async () => {
    const c = await getConfig();
    return c.captureEnable ? c.captureRateMs : DEFAULT_INTERVAL_MS;
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

export const CameraStreamTimeoutCronJob = {
  name: "camera stream timeout",
  intervalMs: 2 * MILLISECONDS_IN_MINUTE,
  fn: async () => {
    const c = await getConfig();
    if (
      !(
        c.captureEnable ||
        isStreamingVideo() ||
        getLastUserDisconnectedMs() < 5 * MILLISECONDS_IN_MINUTE
      )
    ) {
      stop(c.captureDevice);
    }
  },
};

export const PanCronJob = {
  name: "pan",
  intervalMs: async () => {
    const c = await getConfig();
    return c.panStepEnable ? c.panStepRateMs : DEFAULT_INTERVAL_MS;
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
    return c.tiltStepEnable ? c.tiltStepRateMs : DEFAULT_INTERVAL_MS;
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
