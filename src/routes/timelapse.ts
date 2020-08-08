import * as sharp from "sharp";
import { Application } from "express";
import { THUMBS_FOLDER_NAME } from "../common/constants";
import { decode } from "../common/encode";
import { listDirectory, stat, getChronologicalFileList } from "../utils/files";
import { getCaptureDir } from "../utils/timelapse";
import * as GifEncoder from "gif-encoder";
import * as fs from "fs";
import { getSize } from "../utils/images";

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
    const files = await getChronologicalFileList(`${captureDir}/${captureId}`);
    res.send(
      JSON.stringify(
        files.map(f => `${captureId}/${f}`).filter(f => f.endsWith("jpg")),
      ),
    );
  });

  app.get("/timelapse/capture/:captureId/listResults", async (req, res) => {
    const captureDir = await getCaptureDir();
    const captureId = decode(req.params.captureId);
    const files = await getChronologicalFileList(`${captureDir}/${captureId}`);
    res.send(
      JSON.stringify(
        files.map(f => `${captureId}/${f}`).filter(f => f.endsWith("gif")),
      ),
    );
  });

  app.get("/timelapse/capture/:captureId/create/:delayMs", async (req, res) => {
    const captureDir = await getCaptureDir();
    const captureId = decode(req.params.captureId);
    const delayMs = decode(req.params.delayMs);
    let files = await getChronologicalFileList(`${captureDir}/${captureId}`);
    files = files
      .map(f => `${captureDir}/${captureId}/${f}`)
      .filter(f => f.endsWith("jpg"));

    // let done = false;
    // req.on("close", () => {
    //   console.log("aborted");
    //   done = true;
    // });

    const nowMs = Date.now();
    const outputFile = fs.createWriteStream(
      `${captureDir}/${captureId}/out-${nowMs}.gif`,
    );
    const { width, height } = getSize(files[0]);
    const gif = new GifEncoder(width, height);
    gif.pipe(outputFile);
    gif.setDelay(delayMs);
    gif.setQuality(100);
    gif.setRepeat(0);
    gif.writeHeader();

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const msg = `(${parseInt(
        (i / files.length) * 100 + "",
        10,
      )}%) adding frame ${f}`;
      console.log(msg);
      res.write(msg + "\n");

      const rgba = await sharp(f)
        .ensureAlpha()
        .raw()
        .toBuffer();

      gif.addFrame(rgba);

      // if (done) {
      //   gif.finish();
      //   res.write("aborted");
      //   res.end();
      //   return;
      // }
    }

    gif.finish();
    res.write("done! you should be automatically redirected");
    res.end();
  });
};
