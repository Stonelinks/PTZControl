import * as shell from "shelljs";
import { getConfig } from "./config";
import { takeSnapshot } from "./videoDevices";
import { writeFileAsync } from "./files";
import { CAPTURE_FOLDER } from "../common/constants";

export const getCaptureCronJob = async () => {
  const c = await getConfig();
  return {
    name: "capture",
    intervalMs: c.captureRateMs,
    fn: async nowMs => {
      if (c.captureEnable) {
        console.log(`${nowMs}: taking snapshot`);
        const snapshot = await takeSnapshot(c.captureDevice);

        shell.mkdir("-p", `${CAPTURE_FOLDER}/${c.captureName}`);

        await writeFileAsync(
          `${CAPTURE_FOLDER}/${c.captureName}/${c.captureName}-${nowMs}.jpg`,
          snapshot,
        );
      }
    },
  };
};
