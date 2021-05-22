import { JsonObject } from "./json";

export interface VersionedConfigBase extends JsonObject {
  version: number;
}

export interface ConfigV0 extends JsonObject {
  captureDevice: string;
  controlsDevice: string;

  captureEnable: boolean;
  captureName: string;
  captureRateMs: number;

  panStepEnable: boolean;
  panStepRateMs: number;
  panStepDirection: "left" | "right";

  tiltStepEnable: boolean;
  tiltStepRateMs: number;
  tiltStepDirection: "up" | "down";
}

export interface ConfigItem extends JsonObject {
  captureDevice: string;
  captureEnable: boolean;
  captureName: string;
  captureRateMs: number;
}
export interface ConfigV1 extends VersionedConfigBase {
  version: 1;
  configs: ConfigItem[];
}

export type AnyConfig = ConfigV0 | ConfigV1;

export type Config = ConfigV1;
