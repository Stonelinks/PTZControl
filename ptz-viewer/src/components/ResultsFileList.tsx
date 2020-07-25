import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { BASE_URL } from "../utils/api";
import { encode } from "../common/encode";

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

  return (
    <div>
      {getResultsFileList &&
        getResultsFileList.length ?
        getResultsFileList.map((f: string) => (
          <div
            style={{
              width: "calc(20% - 1px)",
              margin: "0px -1px -1px 0px",
              padding: "0px",
              display: "inline-block",
              border: "1px grey solid",
            }}
          >
            <img
              src={`${BASE_URL}/${f}`}
              style={{ width: "100%", height: "auto" }}
            />
            <pre style={{ textAlign: "center" }}>{f}</pre>
          </div>
        )) : null}
      {/* <Debug d={getResultsFileList} /> */}
    </div>
  );
};

export default connector(ResultsFileList);
