"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  Button,
  InputNumber,
  Card,
  Typography,
  Modal,
  Slider,
  Progress,
  ConfigProvider,
  Switch,
  Input,
  Segmented,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  UndoOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  StopOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { theme } from "antd";
import { useSwipeable } from "react-swipeable";
import useSound from "use-sound";

import alarmMP3 from "@/assets/alarms/alarm.mp3";
import bellMP3 from "@/assets/alarms/bell.mp3";
import pigeonMP3 from "@/assets/alarms/pigeon.mp3";
import warningMP3 from "@/assets/alarms/warning.mp3";

import PhotoSessionRecordTable from "./PhotoSessionRecordTable";

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

interface SessionData {
  timestamp: number;
  photographerCount: number;
  timeLimit: number;
  rounds: number;
}

const TimeLimitInput = memo(
  ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) => {
    const [localValue, setLocalValue] = useState<number | null>(value);

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
          onClick={handleReset}
          icon={<UndoOutlined />}
          size="small"
          style={{ marginLeft: 4 }}
        />
      </div>
    );
  }
);

TimeLimitInput.displayName = "TimeLimitInput";

// 撮影者数入力用のコンポーネ��トを追加
const PhotographerCountInput = memo(
  ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) => {
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

// 音量調整用のコンポーネントを追加
const VolumeSlider = memo(
  ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) => {
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
  }
);

