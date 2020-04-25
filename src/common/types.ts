import { JsonObject } from "./json";

export interface Config extends JsonObject {
  captureDevice: string;
  controlsDevice: string;
}
