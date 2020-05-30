import { Application } from "express";
import { THUMBS_FOLDER_NAME } from "../common/constants";
import { decode } from "../common/encode";
import { getConfig } from "../utils/config";
import { listDirectory, stat } from "../utils/files";
import { getCaptureDir } from "../utils/timelapse";

export const registerTimelapseRoutes = async (app: Application) => {
  app.get("/timelapse/capture/list", async (req, res) => {
    const captureDir = await getCaptureDir();
    let captureDirs = await listDirectory(captureDir);
    captureDirs = captureDirs.filter(f => f !== THUMBS_FOLDER_NAME);

    const ret = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < captureDirs.length; i++) {
      const c = captureDirs[i];
      const files = await listDirectory(`${captureDir}/${c}`);

      let numImageFiles = 0;
      let startTimeMs = Infinity;
      let endTimeMs = 0;

      // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < files.length; j++) {
        const f = files[j];

        const s = await stat(`${captureDir}/${c}/${f}`);
        if (s.isFile()) {
          const { birthtimeMs } = s;
          if (birthtimeMs < startTimeMs) {
            startTimeMs = birthtimeMs;
          }
          if (birthtimeMs > endTimeMs) {
            endTimeMs = birthtimeMs;
          }
        }

        if (f.split(".").pop() === "jpg") {
          numImageFiles++;
        }
      }

      ret.push({
        name: c,
        numFiles: numImageFiles,
        startTimeMs,
        endTimeMs,
      });
    }

    res.send(JSON.stringify(ret));
  });

  app.get("/timelapse/capture/:captureId/list", async (req, res) => {
    const captureDir = await getCaptureDir();
    const captureId = decode(req.params.captureId);
    const files = await listDirectory(`${captureDir}/${captureId}`);
    const stats = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const s = await stat(`${captureDir}/${captureId}/${file}`);
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
