import React, { memo, useState, useEffect } from "react";
import { InputNumber, Button, Typography } from "antd";
import { UndoOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface TimeLimitInputProps {
  value: number;
  onChange: (value: number) => void;
  increaseTimeLimit: (increment: number) => void;
}

const TimeLimitInput = memo(
  ({ value, onChange, increaseTimeLimit }: TimeLimitInputProps) => {
    const [localValue, setLocalValue] = useState<number | null>(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleChange = (newValue: number | null) => {
      setLocalValue(newValue);
    };

    const handleBlur = () => {
      if (localValue !== null && localValue >= 0) {
        onChange(localValue);
      } else {
        setLocalValue(value);
      }
    };

    const handleReset = () => {
      setLocalValue(0);
      onChange(0);
    };

    return (
      <div>
        <div style={{ marginBottom: 8 }}>
          <Text>制限時間 (秒):</Text>
          <InputNumber
            min={0}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ marginLeft: 10 }}
          />
          <Button
            onClick={() => handleReset()}
            icon={<UndoOutlined />}
            size="small"
            style={{ marginLeft: 4 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, margin: "auto" }}>
            <Button
              onClick={() => increaseTimeLimit(1)}
              style={{ width: "64px" }}
            >
              +1秒
            </Button>
            <Button
              onClick={() => increaseTimeLimit(10)}
              style={{ width: "64px" }}
            >
              +10秒
            </Button>
            <Button
              onClick={() => increaseTimeLimit(30)}
              style={{ width: "64px" }}
            >
              +30秒
            </Button>
            <Button
              onClick={() => increaseTimeLimit(60)}
              style={{ width: "64px" }}
            >
              +60秒
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

TimeLimitInput.displayName = "TimeLimitInput";

export default TimeLimitInput;
