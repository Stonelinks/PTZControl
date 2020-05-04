import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Config } from "../common/types";
import { RootState } from "../redux";
import { apiCall } from "../redux/api/actions";
import { isNumeric, isPositiveNumeric } from "../common/number";

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
  positiveOnly?: boolean;
}

type Props = PropsFromRedux & OwnProps;

const ConfigNumberInput = ({
  configKey,
  configValue,
  displayText,
  onChange,
  onSetConfigValue,
  positiveOnly,
}: Props) => {
  const [isNumber, setIsNumber] = React.useState(true);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfigValue = e.target.value;

    const testFunc = positiveOnly ? isPositiveNumeric : isNumeric;

    if (!testFunc(newConfigValue)) {
      setIsNumber(false);
    } else {
      setIsNumber(true);
      await onSetConfigValue(configKey, newConfigValue);
      onChange(newConfigValue);
    }
  };

  return (
    <div>
      <label>
        {displayText}
        <input value={configValue} onChange={handleChange} />
        {!isNumber && (
          <p style={{ display: "inline-block", color: "red" }}>
            must be a{positiveOnly ? " positive" : ""} number
          </p>
        )}
      </label>
    </div>
  );
};

export default connector(ConfigNumberInput);
