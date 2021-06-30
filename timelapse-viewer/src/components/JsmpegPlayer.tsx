import React from "react";
import { VIDEO_STREAM_HEIGHT, VIDEO_STREAM_WIDTH } from "../common/constants";

// tslint:disable-next-line:no-var-requires
const JSMpeg = require("@cycjimmy/jsmpeg-player");

interface Props {
  videoUrl: string;
  options?: any;
  overlayOptions?: any;
}

export class JsmpegPlayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.els = {
      videoWrapper: null,
    };
  }

  video: any;
  els: any;

  componentDidMount() {
    console.log(`JsmpegPlayer componentDidMount`);
    // Reference documentation, pay attention to the order of parameters.
    // https://github.com/cycjimmy/jsmpeg-player#usage
    this.video = new JSMpeg.VideoElement(
      this.els.videoWrapper,
      this.props.videoUrl,
      this.props.options || {},
      this.props.overlayOptions || {},
    );

    this.play();
  }

  play() {
    console.log(`JsmpegPlayer play`);
    this.video.play();
  }

  pause() {
    console.log(`JsmpegPlayer pause`);
    this.video.pause();
  }

  stop() {
    console.log(`JsmpegPlayer stop`);
    this.video.stop();
  }

  destroy() {
    console.log(`JsmpegPlayer destroy`);
    this.video.destroy();
  }

  render() {
    console.log(`JsmpegPlayer render`);
    return (
      <div
        style={{
          width: `${VIDEO_STREAM_WIDTH}px`,
          height: `${VIDEO_STREAM_HEIGHT}px`,
        }}
        ref={videoWrapper => (this.els.videoWrapper = videoWrapper)}
      />
    );
  }
}
