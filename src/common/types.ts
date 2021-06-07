import { JsonObject } from "./json";

// a camera device node -- /dev/video0 for example
export type DeviceId = string;

export const slugifyDeviceId = (deviceId: DeviceId) =>
  deviceId.slice(1).replace("/", "-");

export const deviceIdFromSlug = (deviceIdSlug: string) =>
  `/${deviceIdSlug.replace("-", "/")}`;

export interface Config extends JsonObject {
  captureDevices: DeviceId[];
  controlsDevice: DeviceId;

  captureEnable: boolean;
  captureName: string;
  captureRateMs: number;

  panStepEnable: boolean;
  panStepRateMs: number;
  panStepDirection: "left" | "right";

  tiltStepEnable: boolean;
  tiltStepRateMs: number;
  tiltStepDirection: "up" | "down";

  // zoomStepEnable: boolean;
  // zoomStepRateMs: number;
  // zoomStepStart: number;
  // zoomStepEnd: number;
  // zoomStepDirection: "in" | "out";
}
