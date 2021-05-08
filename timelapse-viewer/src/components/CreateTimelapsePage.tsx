import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { BASE_URL, fillInUrlTemplate } from "../utils/api";
import { MILLISECONDS_IN_SECOND } from "../common/time";
import { frontendPath, navigate } from "../utils/url";

const mapState = (state: RootState) => ({});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  captureId: string;
}

type Props = PropsFromRedux & OwnProps;

const CreateTimelapsePage = ({ captureId }: Props) => {
  const [response, setResponse] = React.useState("");

  React.useEffect(() => {
    const delayMs = window.prompt("Enter frame delay (ms)", "1000");

    const url = fillInUrlTemplate(
      `${BASE_URL}/timelapse/capture/:captureId/create/:delayMs`,
      {
        captureId,
        delayMs,
      },
    );

    const xhr = new XMLHttpRequest();
    xhr.responseType = "text";

    xhr.onload = () => {
      setResponse(xhr.response);
      setTimeout(() => {
        navigate(frontendPath(`capture/${captureId}`));
      }, 2 * MILLISECONDS_IN_SECOND);
    };
    xhr.onprogress = () => {
      setResponse(xhr.response);
    };

    xhr.open("GET", url, true);
    xhr.send();
  }, [setResponse]);

  return <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>;
};

export default CreateTimelapsePage;
