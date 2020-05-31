import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Config } from "../common/types";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import DeviceConfigSelector from "./DeviceConfigSelector";
import ConfigStringInput from "./ConfigStringInput";
import ConfigBooleanInput from "./ConfigBooleanInput";
import ConfigNumberInput from "./ConfigNumberInput";
import ConfigSelectionInput from "./ConfigSelectionInput";

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
  }, [onGetConfig]);

  const deviceConfigKeys: { displayText: string; configKey: keyof Config }[] = [
    { configKey: "captureDevice", displayText: "Capture device" },
    { configKey: "controlsDevice", displayText: "Controls device" },
  ];

  return (
    <div>
      <h3>Device config</h3>
      {deviceConfigKeys.map(({ displayText, configKey }) => (
        <DeviceConfigSelector
          configKey={configKey}
          displayText={displayText}
          configValue={config[configKey]}
          onChange={onGetConfig}
        />
      ))}
      <h3>Capture config</h3>
      <ConfigStringInput
        configKey="captureName"
        displayText="Capture Name"
        configValue={config.captureName}
        onChange={onGetConfig}
      />
      <ConfigBooleanInput
        configKey="captureEnable"
        displayText="Capture Enable"
        configValue={config.captureEnable}
        onChange={onGetConfig}
      />
      <ConfigNumberInput
        configKey="captureRateMs"
        displayText="Capture Rate (ms)"
        configValue={config.captureRateMs}
        onChange={onGetConfig}
        positiveOnly
      />
      <h3>Pan config</h3>
      <ConfigBooleanInput
        configKey="panStepEnable"
        displayText="Pan Enable"
        configValue={config.panStepEnable}
        onChange={onGetConfig}
      />
      <ConfigNumberInput
        configKey="panStepRateMs"
        displayText="Pan Rate (ms)"
        configValue={config.panStepRateMs}
        onChange={onGetConfig}
        positiveOnly
      />
      <ConfigSelectionInput
        configKey="panStepDirection"
        displayText="Pan step direction"
        options={["left", "right"]}
        configValue={config.panStepDirection}
        onChange={onGetConfig}
      />
      <h3>Tilt config</h3>
      <ConfigBooleanInput
        configKey="tiltStepEnable"
        displayText="Tilt Enable"
        configValue={config.tiltStepEnable}
        onChange={onGetConfig}
      />
      <ConfigNumberInput
        configKey="tiltStepRateMs"
        displayText="Tilt Rate (ms)"
        configValue={config.tiltStepRateMs}
        onChange={onGetConfig}
        positiveOnly
      />
      <ConfigSelectionInput
        configKey="tiltStepDirection"
        displayText="Tilt step direction"
        options={["up", "down"]}
        configValue={config.tiltStepDirection}
        onChange={onGetConfig}
      />
    </div>
  );
};

export default connector(ConfigEditor);
