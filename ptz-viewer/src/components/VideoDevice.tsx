import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import Debug from "../utils/debug";
import { BASE_URL } from "../utils/api";

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
  }, []);

  return (
    <div>
      <img src={`${BASE_URL}/video-device/${deviceId}/snapshot.jpg`} />
      <Debug d={{ deviceFormats }} />
    </div>
  );
};

export default connector(VideoDevice);
