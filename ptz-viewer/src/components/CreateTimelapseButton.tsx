import React from "react";
import { frontendPath } from "../utils/url";

// tslint:disable-next-line:no-var-requires
const { Link } = require("react-location");

interface Props {
  captureId: string;
}

const CreateTimelapseButton = ({ captureId }: Props) => (
  <Link to={frontendPath(`capture/${captureId}/createTimelapse`)}>
    <button>Create Timelapse</button>
  </Link>
);

export default CreateTimelapseButton;
