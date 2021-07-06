import { EventEmitter } from "events";
import { Application } from "express-ws";
import { FfmpegCommand } from "fluent-ffmpeg";
import { Readable, Writable } from "stream";
import { VIDEO_STREAM_HEIGHT, VIDEO_STREAM_WIDTH } from "../common/constants";
import { decode } from "../common/encode";
import { DeviceId } from "../common/types";
import { now } from "../utils/cron";
import { getFfmpeg } from "../utils/ffmpeg";
import { getOrCreateCameraDevice, start } from "../utils/videoDevices";

interface StreamingInfo {
  numVideoUsersConnected: number;
  lastUserDisconnectedMs: number;
  ffmpegHandle?: FfmpegCommand;
  frameEmitter: EventEmitter;
}

const streamingInfo: Record<DeviceId, StreamingInfo> = {};

const getOrCreateStreamingInfo = (deviceId: DeviceId): StreamingInfo => {
  if (!streamingInfo.hasOwnProperty(deviceId)) {
    streamingInfo[deviceId] = {
      numVideoUsersConnected: 0,
      lastUserDisconnectedMs: 0,
      frameEmitter: new EventEmitter(),
    };
  }
  return streamingInfo[deviceId];
};

const getOrCreateFfmpegFrameEmitter = (deviceId: DeviceId): EventEmitter =>
  getOrCreateStreamingInfo(deviceId).frameEmitter;

export const getLastUserDisconnectedMs = (deviceId: DeviceId) =>
  getOrCreateStreamingInfo(deviceId).lastUserDisconnectedMs;

export const isStreamingVideo = (deviceId: DeviceId) => {
  const r = getOrCreateStreamingInfo(deviceId).numVideoUsersConnected > 0;
  console.log(`isStreamingVideo ${r}`);
  return r;
};

const videoStreamUserConnected = (deviceId: DeviceId) => {
  console.log(`user connected to video stream ${deviceId}`);
  const { numVideoUsersConnected } = getOrCreateStreamingInfo(deviceId);
  streamingInfo[deviceId] = {
    ...streamingInfo[deviceId],
    numVideoUsersConnected: numVideoUsersConnected + 1,
  };
};

const videoStreamUserDisconnected = (deviceId: DeviceId) => {
  console.log(`user disconnected to video stream ${deviceId}`);
  const { numVideoUsersConnected } = getOrCreateStreamingInfo(deviceId);
  let newNumVideoUsersConnected = numVideoUsersConnected - 1;
  if (newNumVideoUsersConnected < 0) {
    newNumVideoUsersConnected = 0;
  }
  streamingInfo[deviceId] = {
    ...streamingInfo[deviceId],
    lastUserDisconnectedMs: now(),
    numVideoUsersConnected: newNumVideoUsersConnected,
  };
};

const startFfmpegStreamer = async (deviceId: DeviceId) => {
  console.log(`startFfmpegStreamer`);
  const { ffmpegHandle } = getOrCreateStreamingInfo(deviceId);
  if (ffmpegHandle) {
    throw Error(`ffmpeg handle already exists for ${deviceId}`);
  }

  await start(deviceId);

  const streamFfmpegCommand = getFfmpeg({
    stdoutLines: 1,
  })
    .input(
      new Readable({
        read() {
          getOrCreateCameraDevice(deviceId).emitter.once(
            "frame",
            (buffer: Buffer) => {
              this.push(buffer);
            },
          );
        },
      }),
    )
    .inputFormat("mjpeg")
    .noAudio()
    .format("mpegts")
    .videoCodec("mpeg1video")
    .size(`${VIDEO_STREAM_WIDTH}x${VIDEO_STREAM_HEIGHT}`)
    .videoBitrate("256k")
    .outputOptions("-bf 0");

  streamFfmpegCommand.on("start", commandStr => {
    console.log(`ffmpeg process started: ${commandStr}`);
  });

  streamFfmpegCommand.on("error", err => {
    console.log(`ffmpeg has been killed for ${deviceId}`);
    if (err) {
      console.error(err);
    }
  });

  streamingInfo[deviceId].ffmpegHandle = streamFfmpegCommand;

  streamFfmpegCommand.pipe(
    new Writable({
      objectMode: true,
      write: (data, encoding, callback) => {
        getOrCreateFfmpegFrameEmitter(deviceId).emit("data", data);
        callback();
      },
    }),
    { end: true },
  );
  console.log(`ffmpeg running for ${deviceId}`);
};

const stopFfmpegStreamer = (deviceId: DeviceId) => {
  console.log(`stopFfmpegStreamer`);
  const { ffmpegHandle } = getOrCreateStreamingInfo(deviceId);
  if (!ffmpegHandle) {
    throw Error(`no ffmpeg handle exists for ${deviceId}`);
  }

  ffmpegHandle.kill("SIGKILL");

  streamingInfo[deviceId].ffmpegHandle = undefined;
};

export const streamingRoutes = async (app: Application) => {
  // app.get("/stream/:deviceId/stream.mjpg", async (req, res) => {
  //   const deviceId = decode(req.params.deviceId);
  //   await start(deviceId);
  //   videoStreamUserConnected(deviceId);
  //   res.writeHead(200, {
  //     "Cache-Control":
  //       "no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0",
  //     Pragma: "no-cache",
  //     Connection: "close",
  //     "Content-Type": "multipart/x-mixed-replace; boundary=--myboundary",
  //   });

  //   const writeFrame = (buffer: Buffer) => {
  //     res.write(
  //       `--myboundary\nContent-Type: image/jpeg\nContent-length: ${buffer.length}\n\n`,
  //     );
  //     res.write(buffer);
  //   };

  //   getOrCreateCameraDevice(deviceId).emitter.addListener("frame", writeFrame);
  //   res.addListener("close", () => {
  //     videoStreamUserDisconnected(deviceId);
  //     // if (numVideoUsersConnected[deviceId] === 0) {
  //     //   stopFfmpegStreamer(deviceId);
  //     // }
  //     getOrCreateCameraDevice(deviceId).emitter.removeListener(
  //       "frame",
  //       writeFrame,
  //     );
  //   });
  // });

  app.ws("/stream/:deviceId/ffmpeg.ws", async (ws, req) => {
    const deviceId = decode(req.params.deviceId);
    console.log(`ws open ${deviceId}`);
    videoStreamUserConnected(deviceId);
    const { ffmpegHandle } = getOrCreateStreamingInfo(deviceId);
    if (!ffmpegHandle) {
      await startFfmpegStreamer(deviceId);
    }
    const listener = data => ws.send(data);
    getOrCreateFfmpegFrameEmitter(deviceId).on("data", listener);
    ws.on("close", () => {
      console.log(`ws close ${deviceId}`);
      videoStreamUserDisconnected(deviceId);
      if (getOrCreateStreamingInfo(deviceId).numVideoUsersConnected === 0) {
        stopFfmpegStreamer(deviceId);
      }
      getOrCreateFfmpegFrameEmitter(deviceId).removeListener("data", listener);
    });

    // let lastHeartBeatMs = now();
    // ws.on("message", m => {
    //   if (m === "heartbeat") {
    //     console.log(`received ${deviceId} heartbeat`);
    //     lastHeartBeatMs = now();
    //   }
    // });
  });
};
