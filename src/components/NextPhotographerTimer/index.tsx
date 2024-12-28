"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { App, Modal } from "antd";
import { ThemeProvider } from "antd-style";
import useSound from "use-sound";

import alarmMP3 from "@/assets/alarms/alarm.mp3";
// import bellMP3 from "@/assets/alarms/bell.mp3";
// import pigeonMP3 from "@/assets/alarms/pigeon.mp3";
import warningMP3 from "@/assets/alarms/warning.mp3";
import belldingMP3 from "@/assets/alarms/bellding.mp3";
import dogBarkMP3 from "@/assets/alarms/dog-bark.mp3";
import catMeowMP3 from "@/assets/alarms/cat-meow-1.mp3";
import coinMP3 from "@/assets/alarms/coin.mp3";
import notificationMP3 from "@/assets/alarms/notification-18.mp3";
import notification2MP3 from "@/assets/alarms/notification-22.mp3";

import PhotoSessionRecordTable from "./PhotoSessionRecordTable";
import Settings from "./Settings";
import TimerContent from "./TimerContent";
import BottomNav from "./BottomNav";
import Header from "./Header";
import { DEFAULT_WAVE_COLORS, WaveColors } from "./WaveAnimation/colors";

interface SessionData {
  timestamp: number;
  photographerCount: number;
  timeLimit: number;
  rounds: number;
}

