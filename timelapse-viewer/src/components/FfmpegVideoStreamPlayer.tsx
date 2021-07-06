import React from "react";
import _ from "lodash";
import { MILLISECONDS_IN_SECOND } from "../common/time";
import { VIDEO_STREAM_WIDTH, VIDEO_STREAM_HEIGHT } from "../common/constants";

// tslint:disable-next-line:no-var-requires
const JSMpeg = require("@cycjimmy/jsmpeg-player");

interface Props {
  videoUrl: string;
}

export class FfmpegVideoStreamPlayer extends React.Component<Props> {
  heartBeatInterval?: NodeJS.Timeout;
  constructor(props: Props) {
    super(props);

    this.els = {
      videoWrapper: null,
    };
  }

  video: any;
  els: any;

  componentDidMount = _.debounce(() => {
    console.log(`FfmpegVideoStreamPlayer componentDidMount`);
    // Reference documentation, pay attention to the order of parameters.
    // https://github.com/cycjimmy/jsmpeg-player#usage
    this.video = new JSMpeg.VideoElement(
      this.els.videoWrapper,
      this.props.videoUrl,
      {
        audio: false,
        hooks: {
          play: () => {
            // const socket = this.video.player.source.socket as WebSocket;
            // this.heartBeatInterval = setInterval(() => {
            //   socket.send("heartbeat");
            // }, 10 * MILLISECONDS_IN_SECOND);
          },
          pause: () => {},
          stop: () => {},
          load: () => {},
        },
      },
      {},
    );
  }, MILLISECONDS_IN_SECOND);

  componentWillUnmount() {
    if (this.heartBeatInterval) {
      clearTimeout(this.heartBeatInterval);
    }
  }

  play() {
    console.log(`FfmpegVideoStreamPlayer play`);
    this.video.play();
  }

  pause() {
    console.log(`FfmpegVideoStreamPlayer pause`);
    this.video.pause();
  }

  stop() {
    console.log(`FfmpegVideoStreamPlayer stop`);
    this.video.stop();
  }

  destroy() {
    console.log(`FfmpegVideoStreamPlayer destroy`);
    this.video.destroy();
  }

  render() {
    console.log(`FfmpegVideoStreamPlayer render`);
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
