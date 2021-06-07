import * as ffmpegPath from "ffmpeg-static";
import * as ffmpeg from "fluent-ffmpeg";
import * as shell from "shelljs";
import { CAPTURE_FOLDER, DEVICE_ID_NONE } from "../common/constants";
import {
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_SECOND,
  timeout,
} from "../common/time";
import { slugifyDeviceId } from "../common/types";
import {
  getLastUserDisconnectedMs,
  isStreamingVideo,
} from "../routes/videoDevices";
import { deleteFile } from "../utils/files";
import { cachedDownsize } from "../utils/images";
import { getConfig } from "./config";
import { DEFAULT_INTERVAL_MS } from "./cron";
import { getChronologicalFileList, writeFileAsync } from "./files";
import { fileIsGifOrMovie, fileIsImage } from "./images";
import {
  getOrCreateCameraDevice,
  moveAxisSpeedStart,
  moveAxisSpeedStop,
  stop,
  takeSnapshot,
} from "./videoDevices";

ffmpeg.setFfmpegPath(ffmpegPath);

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
      console.log(`${nowMs}: taking snapshots for ${c.captureDevices}`);

      // tslint:disable-next-line:prefer-for-of
      for (let index = 0; index < c.captureDevices.length; index++) {
        const deviceId = c.captureDevices[index];
        if (deviceId !== DEVICE_ID_NONE) {
          const snapshot = await takeSnapshot(deviceId);
          const activeCaptureDirForDeviceId = await getActiveCaptureDir();

          await writeFileAsync(
            `${activeCaptureDirForDeviceId}/${slugifyDeviceId(deviceId)}-${
              c.captureName
            }-${nowMs}.jpg`,
            snapshot,
          );
        }
      }
    }
  },
};

export const CameraStreamTimeoutCronJob = {
  name: "camera stream timeout",
  intervalMs: 2 * MILLISECONDS_IN_MINUTE,
  fn: async () => {
    const c = await getConfig();
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < c.captureDevices.length; index++) {
      const deviceId = c.captureDevices[index];
      if (
        !(
          c.captureEnable ||
          isStreamingVideo(deviceId) ||
          getLastUserDisconnectedMs(deviceId) < 5 * MILLISECONDS_IN_MINUTE
        )
      ) {
        stop(deviceId);
      }
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

interface MakeTimelapseVideoOpts {
  nowMs: number;
  files: string[];
  outPath: string;
  delayMs: string;
  log: (s: string) => void;
  end: () => void;
}

export const makeTimelapseVideo = async ({
  nowMs,
  files,
  log,
  end,
  outPath,
  delayMs,
}: MakeTimelapseVideoOpts) => {
  const delaySeconds = `${parseInt(delayMs, 10) / MILLISECONDS_IN_SECOND}`;
  const fileListPath = `/tmp/timelapse-out-${nowMs}.txt`;
  let ffmpegInstructions = "";

  log(`about to resize ${files.length} images...`);

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const downsizePath = await cachedDownsize(file, 0.5);
    log(`(${i + 1}/${files.length}) downsized ${file}`);
    ffmpegInstructions += `file '${downsizePath}'\n`;
    ffmpegInstructions += `duration ${delaySeconds}\n`;
  }

  // due to a quirk, the last file needs to be specified twice (see concat demuxer here https://trac.ffmpeg.org/wiki/Slideshow)
  ffmpegInstructions += `file '${files[files.length - 1]}'\n`;

  await writeFileAsync(fileListPath, ffmpegInstructions);
  log(`made a list of ${files.length} images to ${fileListPath}`);

  ffmpeg()
    .addInput(fileListPath)
    .inputOptions(["-f", "concat", "-safe", "0"])
    .videoCodec("libx264")
    .noAudio()
    .on("start", command => {
      log("ffmpeg process started: " + command);
    })
    .on("progress", progress => {
      log("processing: " + parseInt(progress.percent, 10) + "% done");
    })
    .on("error", (err, stdout, stderr) => {
      log("Error: " + err);
      log("ffmpeg stderr: " + stderr);

      setTimeout(() => {
        end();
      }, MILLISECONDS_IN_MINUTE / 2);
    })
    .on("end", async () => {
      log("video created in: " + outPath);
      log("done! you should be automatically redirected");
      await deleteFile(fileListPath);
      end();
    })
    .save(outPath);
};
