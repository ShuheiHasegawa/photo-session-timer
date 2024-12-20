import React, { memo } from "react";
import { Input, Button, Segmented, Space } from "antd";
import {
  UserOutlined,
  FieldTimeOutlined,
  TeamOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { ALARM_SOUNDS } from "./constants";
import VolumeSlider from "../VolumeSlider";

interface SettingsProps {
  modelName: string;
  setModelName: (name: string) => void;
  timeLimit: number;
  handleTimeLimitChange: (value: number) => void;
  increaseTimeLimit: (increment: number) => void;
  totalPhotographers: number;
  handlePhotographerCountChange: (value: number) => void;
  volume: number;
  handleVolumeChange: (value: number) => void;
  selectedAlarm: string;
  setSelectedAlarm: (value: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (checked: boolean) => void;
  playDefault: () => void;
  playBell: () => void;
  playPigeon: () => void;
  stopAllSounds: () => void;
}

const Settings = memo(
  ({
    modelName,
    setModelName,
    timeLimit,
    handleTimeLimitChange,
    increaseTimeLimit,
    totalPhotographers,
    handlePhotographerCountChange,
    volume,
    handleVolumeChange,
    selectedAlarm,
    setSelectedAlarm,
    playDefault,
    playBell,
    playPigeon,
    stopAllSounds,
  }: SettingsProps) => {
    return (
      <Space
        direction="vertical"
        size="large"
        style={{ marginTop: 32, width: "100%" }}
      >
        <Input
          addonBefore={<UserOutlined />}
          placeholder="モデル名を入力"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          style={{ width: "50%" }}
        />

        <Input.Group compact>
          <Input
            style={{ width: "40%" }}
            addonBefore={<TeamOutlined />}
            value={`${totalPhotographers}人`}
            readOnly
          />
          <Button
            onClick={() =>
              handlePhotographerCountChange(Math.max(1, totalPhotographers - 1))
            }
          >
            -
          </Button>
          <Button
            onClick={() =>
              handlePhotographerCountChange(totalPhotographers + 1)
            }
          >
            +
          </Button>
        </Input.Group>

        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Input.Group compact>
            <Input
              style={{ width: "40%" }}
              addonBefore={<FieldTimeOutlined />}
              addonAfter="秒"
              value={timeLimit}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                handleTimeLimitChange(Math.max(0, value));
              }}
              type="number"
              min={0}
            />
          </Input.Group>

          <Space wrap>
            <Button onClick={() => increaseTimeLimit(-1)}>-1</Button>
            <Button onClick={() => increaseTimeLimit(1)}>+1</Button>
            <Button onClick={() => increaseTimeLimit(-5)}>-5</Button>
            <Button onClick={() => increaseTimeLimit(5)}>+5</Button>
            <Button onClick={() => increaseTimeLimit(-30)}>-30</Button>
            <Button onClick={() => increaseTimeLimit(30)}>+30</Button>
          </Space>
        </Space>

        <Input.Group compact style={{ marginTop: 8 }}>
          <Input
            style={{ width: "40%", marginRight: 8 }}
            addonBefore={<SoundOutlined />}
            value="アラーム"
            readOnly
          />
          <Segmented
            value={selectedAlarm}
            onChange={(value) => {
              const newValue = value as string;
              setSelectedAlarm(newValue);
              stopAllSounds();
              switch (newValue) {
                case "default":
                  playDefault();
                  break;
                case "bell":
                  playBell();
                  break;
                case "pigeon":
                  playPigeon();
                  break;
              }
            }}
            options={ALARM_SOUNDS.map((sound) => ({
              label: sound.name,
              value: sound.id,
            }))}
          />
        </Input.Group>

        <VolumeSlider value={volume} onChange={handleVolumeChange} />
      </Space>
    );
  }
);

Settings.displayName = "Settings";

export default Settings;
