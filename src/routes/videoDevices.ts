import { Application } from "express";
import { decode } from "../common/encode";
import {
  listVideoDevices,
  takeSnapshot,
  start,
  getOrCreateCameraDevice,
  moveAxisRelative,
  getControl,
  getZoomInfo,
  moveAxisSpeedStart,
  moveAxisSpeedStop,
  setCameraDeviceZoom,
} from "../utils/videoDevices";
import { timeout, MILLISECONDS_IN_SECOND } from "../common/time";
import { DeviceId } from "../common/types";

const numVideoUsersConnected: Record<DeviceId, number> = {};
const lastUserDisconnectedMs: Record<DeviceId, number> = {};

export const getLastUserDisconnectedMs = (deviceId: DeviceId) => {
  const r = numVideoUsersConnected[deviceId];
  if (!r) {
    return 0;
  } else {
    return r;
  }
};

export const isStreamingVideo = (deviceId: DeviceId) => {
  const r = numVideoUsersConnected[deviceId];
  if (!r) {
    return false;
  } else {
    return r > 1;
  }
};

const videoStreamUserConnected = (deviceId: DeviceId) => {
  console.log("user connected to video stream", deviceId);
  if (!numVideoUsersConnected.hasOwnProperty(deviceId)) {
    numVideoUsersConnected[deviceId] = 0;
  }
  numVideoUsersConnected[deviceId]++;
};

const videoStreamUserDisconnected = (deviceId: DeviceId) => {
  console.log("user disconnected from video stream", deviceId);
  lastUserDisconnectedMs[deviceId] = Date.now();
  if (!numVideoUsersConnected.hasOwnProperty(deviceId)) {
    return;
  }
  numVideoUsersConnected[deviceId]--;
  if (numVideoUsersConnected[deviceId] < 0) {
    numVideoUsersConnected[deviceId] = 0;
  }
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
    videoStreamUserConnected(deviceId);
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

    getOrCreateCameraDevice(deviceId).emitter.addListener("frame", writeFrame);
    res.addListener("close", () => {
      videoStreamUserDisconnected(deviceId);
      getOrCreateCameraDevice(deviceId).emitter.removeListener(
        "frame",
        writeFrame,
      );
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

  app.get(
    "/video-device/:deviceId/control/:axis/:direction/position",
    async (req, res) => {
      const deviceId = decode(req.params.deviceId);
      const axis = decode(req.params.axis) as any;
      const direction = decode(req.params.direction) as any;

      const { cam } = getOrCreateCameraDevice(deviceId);
      moveAxisRelative(cam, axis, direction, 128);
      await timeout(2 * MILLISECONDS_IN_SECOND);

      res.send(true);
    },
  );

  app.get(
    "/video-device/:deviceId/control/zoom/:direction",
    async (req, res) => {
      const deviceId = decode(req.params.deviceId);
      const direction = decode(req.params.direction);

      const { cam, zoom } = getOrCreateCameraDevice(deviceId);
      const zoomAbsControl = getControl(cam, `zoom absolute`);
      if (zoomAbsControl) {
        const { min, max } = getZoomInfo(cam);
        const zoomDelta = (direction === "in" ? 1 : -1) * 10;

        let newZoom = zoom + zoomDelta;

        if (zoom < min) {
          newZoom = min;
        } else if (zoom > max) {
          newZoom = max;
        }

        setCameraDeviceZoom(deviceId, newZoom);

        console.log("zoom", direction, newZoom, "delta", zoomDelta);

        cam.controlSet(zoomAbsControl.id, newZoom);
      }

      res.send(true);
    },
  );

  app.get(
    "/video-device/:deviceId/control/:axis/:direction/speed/start",
    async (req, res) => {
      const deviceId = decode(req.params.deviceId);
      const axis = decode(req.params.axis) as any;
      const direction = decode(req.params.direction) as any;

      const { cam } = getOrCreateCameraDevice(deviceId);
      moveAxisSpeedStart(cam, axis, direction);

      res.send(true);
    },
  );

  app.get(
    "/video-device/:deviceId/control/:axis/speed/stop",
    async (req, res) => {
      const deviceId = decode(req.params.deviceId);
      const axis = decode(req.params.axis) as any;

      const { cam } = getOrCreateCameraDevice(deviceId);
      moveAxisSpeedStop(cam, axis);

      res.send(true);
    },
  );
};
