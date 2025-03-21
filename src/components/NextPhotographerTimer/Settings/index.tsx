import React, { memo, useCallback } from "react";
import {
  Input,
  Button,
  Segmented,
  Space,
  Typography,
  theme,
  ColorPicker,
} from "antd";
import {
  UserOutlined,
  FieldTimeOutlined,
  TeamOutlined,
  SoundOutlined,
  BgColorsOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { ALARM_SOUNDS } from "./constants";
import VolumeSlider from "../VolumeSlider";
import { WaveColors, DEFAULT_WAVE_COLORS } from "../WaveAnimation/colors";
import { Color } from "antd/es/color-picker";
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
  playTone1: () => void;
  playTone2: () => void;
  playTone3: () => void;
  playTone4: () => void;
  stopAllSounds: () => void;
  waveColors: WaveColors;
  onWaveColorChange: (
    mode: "normal" | "danger",
    key: "primary" | "wave1" | "wave2",
    color: string
  ) => void;
  selectedWarningAlarm: string;
  setSelectedWarningAlarm: (value: string) => void;
  selectedWarningHalfAlarm: string;
  setSelectedWarningHalfAlarm: (value: string) => void;
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
    playTone1,
    playTone2,
    playTone3,
    playTone4,
    stopAllSounds,
    waveColors,
    onWaveColorChange,
    selectedWarningAlarm,
    setSelectedWarningAlarm,
    selectedWarningHalfAlarm,
    setSelectedWarningHalfAlarm,
  }: SettingsProps) => {
    const { token } = theme.useToken();

    const handleModelNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setModelName(e.target.value);
      },
      [setModelName]
    );

    const handleTimeLimitInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        handleTimeLimitChange(Math.max(0, value));
      },
      [handleTimeLimitChange]
    );

    const handlePhotographerCountInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.replace(/[^0-9]/g, "");
        const value = parseInt(inputValue) || 0;
        handlePhotographerCountChange(Math.max(1, value));
      },
      [handlePhotographerCountChange]
    );

    const handleAlarmChange = useCallback(
      (value: string | number) => {
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
          case "tone1":
            playTone1();
            break;
          case "tone2":
            playTone2();
            break;
          case "tone3":
            playTone3();
            break;
          case "tone4":
            playTone4();
            break;
          default:
            break;
        }
      },
      [
        setSelectedAlarm,
        stopAllSounds,
        playDefault,
        playBellding,
        playCatMeow,
        playDogBark,
        playCoin,
        playNotification,
        playNotification2,
        playTone1,
        playTone2,
        playTone3,
        playTone4,
      ]
    );

    const handleWarningHalfAlarmChange = useCallback(
      (value: string | number) => {
        const newValue = value as string;
        setSelectedWarningHalfAlarm(newValue);
        stopAllSounds();
        switch (newValue) {
          case "default":
            playDefault();
            break;
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
          case "tone1":
            playTone1();
            break;
          case "tone2":
            playTone2();
            break;
          case "tone3":
            playTone3();
            break;
          case "tone4":
            playTone4();
            break;
          default:
            break;
        }
      },
      [
        setSelectedWarningHalfAlarm,
        stopAllSounds,
        playDefault,
        playBellding,
        playCatMeow,
        playDogBark,
        playCoin,
        playNotification,
        playNotification2,
        playTone1,
        playTone2,
        playTone3,
        playTone4,
      ]
    );

    const handleWarningLast10SecondsAlarmChange = useCallback(
      (value: string | number) => {
        const newValue = value as string;
        setSelectedWarningAlarm(newValue);
        stopAllSounds();
        switch (newValue) {
          case "default":
            playDefault();
            break;
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
          case "tone1":
            playTone1();
            break;
          case "tone2":
            playTone2();
            break;
          case "tone3":
            playTone3();
            break;
          case "tone4":
            playTone4();
            break;
          default:
            break;
        }
      },
      [
        setSelectedWarningAlarm,
        stopAllSounds,
        playDefault,
        playBellding,
        playCatMeow,
        playDogBark,
        playCoin,
        playNotification,
        playNotification2,
        playTone1,
        playTone2,
        playTone3,
        playTone4,
      ]
    );

    return (
      <Space
        direction="vertical"
        size="large"
        style={{ 
          marginTop: 32, 
          width: "100%",
          height: "100%",
          overflow: "visible"
        }}
      >
        <Input
          addonBefore={<UserOutlined />}
          placeholder="モデル名を入力"
          value={modelName}
          onChange={handleModelNameChange}
          style={{ width: "320px" }}
        />

        <Space.Compact>
          <Input
            style={{ width: "160px", textAlign: "right" }}
            addonBefore={<TeamOutlined />}
            addonAfter="人"
            value={totalPhotographers}
            onChange={handlePhotographerCountInputChange}
            type="text"
            min={1}
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
        </Space.Compact>

        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Space.Compact>
            <Input
              style={{ width: "160px", textAlign: "right" }}
              addonBefore={<FieldTimeOutlined />}
              addonAfter="秒"
              value={timeLimit}
              onChange={handleTimeLimitInputChange}
              type="text"
              min={0}
            />
          </Space.Compact>

          <Space wrap>
            <Button
              onClick={() => increaseTimeLimit(-1)}
              disabled={timeLimit <= 0}
            >
              -1
            </Button>
            <Button onClick={() => increaseTimeLimit(1)}>+1</Button>
            <Button
              onClick={() => increaseTimeLimit(-5)}
              disabled={timeLimit < 5}
            >
              -5
            </Button>
            <Button onClick={() => increaseTimeLimit(5)}>+5</Button>
            <Button
              onClick={() => increaseTimeLimit(-30)}
              disabled={timeLimit < 30}
            >
              -30
            </Button>
            <Button onClick={() => increaseTimeLimit(30)}>+30</Button>
          </Space>
        </Space>

        <Space direction="vertical" style={{ marginTop: 8, width: "100%" }}>
          <Text>
            <SoundOutlined /> 中間時アラーム
          </Text>
          <div style={{ 
            width: "100%", 
            overflowX: "auto", 
            WebkitOverflowScrolling: "touch" 
          }}>
            <Segmented
              value={selectedWarningHalfAlarm}
              onChange={handleWarningHalfAlarmChange}
              options={ALARM_SOUNDS.map((sound) => ({
                label: sound.name,
                value: sound.id,
              }))}
            />
          </div>
        </Space>

        <Space direction="vertical" style={{ marginTop: 8, width: "100%" }}>
          <Text>
            <SoundOutlined /> 10秒前アラーム
          </Text>
          <div style={{ 
            width: "100%", 
            overflowX: "auto", 
            WebkitOverflowScrolling: "touch" 
          }}>
          <Segmented
            value={selectedWarningAlarm}
            onChange={handleWarningLast10SecondsAlarmChange}
              options={ALARM_SOUNDS.map((sound) => ({
                label: sound.name,
                value: sound.id,
              }))}
            />
          </div>
        </Space>

        <Space direction="vertical" style={{ marginTop: 8, width: "100%" }}>
          <Text>
            <SoundOutlined /> 終了時アラーム
          </Text>
          <div style={{ 
            width: "100%", 
            overflowX: "auto", 
            WebkitOverflowScrolling: "touch" 
          }}>
          <Segmented
            value={selectedAlarm}
            onChange={handleAlarmChange}
              options={ALARM_SOUNDS.map((sound) => ({
                label: sound.name,
                value: sound.id,
              }))}
            />
          </div>
        </Space>

        <VolumeSlider value={volume} onChange={handleVolumeChange} />

        <div style={{ marginTop: -8, marginBottom: 0 }}>
          <Input.Group compact>
            <Input
              style={{ width: "40%" }}
              addonBefore={<BgColorsOutlined />}
              value="カラー設定"
              readOnly
            />
            <Button
              onClick={() => {
                onWaveColorChange(
                  "normal",
                  "primary",
                  DEFAULT_WAVE_COLORS.normal.primary
                );
                onWaveColorChange(
                  "normal",
                  "wave1",
                  DEFAULT_WAVE_COLORS.normal.wave1
                );
                onWaveColorChange(
                  "normal",
                  "wave2",
                  DEFAULT_WAVE_COLORS.normal.wave2
                );
                onWaveColorChange(
                  "danger",
                  "primary",
                  DEFAULT_WAVE_COLORS.danger.primary
                );
                onWaveColorChange(
                  "danger",
                  "wave1",
                  DEFAULT_WAVE_COLORS.danger.wave1
                );
                onWaveColorChange(
                  "danger",
                  "wave2",
                  DEFAULT_WAVE_COLORS.danger.wave2
                );
              }}
              style={{ marginLeft: 8 }}
              title="デフォルトカラーに戻す"
            >
              <RedoOutlined />
            </Button>
          </Input.Group>
        </div>

        <div style={{ marginTop: -8, marginBottom: -8 }}>
          <Text strong>通常時</Text>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <Text type="secondary">背景:</Text>
            <ColorPicker
              value={waveColors.normal.primary}
              onChange={(color: Color) =>
                onWaveColorChange("normal", "primary", color.toRgbString())
              }
            />
            <Text type="secondary">前面波:</Text>
            <ColorPicker
              value={waveColors.normal.wave1}
              onChange={(color: Color) =>
                onWaveColorChange("normal", "wave1", color.toHexString())
              }
            />
            <Text type="secondary">背面波:</Text>
            <ColorPicker
              value={waveColors.normal.wave2}
              onChange={(color: Color) =>
                onWaveColorChange("normal", "wave2", color.toHexString())
              }
            />
          </div>
        </div>

        <div>
          <Text strong>残り時間10秒以下</Text>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <Text type="secondary">背景:</Text>
            <ColorPicker
              value={waveColors.danger.primary}
              onChange={(color: Color) =>
                onWaveColorChange("danger", "primary", color.toRgbString())
              }
            />
            <Text type="secondary">前面波:</Text>
            <ColorPicker
              value={waveColors.danger.wave1}
              onChange={(color: Color) =>
                onWaveColorChange("danger", "wave1", color.toHexString())
              }
            />
            <Text type="secondary">背面波:</Text>
            <ColorPicker
              value={waveColors.danger.wave2}
              onChange={(color: Color) =>
                onWaveColorChange("danger", "wave2", color.toHexString())
              }
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            color: token.colorTextSecondary,
            textAlign: "center",
            marginBottom: "20px"
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
