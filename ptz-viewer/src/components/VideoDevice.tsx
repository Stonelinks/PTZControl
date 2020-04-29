import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { encode } from "../common/encode";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { BASE_URL } from "../utils/api";
import Debug from "../utils/debug";

const mapState = (state: RootState) => ({
  deviceFormats: state.api.deviceFormats.value,
  deviceControls: state.api.deviceControls.value,
});

const mapDispatch = {
  onFetchDeviceFormats: (deviceId: string) =>
    apiCall("deviceFormats", { deviceId }),
  onFetchDeviceControls: (deviceId: string) =>
    apiCall("deviceControls", { deviceId }),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  deviceId: string;
}

type Props = PropsFromRedux & OwnProps;

const VideoDevice = ({
  deviceId,
  deviceFormats,
  onFetchDeviceFormats,
  deviceControls,
  onFetchDeviceControls,
}: Props) => {
  React.useEffect(() => {
    onFetchDeviceFormats(deviceId);
    onFetchDeviceControls(deviceId);
  }, [deviceId, onFetchDeviceFormats, onFetchDeviceControls]);

  return (
    <div>
      <img src={`${BASE_URL}/video-device/${encode(deviceId)}/stream.mjpg`} />
      {/* <img src={`${BASE_URL}/video-device/${encode(deviceId)}/snapshot.jpg`} /> */}
      <Debug d={{ deviceControls }} />
    </div>
  );
};

export default connector(VideoDevice);
