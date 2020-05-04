import * as shell from "shelljs";
import { getConfig } from "./config";
import { takeSnapshot } from "./videoDevices";
import { writeFileAsync, listDirectory, stat } from "./files";
import { CAPTURE_FOLDER } from "../common/constants";
import { Application } from "express";

const getCaptureDir = async () => {
  const c = await getConfig();
  const captureDir = `${CAPTURE_FOLDER}/${c.captureName}`;
  shell.mkdir("-p", captureDir);
  return captureDir;
};

export const getCaptureCronJob = async () => {
  const c = await getConfig();
  return {
    name: "capture",
    intervalMs: c.captureRateMs,
    fn: async nowMs => {
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
};

export const registerTimelapseRoutes = async (app: Application) => {
  app.get("/timelapse/capture/list", async (req, res) => {
    const captureDir = await getCaptureDir();
    const files = await listDirectory(captureDir);
    // console.log("files", files);
    const stats = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const s = await stat(`${captureDir}/${file}`);
      if (s.isFile()) {
        stats.push({
          name: file,
          ...s,
        });
      }
    }

    // sort in chronological order
    stats.sort((a, b) => {
      return a.birthtimeMs > b.birthtimeMs
        ? 1
        : b.birthtimeMs > a.birthtimeMs
        ? -1
        : 0;
    });

    const c = await getConfig();

    res.send(JSON.stringify(stats.map(s => `${c.captureName}/${s.name}`)));
  });
};
