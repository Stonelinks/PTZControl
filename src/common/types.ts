import { JsonObject } from "./json";

export interface Config extends JsonObject {
  captureDevice: string;
  controlsDevice: string;
  captureEnable: boolean;
  captureName: string;
  captureRateMs: number;
}
