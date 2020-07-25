import throttle from "lodash.throttle";
import * as mousetrap from "mousetrap";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { MILLISECONDS_IN_SECOND } from "../common/time";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import {
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

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

interface State {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  in: boolean;
  out: boolean;
}

class VideoDeviceControl extends React.Component<Props, State> {
  panLeftStart: () => void;
  panLeftEnd: () => void;
  panRightStart: () => void;
  panRightEnd: () => void;
  tiltUpStart: () => void;
  tiltUpEnd: () => void;
  tiltDownStart: () => void;
  tiltDownEnd: () => void;
  zoomIn: any;
  zoomOut: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      left: false,
      right: false,
      up: false,
      down: false,
      in: false,
      out: false,
    };

    this.panLeftStart = this.makeKeyDownHandler("pan", "left");
    this.panLeftEnd = this.makeKeyUpHandler("pan", "left");
    this.panRightStart = this.makeKeyDownHandler("pan", "right");
    this.panRightEnd = this.makeKeyUpHandler("pan", "right");
    this.tiltUpStart = this.makeKeyDownHandler("tilt", "up");
    this.tiltUpEnd = this.makeKeyUpHandler("tilt", "up");
    this.tiltDownStart = this.makeKeyDownHandler("tilt", "down");
    this.tiltDownEnd = this.makeKeyUpHandler("tilt", "down");
    this.zoomIn = this.makeZoomHandler("in");
    this.zoomOut = this.makeZoomHandler("out");
  }

  makeKeyDownHandler = (
    axis: "pan" | "tilt",
    direction: "left" | "right" | "up" | "down",
  ) => {
    return () => {
      if (!this.state[direction]) {
        const { onSetDeviceSpeedControlStart, deviceId } = this.props;
        console.log("start", axis, direction);
        onSetDeviceSpeedControlStart(deviceId, axis, direction);
        (this.setState as any)({ [direction]: true });
      }
    };
  };

  makeKeyUpHandler = (
    axis: "pan" | "tilt",
    direction: "left" | "right" | "up" | "down",
  ) => {
    return () => {
      const { onSetDeviceSpeedControlStop, deviceId } = this.props;
      console.log("stop", axis);
      onSetDeviceSpeedControlStop(deviceId, axis);
      (this.setState as any)({ [direction]: false });
    };
  };

  makeZoomHandler = (direction: "in" | "out") => {
    return throttle(() => {
      const { onSetDeviceZoomControl, deviceId } = this.props;
      onSetDeviceZoomControl(deviceId, direction);
      (this.setState as any)({ [direction]: true });
      setTimeout(() => {
        (this.setState as any)({ [direction]: false });
      }, 0.5 * MILLISECONDS_IN_SECOND);
      console.log("zoom", direction);
    }, 0.1 * MILLISECONDS_IN_SECOND);
  };

  componentDidMount() {
    mousetrap.bind("left", this.panLeftStart, "keydown");
    mousetrap.bind("left", this.panLeftEnd, "keyup");
    mousetrap.bind("right", this.panRightStart, "keydown");
    mousetrap.bind("right", this.panRightEnd, "keyup");
    mousetrap.bind("up", this.tiltUpStart, "keydown");
    mousetrap.bind("up", this.tiltUpEnd, "keyup");
    mousetrap.bind("down", this.tiltDownStart, "keydown");
    mousetrap.bind("down", this.tiltDownEnd, "keyup");
    mousetrap.bind("q", this.zoomIn);
    mousetrap.bind("a", this.zoomOut);
  }

  componentDidUnmount() {
    mousetrap.unbind("q");
    mousetrap.unbind("a");
    mousetrap.unbind("left");
    mousetrap.unbind("right");
    mousetrap.unbind("up");
    mousetrap.unbind("down");
  }

  render() {
    return (
      <table>
        <tr>
          <td></td>
          <td>
            <button
              style={{
                backgroundColor: `${this.state.up ? "" : "light"}gray`,
              }}
              onMouseDown={this.tiltUpStart}
              onMouseUp={this.tiltUpEnd}
            >
              <FaChevronUp />
            </button>
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td>
            <button
              style={{
                backgroundColor: `${this.state.in ? "" : "light"}gray`,
              }}
              onMouseDown={this.zoomIn}
            >
              <FaPlus />
            </button>
          </td>
        </tr>
        <tr>
          <td>
            <button
              style={{
                backgroundColor: `${this.state.left ? "" : "light"}gray`,
              }}
              onMouseDown={this.panLeftStart}
              onMouseUp={this.panLeftEnd}
            >
              <FaChevronLeft />
            </button>
          </td>
          <td>
            <button
              style={{
                backgroundColor: `${this.state.down ? "" : "light"}gray`,
              }}
              onMouseDown={this.tiltDownStart}
              onMouseUp={this.tiltDownEnd}
            >
              <FaChevronDown />
            </button>
          </td>
          <td>
            <button
              style={{
                backgroundColor: `${this.state.right ? "" : "light"}gray`,
              }}
              onMouseDown={this.panRightStart}
              onMouseUp={this.panRightEnd}
            >
              <FaChevronRight />
            </button>
          </td>
          <td></td>
          <td></td>
          <td>
            <button
              style={{
                backgroundColor: `${this.state.out ? "" : "light"}gray`,
              }}
              onMouseDown={this.zoomOut}
            >
              <FaMinus />
            </button>
          </td>
        </tr>
      </table>
    );
  }
}

export default connector(VideoDeviceControl);
