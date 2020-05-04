import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Config } from "../common/types";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";

const mapState = (state: RootState) => ({
  devices: state.api.devices.value as string[],
});

const mapDispatch = {
  onSetConfigValue: (configKey: keyof Config, configValue: any) =>
    apiCall("setConfigValue", { configKey, configValue }),
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
  configKey: keyof Config;
  configValue: any; // TODO
  displayText: string;
  onChange: (v: string) => void;
}

type Props = PropsFromRedux & OwnProps;

const ConfigBooleanInput = ({
  configKey,
  configValue,
  displayText,
  onChange,
  onSetConfigValue,
}: Props) => {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newConfigValue = e.target.value;
    await onSetConfigValue(configKey, newConfigValue);
    onChange(newConfigValue);
  };

  return (
    <div>
      <label>
        {displayText}
        <select value={configValue ? "True" : "False"} onChange={handleChange}>
          <option key="True" value="True">
            True
          </option>
          <option key="False" value="False">
            False
          </option>
        </select>
      </label>
    </div>
  );
};

export default connector(ConfigBooleanInput);
