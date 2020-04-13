import { SERVER_PORT, MILLISECONDS_IN_SECOND } from "./common";
import { reload } from "./url";

export const apiFetch = async (url: string): Promise<any> => {
  const res = await window.fetch(
    `http://${window.location.hostname}:${SERVER_PORT}/${url}`,
  );
  const json = await res.json();
  return json;
};

// Keep the app up-to-date
export const initUpdateCheckInterval = async () => {
  setInterval(async () => {
    try {
      const r = await apiFetch("update-apps");
      if (r.shouldRestart) {
        reload();
      }
    } catch (e) {
      // pass
    }
  }, 5 * MILLISECONDS_IN_SECOND);
};
