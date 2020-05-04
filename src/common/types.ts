import { JsonObject } from "./json";

export interface Config extends JsonObject {
  captureDevice: string;
  controlsDevice: string;

  captureEnable: boolean;
  captureName: string;
  captureRateMs: number;

  // panStepEnable: boolean;
  // panStepRateMs: number;
  // panStepDirection: "left" | "right";

  // tiltStepEnable: boolean;
  // tiltStepRateMs: number;
  // tiltStepDirection: "up" | "down";

  // zoomStepEnable: boolean;
  // zoomStepRateMs: number;
  // zoomStepStart: number;
  // zoomStepEnd: number;
  // zoomStepDirection: "in" | "out";
}
