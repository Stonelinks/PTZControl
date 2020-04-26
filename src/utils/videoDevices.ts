import * as fs from "fs";
import { Application } from "express";
import { decode } from "../common/encode";
import { timeout } from "../common/time";
import { EventEmitter } from "events";

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

interface CameraDeviceState {
  cam: any;
  emitter: EventEmitter;
  isOn: boolean;
  latestFrame?: Buffer;
}

const cameraDevices: Record<string, CameraDeviceState> = {};
export const getOrCreateCameraDevice = (
  deviceId: string,
): CameraDeviceState => {
  if (cameraDevices[deviceId]) {
    return cameraDevices[deviceId];
  }

  const cam = new v4l2camera.Camera(deviceId);
  const r = { cam, isOn: false, emitter: new EventEmitter() };
  cameraDevices[deviceId] = r;
  return r;
};

export const start = async (deviceId: string): Promise<void> => {
  const { cam, isOn } = getOrCreateCameraDevice(deviceId);
  if (isOn) {
    return Promise.resolve();
  }
  return new Promise(res => {
    cam.start();
    cameraDevices[deviceId].isOn = true;
    res();

    const captureOnce = () => {
      cam.capture(success => {
        const frame = cam.frameRaw();
        const frameBuffer = new Buffer(frame);
        cameraDevices[deviceId].latestFrame = frameBuffer;
        cameraDevices[deviceId].emitter.emit("frame", frameBuffer);

        if (cameraDevices[deviceId].isOn) {
          setTimeout(captureOnce, 50);
        } else {
          cam.stop(() => {
            res();
          });
        }
      });
    };
    captureOnce();
  });
};

export const stop = async (deviceId: string) => {
  const { isOn } = getOrCreateCameraDevice(deviceId);
  if (isOn) {
    cameraDevices[deviceId].isOn = false;
  }
};

export const takeSnapshot = async (deviceId: string): Promise<Buffer> => {
  await start(deviceId);

  while (!cameraDevices[deviceId].latestFrame) {
    await timeout(50);
  }

  return cameraDevices[deviceId].latestFrame;
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

  app.get("/video-device/:deviceId/stream.mjpg", async (req, res) => {
    const deviceId = decode(req.params.deviceId);
    await start(deviceId);

    res.writeHead(200, {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0",
      Pragma: "no-cache",
      Connection: "close",
      "Content-Type": "multipart/x-mixed-replace; boundary=--myboundary",
    });

    const writeFrame = (buffer: Buffer) => {
      res.write(
        `--myboundary\nContent-Type: image/jpg\nContent-length: ${buffer.length}\n\n`,
      );
      res.write(buffer);
    };

    cameraDevices[deviceId].emitter.addListener("frame", writeFrame);
    res.addListener("close", () => {
      cameraDevices[deviceId].emitter.removeListener("frame", writeFrame);
    });
  });

  app.get("/video-device/:deviceId/formats", (req, res) => {
    const deviceId = decode(req.params.deviceId);
    const { cam } = getOrCreateCameraDevice(deviceId);
    res.send(JSON.stringify(cam.formats));
  });

  app.get("/video-device/:deviceId/controls", (req, res) => {
    const deviceId = decode(req.params.deviceId);
    const { cam } = getOrCreateCameraDevice(deviceId);
    res.send(JSON.stringify(cam.controls));
  });
};
