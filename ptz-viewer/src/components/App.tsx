import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { apiFetch } from "../utils/api";
import { reload, frontendPath } from "../utils/url";
import ConfigEditor from "./ConfigEditor";
import VideoDeviceControl from "./VideoDeviceControl";
import VideoDeviceViewer from "./VideoDeviceViewer";
import CaptureList from "./CaptureList";
import NavItem from "./NavItem";
import CaptureFileList from "./CaptureFileList";
import CreateTimelapseButton from "./CreateTimelapseButton";
import ResultsFileList from "./ResultsFileList";
import CreateTimelapsePage from "./CreateTimelapsePage";

// tslint:disable-next-line:no-var-requires
const { Match, MatchFirst } = require("react-location");

const mapState = (state: RootState) => ({
  devices: state.api.devices.value,
  getDeviceFormats: state.api.getDeviceFormats.value,
  captureDevice: state.api.getConfig?.value?.captureDevice,
  controlsDevice: state.api.getConfig?.value?.controlsDevice,
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

const App = ({
  devices,
  onFetchDevices,
  captureDevice,
  controlsDevice,
}: Props) => {
  const [connectivityState, setConnectivityState] = React.useState(
    // CONNECTIVITY_STATE.connected,
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
  }, [connectivityState, onFetchDevices]);

  // React.useEffect(() => {
  //   onFetchDevices();
  // }, []);

  return (
    <div>
      {connectivityState === CONNECTIVITY_STATE.connected ? (
        <div>
          <div style={{ display: "flex", borderBottom: "1px solid black" }}>
            <div style={{ flex: "1" }}>
              <h1>PTZ Control</h1>
            </div>
          </div>

          <div>
            <NavItem to={frontendPath("/")} title="Camera" />
            <NavItem to={frontendPath("captures")} title="Captures" />
          </div>
          <div>
            <MatchFirst>
              <Match path={frontendPath("captures")}>
                <CaptureList />
              </Match>

              <Match path={frontendPath("capture/:captureId/createTimelapse")}>
                {({ captureId }: { captureId: string }) => (
                  <div>
                    <h2>Please wait...</h2>
                    <p>You will be automatically redirected</p>
                    <CreateTimelapsePage captureId={captureId} />
                  </div>
                )}
              </Match>

              <Match path={frontendPath("capture/:captureId")}>
                {({ captureId }: { captureId: string }) => (
                  <div>
                    <h2>Results</h2>
                    <CreateTimelapseButton captureId={captureId} />
                    <ResultsFileList captureId={captureId} />
                    <h2>Files</h2>
                    <CaptureFileList captureId={captureId} />
                  </div>
                )}
              </Match>

              {/* This has to go last */}
              <Match path={frontendPath("/")}>
                {captureDevice ? (
                  <VideoDeviceViewer
                    deviceId={captureDevice}
                    key={captureDevice}
                  />
                ) : null}
                {controlsDevice ? (
                  <VideoDeviceControl
                    deviceId={controlsDevice}
                    key={controlsDevice}
                  />
                ) : null}
                <ConfigEditor />
              </Match>
            </MatchFirst>
          </div>
        </div>
      ) : (
        connectivityState
      )}
    </div>
  );
};

export default connector(App);
