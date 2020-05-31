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
  options: string[];
  onChange: (v: string) => void;
}

type Props = PropsFromRedux & OwnProps;

const ConfigSelectionInput = ({
  configKey,
  configValue,
  displayText,
  options,
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
        <select value={configValue} onChange={handleChange}>
          {options.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default connector(ConfigSelectionInput);
