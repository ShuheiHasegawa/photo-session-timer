"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
  InputNumber,
  Card,
  Typography,
  Modal,
  Radio,
  Slider,
  Progress,
  ConfigProvider,
  ColorPicker,
  Switch,
  Input,
  Segmented,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  UndoOutlined,
  ExpandOutlined,
} from "@ant-design/icons";
import { theme } from "antd";
import type { Color } from "antd/es/color-picker";
import { useSwipeable } from "react-swipeable";
import useSound from "use-sound";

import alarmMP3 from "@/assets/alarms/alarm.mp3";
import bellMP3 from "@/assets/alarms/bell.mp3";
import pigeonMP3 from "@/assets/alarms/pigeon.mp3";
import warningMP3 from "@/assets/alarms/warning.mp3";

const { Title, Text } = Typography;

type AlarmSound = {
  id: string;
  name: string;
  path: string;
};

const ALARM_SOUNDS: AlarmSound[] = [
  { id: "default", name: "標準", path: alarmMP3 },
  { id: "bell", name: "ベル", path: bellMP3 },
  { id: "pigeon", name: "ハト", path: pigeonMP3 },
];

const TIME_PRESETS = [
  { label: "60秒", value: 60 },
  { label: "90秒", value: 90 },
  { label: "120秒", value: 120 },
];

interface SessionData {
  timestamp: number;
  photographerCount: number;
  timeLimit: number;
  rounds: number;
}