VolumeSlider.displayName = "VolumeSlider";

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
  const [modelName, setModelName] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTime, setActiveTime] = useState(0); // 実際の撮影時間
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  const { token } = theme.useToken();

  // 音量制御
  useEffect(() => {
    if (mainAlarmRef.current) {
      mainAlarmRef.current.volume = volume / 100;
    }
  }, [volume]);

  // タイマー制御関数を修正
  const startTimer = () => {
    setTimerStatus("running");
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

  const pauseTimer = () => {
    setTimerStatus("paused");
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const stopTimer = () => {
    setTimerStatus("stopped");
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeLeft(timeLimit);
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

      // イマをリセット
      setTimeLeft(timeLimit);
    }
  }, [timeLeft, isRunning, totalPhotographers, timeLimit]);

  const showResetModal = () => {
    setIsResetModalOpen(true);
  };

  const handleResetCancel = () => {
    setIsResetModalOpen(false);
  };

  const handleResetConfirm = () => {
    setCurrentPhotographer(1);
    setRound(1);
    setTimeLeft(timeLimit);
    setIsRunning(false);
    setActiveTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsResetModalOpen(false);
  };

  // 古いhandleResetをき換え
  const handleReset = () => {
    showResetModal();
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
      const { isDark } = JSON.parse(savedTheme);
      console.log("savedTheme", savedTheme);
      console.log("isDark", isDark);
      setIsDarkMode(isDark);
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
      })
    );
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("modelName", modelName);
  }, [modelName]);

  // 時間の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // swipeHandlers メモ化
  const swipeHandlers = useSwipeable({
    onSwipedLeft: useCallback(() => {
      setCurrentPhotographer((prev) => {
        if (prev >= totalPhotographers) {
          setRound((r) => r + 1);
          return 1;
        }
        return prev + 1;
      });
    }, [totalPhotographers]),
    onSwipedRight: useCallback(() => {
      if (isRunning) {
        stopTimer();
      } else {
        startTimer();
      }
    }, [isRunning]),
    onSwipedUp: useCallback(() => {
      handleReset();
    }, []),
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

  const handleTimeLimitChange = useCallback((newValue: number) => {
    setTimeLimit(newValue);
    setTimeLeft(newValue);
  }, []);

  const increaseTimeLimit = useCallback((increment: number) => {
    setTimeLimit((prev) => {
      const newValue = prev + increment;
      setTimeLeft(newValue);
      return newValue;
    });
  }, []);

  const handlePhotographerCountChange = useCallback((newValue: number) => {
    setTotalPhotographers(newValue);
  }, []);

  const handleVolumeChange = useCallback((newValue: number) => {
    setVolume(newValue);
  }, []);

  // タイマー画面のコンポーネント
  const TimerContent = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // 親要素の高さいっぱいに
        paddingBottom: 80,
      }}
    >
      {/* 上部のタイマー表示部分 */}
      <div>
        {modelName && (
          <Title
            level={4}
            style={{ marginTop: 32, marginBottom: 16, textAlign: "center" }}
          >
            モデル: {modelName}
          </Title>
        )}

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            {round}巡目&nbsp;({currentPhotographer}／{totalPhotographers})
          </Title>
          <Title level={3}>
            {/* 現在の撮影者: {currentPhotographer}番 */}
            現在の撮影者
          </Title>

          {/* <Title level={2}>{timeLeft}秒</Title> */}
        </div>

        <div style={{ marginLeft: 32, marginRight: 32 }}>
          <Progress
            percent={(timeLeft / timeLimit) * 100}
            showInfo={false}
            status={timeLeft <= 10 ? "exception" : "active"}
            style={{ marginTop: 20, marginBottom: 20 }}
          />
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Card
              bordered={false}
              style={{
                backgroundColor: token.colorText,
                height: "100%", // カードの高さを100%に
              }}
            >
              <Statistic
                title={<UserOutlined />}
                value={currentPhotographer}
                suffix="番"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%", // Statisticの高さも100%に
                }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card
              bordered={false}
              style={{
                backgroundColor: token.colorText,
                height: "100%", // カードの高さを100%に
              }}
            >
              <Statistic
                title={<ClockCircleOutlined />}
                value={timeLeft}
                suffix="秒"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%", // Statisticの高さも100%に
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* 下部のコントロール部分（flexで下部に押し出す） */}
      <div
        style={{
          marginTop: "auto", // 上部との空きスペースを自動調整
        }}
      >
        {/* サブコントロール */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Button
            danger
            type="text"
            disabled={timerStatus === "stopped" || timerStatus === "running"}
            icon={<StopOutlined />}
            onClick={stopTimer}
            size="middle"
          >
            停止
          </Button>
          <Button
            type="text"
            disabled={timerStatus === "running"}
            icon={<UndoOutlined />}
            onClick={handleReset}
            size="middle"
          >
            リセット
          </Button>
        </div>

        {/* メインのタイマーコントロール */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {timerStatus === "stopped" && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={startTimer}
              size="large"
              style={{
                width: "80%",
                height: 48,
              }}
            >
              開始
            </Button>
          )}
          {timerStatus === "running" && (
            <Button
              type="primary"
              icon={<PauseCircleOutlined />}
              onClick={pauseTimer}
              size="large"
              style={{
                width: "80%",
                height: 48,
              }}
            >
              一時停止
            </Button>
          )}
          {timerStatus === "paused" && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={startTimer}
              size="large"
              style={{
                width: "80%",
                height: 48,
              }}
            >
              再開
            </Button>
          )}
        </div>
      </div>

      {/* 合計撮影時間の表示を追加 */}
      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          paddingBottom: 48, // 下部ナビゲーションの高さ分余白
          color: token.colorTextSecondary,
        }}
      >
        <Text>合計撮影時間: {formatTime(activeTime)}</Text>
      </div>
    </div>
  );

  // 設定画面のコンポーネント
  const SettingsContent = () => (
    <>
      <div style={{ marginTop: 32, marginBottom: 20 }}>
        <Input
          placeholder="モデル名を入力"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          style={{ marginBottom: 8 }}
        />
      </div>

      <TimeLimitInput value={timeLimit} onChange={handleTimeLimitChange} />

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
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

      <PhotographerCountInput
        value={totalPhotographers}
        onChange={handlePhotographerCountChange}
      />

      <VolumeSlider value={volume} onChange={handleVolumeChange} />

      <div style={{ marginBottom: 20 }}>
        <Text>アラーム音:&nbsp;&nbsp;</Text>
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
        <Text>テーマ:&nbsp;&nbsp;</Text>
        <Switch
          checked={isDarkMode}
          onChange={(checked) => setIsDarkMode(checked)}
          checkedChildren="🌙"
          unCheckedChildren="☀"
        />
      </div>
    </>
  );

  // メモコンテンツのコンポーネントを追加
  const MemoContent = () => (
    <PhotoSessionRecordTable totalPhotographers={totalPhotographers} />
  );

  const [activeTab, setActiveTab] = useState<"timer" | "memo" | "settings">(
    "timer"
  );
  const [timerStatus, setTimerStatus] = useState<
    "stopped" | "running" | "paused"
  >("stopped");

  // メーマ切り替え処理をuseCallbackで最適化
  const handleThemeChange = useCallback((checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem(
      "timerTheme",
      JSON.stringify({
        isDark: checked,
      })
    );
  }, []);

  // メインのレンダリング部分を修正
  return (
    <ConfigProvider theme={themeConfig}>
      <style>{`
        .ant-card {
          background-color: ${token.colorText} !important;
          height: calc(100% - 80px);
        }
        .ant-card-body {
          // background-color: ${token.colorText} !important;
          background-color: ${
            isDarkMode ? token.colorText : token.colorBgLayout
          } !important;
          color: ${token.colorText} !important;
          height: 100%;
        }
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          padding: 8px 0;
          background-color: ${token.colorBgContainer};
          border-top: 1px solid ${token.colorBorder};
          z-index: 1000;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4px 24px;
          cursor: pointer;
          color: ${token.colorTextSecondary};
        }
        .nav-item.active {
          color: ${token.colorPrimary};
        }
        .nav-item-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .nav-item-label {
          font-size: 12px;
        }
      `}</style>

      <div
        style={{
          height: "100vh",
          minHeight: "100vh",
          minWidth: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: token.colorBgLayout,
          color: token.colorText,
        }}
      >
        <div
          {...swipeHandlers}
          style={{
            height: "100%",
            maxWidth: 400,
            margin: "0 auto",
            backgroundColor: token.colorBgContainer,
          }}
        >
          <Card
            style={{
              height: "100%",
              borderRadius: 0,
              backgroundColor: token.colorBgElevated,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Switch
                checked={isDarkMode}
                onChange={handleThemeChange}
                checkedChildren="🌙"
                unCheckedChildren="☀"
                size="small"
              />
              <div
                style={{
                  color: token.colorText,
                  fontSize: "1.2em",
                  fontWeight: "bold",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {currentTime.toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setActiveTab("settings")}
                size="small"
                style={{
                  color:
                    activeTab === "settings"
                      ? token.colorPrimary
                      : token.colorText,
                }}
              />
            </div>

            <div
              className="bottom-nav"
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: token.colorBgElevated,
                borderTop: `1px solid ${token.colorBorder}`,
                padding: "8px 0",
                display: "flex",
                justifyContent: "space-around",
                maxWidth: 400,
                margin: "0 auto",
                zIndex: 1000,
              }}
            >
              <Button
                type="text"
                style={{
                  color:
                    activeTab === "timer"
                      ? token.colorPrimary
                      : token.colorText,
                  flex: 1,
                  height: 64,
                }}
                onClick={() => setActiveTab("timer")}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <ClockCircleOutlined style={{ fontSize: "24px" }} />
                  <span>タイマー</span>
                </div>
              </Button>
              <Button
                type="text"
                style={{
                  color:
                    activeTab === "memo" ? token.colorPrimary : token.colorText,
                  flex: 1,
                  height: 64,
                }}
                onClick={() => setActiveTab("memo")}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FileTextOutlined style={{ fontSize: "24px" }} />
                  <span>メモ</span>
                </div>
              </Button>
            </div>

            {activeTab === "timer" && <TimerContent />}
            {activeTab === "memo" && <MemoContent />}
            {activeTab === "settings" && <SettingsContent />}
          </Card>

          <Modal
            title={null}
            open={false}
            onCancel={() => {}}
            footer={null}
            centered
            width="100%"
            styles={{
              mask: {
                backgroundColor: token.colorBgContainer,
              },
              content: {
                padding: 0,
                height: "100vh",
                maxWidth: "100vw",
                top: 0,
                margin: 0,
                backgroundColor: token.colorBgContainer,
              },
              body: {
                padding: 0,
                height: "100vh",
              },
            }}
          ></Modal>

          <Modal
            title="リセット確認"
            open={isResetModalOpen}
            onOk={handleResetConfirm}
            onCancel={handleResetCancel}
            okText="リセット"
            cancelText="キャンセル"
          >
            <p>すべての設定と進行状況をリセットしますか？</p>
          </Modal>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default TimerApp;
