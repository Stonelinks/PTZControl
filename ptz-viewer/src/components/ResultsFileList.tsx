import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { BASE_URL } from "../utils/api";
import ExpandableSection from "./ExpandableSection";

const mapState = (state: RootState) => ({
  getResultsFileList: state.api.getResultsFileList.value,
});

const mapDispatch = {
  onGetCaptureFiles: (captureId: string) =>
    apiCall("getResultsFileList", { captureId }),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  captureId: string;
}

type Props = PropsFromRedux & OwnProps;

const ResultsFileList = ({
  captureId,
  getResultsFileList,
  onGetCaptureFiles,
}: Props) => {
  React.useEffect(() => {
    onGetCaptureFiles(captureId);
  }, [onGetCaptureFiles]);

  const hasFiles = getResultsFileList && getResultsFileList.length;

  const t = hasFiles
    ? `${getResultsFileList.length} timelapses`
    : "No timelapses computed yet";

  const title = <h2>{t}</h2>;

  return hasFiles ? (
    <ExpandableSection title={title} startOpened={true}>
      {getResultsFileList.map((f: string) => (
        <div
          style={{
            width: "calc(25% - 1px)",
            margin: "0px -1px -1px 0px",
            padding: "0px",
            display: "inline-block",
            border: "1px grey solid",
          }}
        >
          {f.endsWith("mp4") ? (
            <video style={{ width: "100%", height: "auto" }} controls>
              <source src={`${BASE_URL}/${f}`} type="video/mp4" />
            </video>
          ) : (
            <img
              src={`${BASE_URL}/${f}`}
              style={{ width: "100%", height: "auto" }}
            />
          )}
          <pre style={{ textAlign: "center" }}>{f}</pre>
        </div>
      ))}
    </ExpandableSection>
  ) : (
    title
  );
};

export default connector(ResultsFileList);
