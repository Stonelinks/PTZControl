import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";

interface CronJobs {
  name: string;
  intervalMs: number;
  fn: () => Promise<any> | void;
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
      const lastRunMs = this.lastRunMs[i];
      const nowMs = Date.now();
      let shouldRun = false;
      if (!lastRunMs) {
        shouldRun = true;
      } else if (lastRunMs + intervalMs < nowMs) {
        shouldRun = true;
      }

      if (shouldRun) {
        this.lastRunMs[i] = nowMs;
        try {
          await fn();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}

const c = new Cron([]);

export default c;
