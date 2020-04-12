import React from "react";
import { apiCall } from "../utils/api";
import { reload } from "../utils/url";
import Debug from "../utils/debug";

enum CONNECTIVITY_STATE {
  unknown = "Loading...",
  connected = "Connected",
  disconnected = "Disconnected",
}

const App = () => {
  const [connectivityState, setConnectivityState] = React.useState(
    CONNECTIVITY_STATE.unknown,
  );
  const [devices, setDevices] = React.useState("???");

  React.useEffect(() => {
    (async () => {
      switch (connectivityState) {
        case CONNECTIVITY_STATE.unknown:
          try {
            const ping = await apiCall("ping");
            if (ping.pong === "pong") {
              setConnectivityState(CONNECTIVITY_STATE.connected);
              const d = await apiCall("list-video-devices");
              setDevices(d);
            } else {
              reload();
            }
          } catch (e) {
            setConnectivityState(CONNECTIVITY_STATE.disconnected);
          }
          break;
        default:
          break;
      }
    })();
  }, [connectivityState]);

  return (
    <div>
      {connectivityState === CONNECTIVITY_STATE.connected ? (
        <div>
          <div style={{ display: "flex", borderBottom: "1px solid black" }}>
            <div style={{ flex: "1" }}>
              <h1>PTZ Control</h1>
            </div>
          </div>
          <Debug d={devices} />
          {/* <PaginationControls
                currPage={currPage}
                setCurrPage={setCurrPage}
              /> */}
        </div>
      ) : (
        connectivityState
      )}
    </div>
  );
};

export default App;
