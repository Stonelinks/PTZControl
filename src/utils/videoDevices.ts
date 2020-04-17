import { Application } from "express";
import { decode } from "../common/encode";

// @ts-ignore
const v4l2camera = require("@hypersolution/v4l2camera");
// @ts-ignore
const NodeWebcam = require("node-webcam");

export const listVideoDevices = async (): Promise<string[]> => {
  const Webcam = NodeWebcam.create({});
  return new Promise(res => {
    Webcam.list(l => {
      res(l);
    });
  });
};

const v4lDevices = {};

export const getOrCreateV4LCameraDevice = (deviceId: string) => {
  if (v4lDevices[deviceId]) {
    return v4lDevices[deviceId];
  }

  // @ts-ignore
  const cam = new v4l2camera.Camera(deviceId);
  v4lDevices[deviceId] = cam;
  return cam;
};

const nodeWebcamDevices = {};

export const getOrCreateNodeWebcamDevice = (deviceId: string) => {
  if (nodeWebcamDevices[deviceId]) {
    return nodeWebcamDevices[deviceId];
  }

  const opts = {
    device: deviceId,
    saveShots: true,

    callbackReturn: "buffer",
  };

  // @ts-ignore
  const cam = NodeWebcam.create(opts);
  nodeWebcamDevices[deviceId] = cam;
  return cam;
};

export const takeSnapshot = async (deviceId: string): Promise<string[]> => {
  const cam = getOrCreateNodeWebcamDevice(deviceId);
  return new Promise(res => {
    cam.capture("tmp.jpg", (err, data) => {
      res(data);
    });
  });
};

export const registerVideoDeviceRoutes = async (app: Application) => {
  app.get("/video-device/list", async (req, res) => {
    const l = await listVideoDevices();
    // JSON.stringify(l.map(deviceFilename => deviceFilename.split("/").pop())),
    res.send(JSON.stringify(l));
  });

  app.get("/video-device/:deviceId/snapshot.jpg", async (req, res) => {
    const deviceId = decode(req.params.deviceId);
    const data = await takeSnapshot(deviceId);
    res.send(data);
  });

  app.get("/video-device/:deviceId/formats", (req, res) => {
    const deviceId = decode(req.params.deviceId);
    const cam = getOrCreateV4LCameraDevice(deviceId);
    res.send(JSON.stringify(cam.formats));
  });

  app.get("/video-device/:deviceId/controls", (req, res) => {
    const deviceId = decode(req.params.deviceId);
    const cam = getOrCreateV4LCameraDevice(deviceId);
    res.send(JSON.stringify(cam.controls));
  });
};
