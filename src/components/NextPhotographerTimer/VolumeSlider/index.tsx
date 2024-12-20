import React, { memo, useState } from "react";
import { Slider, Typography } from "antd";

const { Text } = Typography;

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const VolumeSlider = memo(({ value, onChange }: VolumeSliderProps) => {
  const [localValue, setLocalValue] = useState<number>(value);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <Text>音量: {localValue}%</Text>
      <Slider
        min={0}
        max={100}
        value={localValue}
        onChange={handleChange}
        style={{ marginTop: 8 }}
      />
    </div>
  );
});

VolumeSlider.displayName = "VolumeSlider";

export default VolumeSlider;
