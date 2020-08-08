import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";
import {
  CaptureCronJob,
  TiltCronJob,
  PanCronJob,
  CameraTimeoutCronJob,
} from "./timelapse";

export const DEFAULT_INTERVAL_MS = 15 * MILLISECONDS_IN_SECOND;

interface CronJobs {
  name: string;
  intervalMs: (() => Promise<number>) | number;
  fn: (nowMs: number) => Promise<any> | void;
}

class Cron {
  jobs: CronJobs[];
  lastRunMs: number[] = [];
  constructor(jobs: CronJobs[]) {
    this.jobs = jobs;
  }

  async start() {
    while (true) {
      await timeout(MILLISECONDS_IN_SECOND);
      await this.tick();
    }
  }

  async tick() {
    for (let i = 0; i < this.jobs.length; i++) {
      const { intervalMs, fn, name } = this.jobs[i];

      let iMs: number = DEFAULT_INTERVAL_MS;
      if (typeof intervalMs === "function") {
        iMs = await intervalMs();
      } else if (typeof intervalMs === "number") {
        iMs = intervalMs;
      }

      const lastRunMs = this.lastRunMs[i];
      const nowMs = Date.now();
      let shouldRun = false;
      if (!lastRunMs) {
        shouldRun = true;
      } else if (lastRunMs + iMs < nowMs) {
        shouldRun = true;
      }

      if (shouldRun) {
        this.lastRunMs[i] = nowMs;
        try {
          console.log(`cron: running ${name}`);
          await fn(nowMs);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}

export const cron = new Cron([
  CaptureCronJob,
  CameraTimeoutCronJob,
  PanCronJob,
  TiltCronJob,
]);
