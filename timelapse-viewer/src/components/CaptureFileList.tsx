import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { BASE_URL } from "../utils/api";
import { encode } from "../common/encode";
import ExpandableSection from "./ExpandableSection";

const mapState = (state: RootState) => ({
  getCaptureFiles: state.api.getCaptureFiles.value,
});

const mapDispatch = {
  onGetCaptureFiles: (captureId: string) =>
    apiCall("getCaptureFiles", { captureId }),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  captureId: string;
}

type Props = PropsFromRedux & OwnProps;

const CaptureFileList = ({
  captureId,
  getCaptureFiles,
  onGetCaptureFiles,
}: Props) => {
  React.useEffect(() => {
    onGetCaptureFiles(captureId);
  }, [onGetCaptureFiles]);

  const hasFiles = getCaptureFiles && getCaptureFiles.length;

  const t = hasFiles
    ? `${getCaptureFiles.length} frames captured`
    : "No frames captured yet";

  const title = <h2>{t}</h2>;

  return hasFiles ? (
    <ExpandableSection title={title} startOpened={false}>
      {getCaptureFiles.map((f: string) => (
        <div
          style={{
            width: "calc(25% - 1px)",
            margin: "0px -1px -1px 0px",
            padding: "0px",
            display: "inline-block",
            border: "1px grey solid",
          }}
        >
          <img
            src={`${BASE_URL}/thumb/${encode(f)}`}
            style={{ width: "100%", height: "auto" }}
          />
          <div>
            <pre
              style={{
                marginLeft: "10px",
                float: "left",
              }}
            >
              {f.split("/").pop()}
            </pre>
            <pre
              style={{
                marginRight: "10px",
                float: "right",
              }}
            >
              <a target="_blank" href={`${BASE_URL}/${f}`}>
                Download
              </a>
            </pre>
          </div>
        </div>
      ))}
    </ExpandableSection>
  ) : (
    title
  );
};

export default connector(CaptureFileList);