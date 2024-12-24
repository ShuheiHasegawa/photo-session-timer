import React, { memo } from "react";
import { Input, Button, Segmented, Space, Typography, theme } from "antd";
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
  // playBell: () => void;
  // playPigeon: () => void;
  playBellding: () => void;
  playCatMeow: () => void;
  playDogBark: () => void;
  playCoin: () => void;
  playNotification: () => void;
  playNotification2: () => void;
  stopAllSounds: () => void;
}

const { Text, Link } = Typography;

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
    // playBell,
    // playPigeon,
    playBellding,
    playCatMeow,
    playDogBark,
    playCoin,
    playNotification,
    playNotification2,
    stopAllSounds,
  }: SettingsProps) => {
    const { token } = theme.useToken();

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
            style={{ width: "40%", textAlign: "right" }}
            addonBefore={<TeamOutlined />}
            addonAfter="人"
            value={`${totalPhotographers}`}
            readOnly
          />
          <Button
            onClick={() =>
              handlePhotographerCountChange(Math.max(1, totalPhotographers - 1))
            }
            style={{ marginLeft: 8 }}
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
              style={{ width: "40%", textAlign: "right" }}
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
            value="アラーム音"
            readOnly
          />
          <Segmented
            style={{ marginTop: 8 }}
            value={selectedAlarm}
            onChange={(value) => {
              const newValue = value as string;
              setSelectedAlarm(newValue);
              stopAllSounds();
              switch (newValue) {
                case "default":
                  playDefault();
                  break;
                // case "bell":
                //   playBell();
                //   break;
                // case "pigeon":
                //   playPigeon();
                //   break;
                case "bellding":
                  playBellding();
                  break;
                case "cat-meow":
                  playCatMeow();
                  break;
                case "dog-bark":
                  playDogBark();
                  break;
                case "coin":
                  playCoin();
                  break;
                case "notification":
                  playNotification();
                  break;
                case "notification2":
                  playNotification2();
                  break;
                default:
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

        <div
          style={{
            position: "absolute",
            bottom: "88px",
            color: token.colorTextSecondary,
            textAlign: "center",
          }}
        >
          <Text style={{ fontSize: "12px" }}>
            Sound Effect by{" "}
            <Link
              href="https://pixabay.com/users/freesound_community-46691455/"
              target="_blank"
              rel="noopener noreferrer"
            >
              freesound_community
            </Link>{" "}
            from{" "}
            <Link
              href="https://pixabay.com/sound-effects/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pixabay
            </Link>
          </Text>
        </div>
      </Space>
    );
  }
);

Settings.displayName = "Settings";

export default Settings;
