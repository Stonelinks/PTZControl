import * as fs from "fs";
import { Application } from "express";
import { decode } from "../common/encode";

// tslint:disable-next-line:no-var-requires
const v4l2camera = require("v4l2camera");

export const listVideoDevices = async (): Promise<string[]> => {
  return new Promise(res => {
    const reg = /^video/i;
    const dir = "/dev/";

    fs.readdir(dir, (err, data) => {
      if (err) {
        throw err;
      }

      const cams = [];
      const dl = data.length;

      for (let i = 0; i < dl; i++) {
        const camPath = data[i];

        if (camPath.match(reg)) {
          cams.push(dir + camPath);
        }
      }

      res(cams);
    });
  });
};

const cameraDevices = {};
export const getOrCreateCameraDevice = (deviceId: string) => {
  if (cameraDevices[deviceId]) {
    return cameraDevices[deviceId];
  }

  const cam = new v4l2camera.Camera(deviceId);
  cameraDevices[deviceId] = cam;
  return cam;
};

export const takeSnapshot = async (deviceId: string): Promise<string[]> => {
  const cam = getOrCreateCameraDevice(deviceId);
  return new Promise(res => {
    // if (cam.configGet().formatName !== "MJPG") {
    //   console.log("NOTICE: MJPG camera required");
    //   process.exit(1);
    // }
    cam.start();
    cam.capture(success => {
      const frame = cam.frameRaw();
      res(new Buffer(frame));
      cam.stop(() => {});
    });
  });
};

export const registerVideoDeviceRoutes = async (app: Application) => {
  app.get("/video-device/list", async (req, res) => {
    const l = await listVideoDevices();
    res.send(JSON.stringify(l));
  });

  app.get("/video-device/:deviceId/snapshot.jpg", async (req, res) => {
    const deviceId = decode(req.params.deviceId);
    const data = await takeSnapshot(deviceId);
    res.send(data);
  });

  app.get("/video-device/:deviceId/formats", (req, res) => {
    const deviceId = decode(req.params.deviceId);
    const cam = getOrCreateCameraDevice(deviceId);
    res.send(JSON.stringify(cam.formats));
  });

  app.get("/video-device/:deviceId/controls", (req, res) => {
    const deviceId = decode(req.params.deviceId);
    const cam = getOrCreateCameraDevice(deviceId);
    res.send(JSON.stringify(cam.controls));
  });
};
