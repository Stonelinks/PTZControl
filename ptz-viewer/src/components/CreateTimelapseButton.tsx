import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { BASE_URL, fillInUrlTemplate } from "../utils/api";

const mapState = (state: RootState) => ({});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  captureId: string;
}

type Props = PropsFromRedux & OwnProps;

const CreateTimelapseButton = ({ captureId }: Props) => {
  const onClick = () => {
    const delayMs = window.prompt("Enter frame delay (ms)", "10");

    const url = fillInUrlTemplate(
      `${BASE_URL}/timelapse/capture/:captureId/create/:delayMs`,
      {
        captureId,
        delayMs,
      },
    );

    window.open(url);
  };
  return <button onClick={onClick}>Create Timelapse</button>;
};

export default connector(CreateTimelapseButton);
