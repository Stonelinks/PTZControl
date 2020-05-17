import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { BASE_URL } from "../utils/api";
import { encode } from "../common/encode";

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
              width: "calc(20% - 1px)",
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
            <pre style={{ textAlign: "center" }}>{f}</pre>
          </div>
        ))}
      {/* <Debug d={getCaptureFiles} /> */}
    </div>
  );
};

export default connector(CaptureList);
