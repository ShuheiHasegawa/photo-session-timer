import React, { memo, useState } from "react";
import { InputNumber, Typography } from "antd";

const { Text } = Typography;

interface PhotographerCountInputProps {
  value: number;
  onChange: (value: number) => void;
}

const PhotographerCountInput = memo(
  ({ value, onChange }: PhotographerCountInputProps) => {
    const [localValue, setLocalValue] = useState<number | null>(value);

    const handleChange = (newValue: number | null) => {
      setLocalValue(newValue);
    };

    const handleBlur = () => {
      if (localValue !== null && localValue >= 1) {
        onChange(localValue);
      } else {
        setLocalValue(value);
      }
    };

    return (
      <div style={{ marginBottom: 20 }}>
        <Text>撮影者数:</Text>
        <InputNumber
          min={1}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ marginLeft: 10 }}
        />
      </div>
    );
  }
);

PhotographerCountInput.displayName = "PhotographerCountInput";

export default PhotographerCountInput;