const TimerApp = () => {
  const [currentPhotographer, setCurrentPhotographer] = useState(1);
  const [totalPhotographers, setTotalPhotographers] = useState(5);
  const [round, setRound] = useState(1);
  const [timeLimit, setTimeLimit] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [volume, setVolume] = useState(50);
  const mainAlarmRef = useRef<HTMLAudioElement>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTime, setActiveTime] = useState(0); // 実際の撮影時間
  const [waveColors, setWaveColors] = useState<WaveColors>(DEFAULT_WAVE_COLORS);

  useEffect(() => {
    const saved = localStorage.getItem("theme-mode");
    setIsDarkMode(saved ? saved === "dark" : false);

    const savedModelName = localStorage.getItem("modelName");
    if (savedModelName) {
      setModelName(savedModelName);
    }
  }, []);

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
      // activeTimeを1秒ずつ増やす
      setActiveTime((prev) => prev + 1);
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

  // タイマーの監視を修正
  useEffect(() => {
    if (timeLeft <= 0 && isRunning) {
      // タイマー完了時の処理
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRunning(false);
      setTimerStatus("stopped");
      playSelectedAlarm();

      // 次の撮影者への移行
      if (currentPhotographer >= totalPhotographers) {
        // 最後の撮影者の場合
        setCurrentPhotographer(1);
        setRound((r) => r + 1);
      } else {
        // それ以外の場合
        setCurrentPhotographer((prev) => prev + 1);
      }

      // タイマーをリセット
      setTimeLeft(timeLimit);
    }
  }, [timeLeft, isRunning, currentPhotographer, totalPhotographers, timeLimit]);

  const handleResetConfirm = () => {
    setCurrentPhotographer(1);
    setRound(1);
    setTimeLeft(timeLimit);
    setIsRunning(false);
    setActiveTime(0);
    setTimerStatus("stopped");
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleReset = () => {
    Modal.confirm({
      title: "リセットの確認",
      content: "全ての進行状況をリセットしますか？",
      okText: "リセット",
      cancelText: "キャンセル",
      onOk: handleResetConfirm,
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
      const { isDark } = JSON.parse(savedTheme);
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

  // 合時間の表示フォーマット関数
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
  // const [playBell, { stop: stopBell }] = useSound(bellMP3, {
  //   volume: volume / 100,
  // });
  // const [playPigeon, { stop: stopPigeon }] = useSound(pigeonMP3, {
  //   volume: volume / 100,
  // });
  const [playWarning, { stop: stopWarning }] = useSound(warningMP3, {
    volume: volume / 100,
  });
  const [playBellding, { stop: stopBellding }] = useSound(belldingMP3, {
    volume: volume / 100,
  });
  const [playCatMeow, { stop: stopCatMeow }] = useSound(catMeowMP3, {
    volume: volume / 100,
  });
  const [playDogBark, { stop: stopDogBark }] = useSound(dogBarkMP3, {
    volume: volume / 100,
  });
  const [playCoin, { stop: stopCoin }] = useSound(coinMP3, {
    volume: volume / 100,
  });
  const [playNotification, { stop: stopNotification }] = useSound(
    notificationMP3,
    {
      volume: volume / 100,
    }
  );
  const [playNotification2, { stop: stopNotification2 }] = useSound(
    notification2MP3,
    {
      volume: volume / 100,
    }
  );

  // すべての音を停止する関数
  const stopAllSounds = () => {
    stopDefault();
    // stopBell();
    // stopPigeon();
    stopWarning();
    stopBellding();
    stopCatMeow();
    stopDogBark();
    stopCoin();
    stopNotification();
    stopNotification2();
  };

  // 選択されたアラーム音を再生する関数
  const playSelectedAlarm = () => {
    stopAllSounds();
    switch (selectedAlarm) {
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

  // 設定画面のコンポーネント
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
  // const handleThemeChange = useCallback((checked: boolean) => {
  //   setIsDarkMode(checked);
  //   localStorage.setItem(
  //     "timerTheme",
  //     JSON.stringify({
  //       isDark: checked,
  //     })
  //   );
  // }, []);

  // 定数として bottom-nav の高さを定義
  const BOTTOM_NAV_HEIGHT = 81; // 64px(height) + 16px(padding) + 1px(border)

  useEffect(() => {
    const savedColors = localStorage.getItem("wave-colors");
    if (savedColors) {
      setWaveColors(JSON.parse(savedColors));
    }
  }, []);

  const handleWaveColorChange = useCallback(
    (
      mode: "normal" | "danger",
      key: "primary" | "wave1" | "wave2",
      color: string
    ) => {
      setWaveColors((prev) => {
        const newColors = {
          ...prev,
          [mode]: {
            ...prev[mode],
            [key]: color,
          },
        };
        // 新しい状態をLocalStorageに保存
        localStorage.setItem("wave-colors", JSON.stringify(newColors));
        return newColors;
      });
    },
    [] // waveColorsへの依存を削除
  );

  // メインのンダリング部分を修正
  return (
    <ThemeProvider themeMode={isDarkMode ? "dark" : "light"}>
      <App>
        <div
          style={{
            backgroundColor: isDarkMode ? "#141414" : "#f0f2f5",
            height: "100vh",
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: 400,
              width: "100%",
              height: `calc(100% - ${BOTTOM_NAV_HEIGHT}px)`,
              margin: "0 auto",
            }}
          >
            <div style={{ padding: "16px" }}>
              <Header
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                currentTime={currentTime}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              {activeTab === "timer" && (
                <TimerContent
                  modelName={modelName}
                  round={round}
                  currentPhotographer={currentPhotographer}
                  totalPhotographers={totalPhotographers}
                  timeLeft={timeLeft}
                  timeLimit={timeLimit}
                  timerStatus={timerStatus}
                  activeTime={activeTime}
                  startTimer={startTimer}
                  pauseTimer={pauseTimer}
                  stopTimer={stopTimer}
                  handleReset={handleReset}
                  formatTime={formatTime}
                  waveColors={waveColors}
                />
              )}
              {activeTab === "memo" && <MemoContent />}
              {activeTab === "settings" && (
                <Settings
                  modelName={modelName}
                  setModelName={setModelName}
                  timeLimit={timeLimit}
                  handleTimeLimitChange={handleTimeLimitChange}
                  increaseTimeLimit={increaseTimeLimit}
                  totalPhotographers={totalPhotographers}
                  handlePhotographerCountChange={handlePhotographerCountChange}
                  volume={volume}
                  handleVolumeChange={handleVolumeChange}
                  selectedAlarm={selectedAlarm}
                  setSelectedAlarm={setSelectedAlarm}
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  playDefault={playDefault}
                  // playBell={playBell}
                  // playPigeon={playPigeon}
                  playBellding={playBellding}
                  playCatMeow={playCatMeow}
                  playDogBark={playDogBark}
                  playCoin={playCoin}
                  playNotification={playNotification}
                  playNotification2={playNotification2}
                  stopAllSounds={stopAllSounds}
                  waveColors={waveColors}
                  onWaveColorChange={handleWaveColorChange}
                />
              )}
            </div>
          </div>
        </div>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </App>
    </ThemeProvider>
  );
};

export default TimerApp;
