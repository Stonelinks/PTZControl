import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Config } from "../common/types";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import DeviceConfigSelector from "./DeviceConfigSelector";

const mapState = (state: RootState) => ({
  config: state.api.getConfig.value as Config,
});

const mapDispatch = {
  onGetConfig: () => apiCall("getConfig"),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {}

type Props = PropsFromRedux & OwnProps;

const ConfigEditor = ({ config, onGetConfig }: Props) => {
  React.useEffect(() => {
    onGetConfig();
  }, []);

  const deviceConfigKeys: { displayText: string; configKey: keyof Config }[] = [
    { configKey: "captureDevice", displayText: "Capture device" },
    { configKey: "controlsDevice", displayText: "Controls device" },
  ];

  return (
    <div>
      {deviceConfigKeys.map(({ displayText, configKey }) => (
        <DeviceConfigSelector
          configKey={configKey}
          displayText={displayText}
          configValue={config[configKey]}
          onChange={onGetConfig}
        />
      ))}
    </div>
  );
};

export default connector(ConfigEditor);