const TimerApp = () => {
  const [currentPhotographer, setCurrentPhotographer] = useState(1);
  useEffect(() => {
    console.log("currentPhotographer changed:", currentPhotographer);
  }, [currentPhotographer]);

  const [totalPhotographers, setTotalPhotographers] = useState(5);
  const [round, setRound] = useState(1);
  const [timeLimit, setTimeLimit] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [volume, setVolume] = useState(50);
  const mainAlarmRef = useRef<HTMLAudioElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<Color | string>("#1890ff");
  const [modelName, setModelName] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTime, setActiveTime] = useState(0); // 実際の撮影時間
  const [isFullscreen, setIsFullscreen] = useState(false);

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary:
        typeof primaryColor === "string"
          ? primaryColor
          : primaryColor.toHexString(),
    },
  };

  const { token } = theme.useToken();

  // 音量制御
  useEffect(() => {
    if (mainAlarmRef.current) {
      mainAlarmRef.current.volume = volume / 100;
    }
  }, [volume]);

  // タイマー処理の修正
  const startTimer = () => {
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 11) {
          playWarning();
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // タイマーの監視を別途設定
  useEffect(() => {
    if (timeLeft <= 0 && isRunning) {
      // タイマー完了時の処理
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRunning(false);
      playSelectedAlarm();

      // 次の撮影者への移行
      setCurrentPhotographer((prev) => {
        console.log("Single update from:", prev);
        return prev >= totalPhotographers ? 1 : prev + 1;
      });

      // タイマーをリセット
      setTimeLeft(timeLimit);
    }
  }, [timeLeft, isRunning, totalPhotographers, timeLimit]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRunning(false);
    setTimeLeft(timeLimit);
  };

  // リセット確認用の関数
  const handleReset = () => {
    Modal.confirm({
      title: "リセット確認",
      content: "すべての設定と進行状況をリセットしますか？",
      okText: "リセット",
      cancelText: "キャンセル",
      onOk: () => {
        setCurrentPhotographer(1);
        setRound(1);
        setTimeLeft(timeLimit);
        setIsRunning(false);
        setActiveTime(0); // アクティブ時間をリセット
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      },
    });
  };

  // ページ離脱時の認
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning || currentPhotographer > 1 || round > 1) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning, currentPhotographer, round]);

  // セッション履歴保存
  const saveSession = useCallback(() => {
    const session: SessionData = {
      timestamp: Date.now(),
      photographerCount: totalPhotographers,
      timeLimit,
      rounds: round,
    };

    const existingSessions = JSON.parse(
      localStorage.getItem("photographySessions") || "[]"
    );
    localStorage.setItem(
      "photographySessions",
      JSON.stringify([...existingSessions, session])
    );
  }, [totalPhotographers, timeLimit, round]);

  // セッション終了時に保存
  useEffect(() => {
    if (currentPhotographer === totalPhotographers && round > 1) {
      saveSession();
    }
  }, [currentPhotographer, round, saveSession, totalPhotographers]);

  // 設定の保存と読み込み
  useEffect(() => {
    const savedTheme = localStorage.getItem("timerTheme");
    const savedModelName = localStorage.getItem("modelName");
    if (savedTheme) {
      const { isDark, color } = JSON.parse(savedTheme);
      setIsDarkMode(isDark);
      setPrimaryColor(color);
    }
    if (savedModelName) {
      setModelName(savedModelName);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "timerTheme",
      JSON.stringify({
        isDark: isDarkMode,
        color: primaryColor,
      })
    );
  }, [isDarkMode, primaryColor]);

  useEffect(() => {
    localStorage.setItem("modelName", modelName);
  }, [modelName]);

  // 時間の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      // 左スワイプで次の撮影者
      setCurrentPhotographer((prev) => {
        if (prev >= totalPhotographers) {
          setRound((r) => r + 1);
          return 1;
        }
        return prev + 1;
      });
    },
    onSwipedRight: () => {
      // 右スワイプでタイマー開始/停止
      if (isRunning) {
        stopTimer();
      } else {
        startTimer();
      }
    },
    onSwipedUp: () => {
      // スワイプでリセット確認
      handleReset();
    },
    trackMouse: true,
  });

  // 合計時間の表示用フォーマット関数
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${
      hours > 0 ? `${hours}時間` : ""
    }${minutes}分${remainingSeconds}秒`;
  };

  const FullscreenDisplay = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        textAlign: "center",
      }}
    >
      <Title level={2}>
        {round}巡目 - {currentPhotographer}/{totalPhotographers}
      </Title>
      <Title style={{ fontSize: "72px", margin: "20px 0" }}>{timeLeft}</Title>
      <Progress
        percent={(timeLeft / timeLimit) * 100}
        showInfo={false}
        status={timeLeft <= 10 ? "exception" : "active"}
        style={{ width: "80%", marginBottom: 20 }}
      />
      <div style={{ marginTop: 20 }}>
        <Text style={{ fontSize: "24px" }}>
          合計時間: {formatTime(activeTime)}
        </Text>
      </div>
      {modelName && (
        <Title level={3} style={{ marginTop: 20 }}>
          モデル: {modelName}
        </Title>
      )}
    </div>
  );

  const [selectedAlarm, setSelectedAlarm] = useState<string>("default");

  // 各アラーム音のHook
  const [playDefault, { stop: stopDefault }] = useSound(alarmMP3, {
    volume: volume / 100,
  });
  const [playBell, { stop: stopBell }] = useSound(bellMP3, {
    volume: volume / 100,
  });
  const [playPigeon, { stop: stopPigeon }] = useSound(pigeonMP3, {
    volume: volume / 100,
  });
  const [playWarning, { stop: stopWarning }] = useSound(warningMP3, {
    volume: volume / 100,
  });

  // すべての音を停止する関数
  const stopAllSounds = () => {
    stopDefault();
    stopBell();
    stopPigeon();
    stopWarning();
  };

  // 選択されたアラーム音を再生する関数
  const playSelectedAlarm = () => {
    stopAllSounds();
    switch (selectedAlarm) {
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
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <style>{`
        .ant-card {
          background-color: ${token.colorBgContainer} !important;
        }
        .ant-card-body {
          background-color: ${token.colorBgContainer} !important;
          color: ${token.colorText} !important;
        }
      `}</style>

      <div
        {...swipeHandlers}
        style={{
          maxWidth: 400,
          margin: "20px auto",
          padding: "0 20px",
          backgroundColor: token.colorBgContainer,
          minHeight: "100vh",
          color: token.colorText,
        }}
      >
        <Card>
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <Switch
              checked={isDarkMode}
              onChange={setIsDarkMode}
              checkedChildren="🌙"
              unCheckedChildren="☀"
            />
            <ColorPicker
              value={primaryColor}
              onChange={setPrimaryColor}
              presets={[
                {
                  label: "おすすめカラー",
                  colors: [
                    "#1890ff",
                    "#52c41a",
                    "#faad14",
                    "#f5222d",
                    "#722ed1",
                    "#13c2c2",
                  ],
                },
              ]}
            />
          </div>
          <Title level={3} style={{ textAlign: "center" }}>
            撮影タイマー
          </Title>

          <div style={{ marginBottom: 20 }}>
            <Text>制限時間（秒）:</Text>
            <InputNumber
              min={1}
              value={timeLimit}
              onChange={(value) => {
                setTimeLimit(value ?? 0);
                setTimeLeft(value ?? 0);
              }}
              style={{ marginLeft: 10 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <Text>撮影者数:</Text>
            <InputNumber
              min={1}
              value={totalPhotographers}
              onChange={(value) => setTotalPhotographers(value ?? 1)}
              style={{ marginLeft: 10 }}
            />
          </div>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={4}>
              {round}巡目 - 現在の撮影者: {currentPhotographer}/
              {totalPhotographers}
            </Title>
            <Title level={2}>{timeLeft}秒</Title>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            {!isRunning ? (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={startTimer}
                size="large"
              >
                開始
              </Button>
            ) : (
              <Button
                danger
                icon={<PauseCircleOutlined />}
                onClick={stopTimer}
                size="large"
              >
                停止
              </Button>
            )}
            <Button icon={<UndoOutlined />} onClick={handleReset} size="large">
              リセット
            </Button>
          </div>

          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <Text>アラーム音:</Text>
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
          </div>

          <div style={{ marginBottom: 20 }}>
            <Text>音量:</Text>
            <Slider
              value={volume}
              onChange={setVolume}
              style={{ width: 200 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <Text>プリセット:</Text>
            <Radio.Group
              onChange={(e) => {
                setTimeLimit(e.target.value);
                setTimeLeft(e.target.value);
              }}
            >
              {TIME_PRESETS.map((preset) => (
                <Radio.Button key={preset.value} value={preset.value}>
                  {preset.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
              padding: "8px",
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.02)",
              borderRadius: "4px",
            }}
          >
            <Text>合計撮影時間: {formatTime(activeTime)}</Text>
          </div>

          <Progress
            percent={(timeLeft / timeLimit) * 100}
            showInfo={false}
            status={timeLeft <= 10 ? "exception" : "active"}
            style={{ marginBottom: 20 }}
          />

          <div style={{ marginBottom: 20 }}>
            <Input
              placeholder="モデル名を入力"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            {modelName && (
              <Title
                level={4}
                style={{ textAlign: "center", margin: "16px 0" }}
              >
                モデル名: {modelName}
              </Title>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              fontSize: "1.2em",
              fontWeight: "bold",
            }}
          >
            {currentTime.toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <Button
            icon={<ExpandOutlined />}
            onClick={() => setIsFullscreen(true)}
            style={{ marginTop: 16 }}
            block
          >
            フルスクリーン表示
          </Button>
        </Card>

        <Modal
          title={null}
          open={isFullscreen}
          onCancel={() => setIsFullscreen(false)}
          footer={null}
          width="100%"
          style={{
            top: 0,
            paddingBottom: 0,
          }}
          styles={{
            body: {
              minHeight: "100vh",
              padding: "20px",
              backgroundColor: token.colorBgContainer,
              color: token.colorText,
            },
          }}
        >
          <FullscreenDisplay />
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default TimerApp;
