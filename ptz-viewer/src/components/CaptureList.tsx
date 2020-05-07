import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { BASE_URL } from "../utils/api";

const mapState = (state: RootState) => ({
  getCaptureFiles: state.api.getCaptureFiles.value,
});

const mapDispatch = {
  onGetCaptureFiles: () => apiCall("getCaptureFiles"),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {}

type Props = PropsFromRedux & OwnProps;

const CaptureList = ({ getCaptureFiles, onGetCaptureFiles }: Props) => {
  React.useEffect(() => {
    onGetCaptureFiles();
  }, [onGetCaptureFiles]);

  return (
    <div>
      {getCaptureFiles &&
        getCaptureFiles.length &&
        getCaptureFiles.map((f: string) => (
          <div
            style={{
              width: "20%",
              margin: "-1px",
              padding: "0.5px",
              display: "inline-block",
              border: "0.5px grey solid",
            }}
          >
            <img
              src={`${BASE_URL}/${f}`}
              style={{ width: "100%", height: "auto" }}
            />
            <pre style={{ textAlign: "center" }}>{f}</pre>
          </div>
        ))}
      {/* <Debug d={getCaptureFiles} /> */}
    </div>
  );
};

export default connector(CaptureList);