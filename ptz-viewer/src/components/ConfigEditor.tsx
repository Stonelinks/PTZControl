import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { nothing } from "../common/nothing";
import { Config } from "../common/types";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import ConfigBooleanInput from "./ConfigBooleanInput";
import ConfigNumberInput from "./ConfigNumberInput";
import ConfigSelectionInput from "./ConfigSelectionInput";
import ConfigStringInput from "./ConfigStringInput";
import DeviceConfigSelector from "./DeviceConfigSelector";

const mapState = (state: RootState) => ({
  config: state.api.getConfig.value as Config | typeof nothing,
});

const mapDispatch = {
  onGetConfig: () => apiCall("getConfig"),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {}

type Props = PropsFromRedux & OwnProps;

enum INPUT_TYPES {
  HEADING,
  DEVICE,
  STRING,
  BOOLEAN,
  NUMBER,
  SELECT,
}

interface ConfigEditorItem {
  type: INPUT_TYPES;
  displayText: string;
  configKey?: keyof Config;
  options?: string[];
  positiveOnly?: boolean;
}

const ConfigEditorItems: ConfigEditorItem[] = [
  { type: INPUT_TYPES.HEADING, displayText: "Device config" },
  {
    type: INPUT_TYPES.DEVICE,
    configKey: "captureDevice",
    displayText: "Capture device",
  },
  {
    type: INPUT_TYPES.DEVICE,
    configKey: "controlsDevice",
    displayText: "Controls device",
  },
  { type: INPUT_TYPES.HEADING, displayText: "Capture config" },

  {
    type: INPUT_TYPES.STRING,
    configKey: "captureName",
    displayText: "Capture Name",
  },
  {
    type: INPUT_TYPES.BOOLEAN,
    configKey: "captureEnable",
    displayText: "Capture Enable",
  },
  {
    type: INPUT_TYPES.NUMBER,
    configKey: "captureRateMs",
    displayText: "Capture Rate (ms)",
    positiveOnly: true,
  },
  { type: INPUT_TYPES.HEADING, displayText: "Pan config" },
  {
    type: INPUT_TYPES.BOOLEAN,
    configKey: "panStepEnable",
    displayText: "Pan Enable",
  },
  {
    type: INPUT_TYPES.NUMBER,
    configKey: "panStepRateMs",
    displayText: "Pan Rate (ms)",
    positiveOnly: true,
  },
  {
    type: INPUT_TYPES.SELECT,
    configKey: "panStepDirection",
    displayText: "Pan step direction",
    options: ["left", "right"],
  },
  { type: INPUT_TYPES.HEADING, displayText: "Tilt config" },
  {
    type: INPUT_TYPES.BOOLEAN,
    configKey: "tiltStepEnable",
    displayText: "Tilt Enable",
  },
  {
    type: INPUT_TYPES.NUMBER,
    configKey: "tiltStepRateMs",
    displayText: "Tilt Rate (ms)",
    positiveOnly: true,
  },
  {
    type: INPUT_TYPES.SELECT,
    configKey: "tiltStepDirection",
    displayText: "Tilt step direction",
    options: ["up", "down"],
  },
];

const ConfigEditor = ({ config, onGetConfig }: Props) => {
  React.useEffect(() => {
    onGetConfig();
  }, [onGetConfig]);

  if (config === nothing) {
    return null;
  }

  return (
    <div>
      {ConfigEditorItems.map(
        ({ type, displayText, configKey, options, positiveOnly }) => {
          configKey = configKey || "";
          options = options || [];
          positiveOnly = positiveOnly || false;
          switch (type) {
            case INPUT_TYPES.HEADING:
              return <h3>{displayText}</h3>;
            case INPUT_TYPES.DEVICE:
              return (
                <DeviceConfigSelector
                  configKey={configKey}
                  displayText={displayText}
                  configValue={config[configKey]}
                />
              );
            case INPUT_TYPES.STRING:
              return (
                <ConfigStringInput
                  configKey={configKey}
                  displayText={displayText}
                  configValue={config[configKey]}
                />
              );
            case INPUT_TYPES.BOOLEAN:
              return (
                <ConfigBooleanInput
                  configKey={configKey}
                  displayText={displayText}
                  configValue={config[configKey]}
                />
              );
            case INPUT_TYPES.NUMBER:
              return (
                <ConfigNumberInput
                  configKey={configKey}
                  displayText={displayText}
                  configValue={config[configKey]}
                  positiveOnly={positiveOnly}
                />
              );
            case INPUT_TYPES.SELECT:
              return (
                <ConfigSelectionInput
                  configKey={configKey}
                  displayText={displayText}
                  configValue={config[configKey]}
                  options={options}
                />
              );
            default:
              return null;
          }
        },
      )}
    </div>
  );
};

export default connector(ConfigEditor);
