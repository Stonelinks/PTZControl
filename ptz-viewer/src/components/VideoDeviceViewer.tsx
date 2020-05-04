import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { encode } from "../common/encode";
import { RootState } from "../redux";
import { BASE_URL } from "../utils/api";

const mapState = (state: RootState) => ({});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  deviceId: string;
}

type Props = PropsFromRedux & OwnProps;

const VideoDeviceViewer = ({ deviceId }: Props) => {
  return (
    <div>
      <img
        src={`${BASE_URL}/video-device/${encode(deviceId)}/stream.mjpg`}
        style={{ width: "100%", height: "auto" }}
      />
      {/* <img src={`${BASE_URL}/video-device/${encode(deviceId)}/snapshot.jpg`} /> */}
    </div>
  );
};

export default connector(VideoDeviceViewer);
