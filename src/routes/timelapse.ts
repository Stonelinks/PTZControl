import { Application } from "express";
import * as ffmpegPath from "ffmpeg-static";
import * as ffmpeg from "fluent-ffmpeg";
import { THUMBS_FOLDER_NAME } from "../common/constants";
import { decode } from "../common/encode";
import { MILLISECONDS_IN_MINUTE, MILLISECONDS_IN_SECOND } from "../common/time";
import {
  deleteFile,
  getChronologicalFileList,
  listDirectory,
  stat,
  writeFileAsync,
} from "../utils/files";
import { getCaptureDir } from "../utils/timelapse";

ffmpeg.setFfmpegPath(ffmpegPath);

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
        files
          .map(f => `${captureId}/${f}`)
          .filter(f => f.endsWith("gif") || f.endsWith("mp4")),
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

    const nowMs = Date.now();
    const outPath = `${captureDir}/${captureId}/out-${nowMs}.mp4`;

    const log = (s: string) => {
      console.log(s);
      res.write(`${s}\n`);
    };

    res.writeHead(200, { "Content-Type": "text/plain" });
    log("begin timelapse creation");

    const fileListPath = `/tmp/timelapse-out-${nowMs}.txt`;
    let ffmpegInstructions = "";

    const durationSeconds = `${parseInt(delayMs, 10) / MILLISECONDS_IN_SECOND}`;
    files.forEach(file => {
      ffmpegInstructions += `file '${file}'\n`;
      ffmpegInstructions += `duration ${durationSeconds}\n`;
    });

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
          res.end();
        }, MILLISECONDS_IN_MINUTE / 2);
      })
      .on("end", async () => {
        log("video created in: " + outPath);
        log("done! you should be automatically redirected");

        res.end();
        await deleteFile(fileListPath);
      })
      .save(outPath);
  });
};
