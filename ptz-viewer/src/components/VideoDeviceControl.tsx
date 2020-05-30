import throttle from "lodash.throttle";
import * as mousetrap from "mousetrap";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { MILLISECONDS_IN_SECOND } from "../common/time";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";

const mapState = (state: RootState) => ({
  getDeviceFormats: state.api.getDeviceFormats.value,
  getDeviceControls: state.api.getDeviceControls.value,
});

const mapDispatch = {
  onGetDeviceFormats: (deviceId: string) =>
    apiCall("getDeviceFormats", { deviceId }),
  onGetDeviceControls: (deviceId: string) =>
    apiCall("getDeviceControls", { deviceId }),
  onSetDevicePositionControl: (
    deviceId: string,
    axis: "pan" | "tilt",
    direction: "up" | "down" | "left" | "right",
  ) => apiCall("setDevicePositionControl", { deviceId, axis, direction }),
  onSetDeviceZoomControl: (deviceId: string, direction: "in" | "out") =>
    apiCall("setDeviceZoomControl", { deviceId, direction }),
  onSetDeviceSpeedControlStart: (
    deviceId: string,
    axis: "pan" | "tilt",
    direction: "up" | "down" | "left" | "right",
  ) => apiCall("setDeviceSpeedControlStart", { deviceId, axis, direction }),
  onSetDeviceSpeedControlStop: (deviceId: string, axis: "pan" | "tilt") =>
    apiCall("setDeviceSpeedControlStop", { deviceId, axis }),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  deviceId: string;
}

type Props = PropsFromRedux & OwnProps;

const VideoDeviceControl = ({
  deviceId,
  getDeviceFormats,
  onGetDeviceFormats,
  getDeviceControls,
  onGetDeviceControls,
  onSetDevicePositionControl,
  onSetDeviceZoomControl,
  onSetDeviceSpeedControlStart,
  onSetDeviceSpeedControlStop,
}: Props) => {
  // React.useEffect(() => {
  //   onGetDeviceFormats(deviceId);
  //   onGetDeviceControls(deviceId);
  // }, [deviceId, onGetDeviceFormats, onGetDeviceControls]);

  React.useEffect(() => {
    console.log("mounted");

    const isMoving = {
      left: false,
      right: false,
      up: false,
      down: false,
    };

    const makeKeyDownHandler = (
      axis: "pan" | "tilt",
      direction: "left" | "right" | "up" | "down",
    ) => {
      return () => {
        if (!isMoving[direction]) {
          isMoving[direction] = true;
          console.log("start", axis, direction);
          onSetDeviceSpeedControlStart(deviceId, axis, direction);
        }
        return false;
      };
    };

    const makeKeyUpHandler = (
      axis: "pan" | "tilt",
      direction: "left" | "right" | "up" | "down",
    ) => {
      return () => {
        console.log("stop", axis);
        isMoving[direction] = false;
        onSetDeviceSpeedControlStop(deviceId, axis);
        return false;
      };
    };

    mousetrap.bind("left", makeKeyDownHandler("pan", "left"), "keydown");
    mousetrap.bind("left", makeKeyUpHandler("pan", "left"), "keyup");
    mousetrap.bind("right", makeKeyDownHandler("pan", "right"), "keydown");
    mousetrap.bind("right", makeKeyUpHandler("pan", "right"), "keyup");
    mousetrap.bind("up", makeKeyDownHandler("tilt", "up"), "keydown");
    mousetrap.bind("up", makeKeyUpHandler("tilt", "up"), "keyup");
    mousetrap.bind("down", makeKeyDownHandler("tilt", "down"), "keydown");
    mousetrap.bind("down", makeKeyUpHandler("tilt", "down"), "keyup");

    const makeZoomHandler = (direction: "in" | "out") => {
      return throttle(() => {
        onSetDeviceZoomControl(deviceId, direction);
        return false;
      }, 0.1 * MILLISECONDS_IN_SECOND);
    };

    mousetrap.bind("q", makeZoomHandler("in"));
    mousetrap.bind("a", makeZoomHandler("out"));

    return () => {
      console.log("will unmount");
      mousetrap.unbind("q");
      mousetrap.unbind("a");
      mousetrap.unbind("left");
      mousetrap.unbind("right");
      mousetrap.unbind("up");
      mousetrap.unbind("down");
    };
  });

  return null;
};

export default connector(VideoDeviceControl);
