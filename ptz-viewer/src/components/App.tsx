import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { apiFetch } from "../utils/api";
import { reload } from "../utils/url";
import ConfigEditor from "./ConfigEditor";
import { encode, decode } from "../common/encode";
import VideoDevice from "./VideoDevice";

// tslint:disable-next-line:no-var-requires
const { Match, MatchFirst, Link } = require("react-location");

const mapState = (state: RootState) => ({
  devices: state.api.devices.value,
  deviceFormats: state.api.deviceFormats.value,
});

const mapDispatch = {
  onFetchDevices: () => apiCall("devices"),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {}

type Props = PropsFromRedux & OwnProps;

enum CONNECTIVITY_STATE {
  unknown = "Loading...",
  connected = "Connected",
  disconnected = "Disconnected",
}

const App = ({ devices, onFetchDevices }: Props) => {
  const [connectivityState, setConnectivityState] = React.useState(
    CONNECTIVITY_STATE.unknown,
  );

  React.useEffect(() => {
    (async () => {
      switch (connectivityState) {
        case CONNECTIVITY_STATE.unknown:
          try {
            const ping = await apiFetch("ping");
            if (ping.pong === "pong") {
              setConnectivityState(CONNECTIVITY_STATE.connected);
              onFetchDevices();
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
          <ConfigEditor />
          {devices &&
            devices.length &&
            devices.map((deviceId: string) => (
              <div
                key={deviceId}
                style={{ display: "inline-block", paddingRight: "10px" }}
              >
                <Link
                  to={`/${encode(deviceId)}`}
                  getActiveProps={(location: string) => ({
                    style: { color: "blue" },
                  })}
                >
                  <h2>{deviceId}</h2>
                </Link>
              </div>
            ))}
          <MatchFirst>
            <Match path=":deviceId">
              {({ deviceId }: { deviceId: string }) => (
                <VideoDevice deviceId={decode(deviceId)} />
              )}
            </Match>
          </MatchFirst>
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

export default connector(App);
