import { Application } from "express";
import { listDirectory, stat } from "../utils/files";
import { getConfig } from "../utils/config";
import { getCaptureDir } from "../utils/timelapse";

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
