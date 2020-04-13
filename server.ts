import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { SERVER_PORT, VIEWER_FOLDER } from "./utils/common";
import cron from "./utils/cron";
import {
  listVideoDevices,
  getOrCreateV4LCameraDevice,
  takeSnapshot,
} from "./utils/videoDevices";

// @ts-ignore
const NodeWebcam = require("node-webcam");

const app = express();

app.use(express.static(VIEWER_FOLDER));

app.use(cors());

app.use(
  bodyParser.json({
    limit: "1gb", // heaven help us if we ever get more than a gig of JSON
  }),
);

app.get("/ping", (req, res) => {
  res.send(JSON.stringify({ pong: "pong" }));
});

// Clients poll this, so when the server restarts it'll restart clients
let shouldRestart = true;
app.get("/update-apps", (req, res) => {
  res.send(JSON.stringify({ shouldRestart }));
  shouldRestart = false;
});

app.get("/list-video-devices", async (req, res) => {
  const l = await listVideoDevices();
  res.send(
    JSON.stringify(l.map(deviceFilename => deviceFilename.split("/").pop())),
  );
});

app.get("/video-device/:deviceId/snapshot.jpg", async (req, res) => {
  const deviceId = req.params.deviceId;
  const data = await takeSnapshot(deviceId);
  res.send(data);
});

app.get("/video-device/:deviceId/formats", (req, res) => {
  const deviceId = req.params.deviceId;
  const cam = getOrCreateV4LCameraDevice(deviceId);
  res.send(JSON.stringify(cam.formats));
});

app.get("/video-device/:deviceId/controls", (req, res) => {
  const deviceId = req.params.deviceId;
  const cam = getOrCreateV4LCameraDevice(deviceId);
  res.send(JSON.stringify(cam.controls));
});

app.get("*", (req, res) => {
  res.sendFile(`${VIEWER_FOLDER}/index.html`);
});

(async () => {
  try {
    // await init();
  } catch (e) {
    console.error(e);
  } finally {
    // start the server
    app.listen(SERVER_PORT, err => {
      if (err) {
        return console.log("something bad happened", err);
      }

      console.log(`server listening on ${SERVER_PORT}`);
    });
  }

  cron.start();
})();
