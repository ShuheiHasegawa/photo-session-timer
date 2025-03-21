"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { App, Modal, ConfigProvider, theme, message } from "antd";
import useSound from "use-sound";

import alarmMP3 from "@/assets/alarms/alarm.mp3";
// import bellMP3 from "@/assets/alarms/bell.mp3";
// import pigeonMP3 from "@/assets/alarms/pigeon.mp3";
import belldingMP3 from "@/assets/alarms/bellding.mp3";
import dogBarkMP3 from "@/assets/alarms/dog-bark.mp3";
import catMeowMP3 from "@/assets/alarms/cat-meow-1.mp3";
import coinMP3 from "@/assets/alarms/coin.mp3";
import notificationMP3 from "@/assets/alarms/notification-18.mp3";
import notification2MP3 from "@/assets/alarms/notification-22.mp3";
import tone1MP3 from "@/assets/alarms/tone1.mp3";
import tone2MP3 from "@/assets/alarms/tone2.mp3";
import tone3MP3 from "@/assets/alarms/tone3.mp3";
import tone4MP3 from "@/assets/alarms/tone4.mp3";

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
  const [selectedWarningAlarm, setSelectedWarningAlarm] =
    useState<string>("default");
  const [selectedWarningHalfAlarm, setSelectedWarningHalfAlarm] =
    useState<string>("default");

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
        // 10秒前にアラームを鳴らす
        if (prevTime === 11) {
          playWarningLast10Seconds();
        }
        // 半分の時間経過時に中間時間アラームを鳴らす
        if (prevTime === Math.ceil(timeLimit / 2)) {
          playWarningHalf();
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
    message.success("全ての進行状況をリセットしました");
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
  const [playTone1, { stop: stopTone1 }] = useSound(tone1MP3, {
    volume: volume / 100,
  });
  const [playTone2, { stop: stopTone2 }] = useSound(tone2MP3, {
    volume: volume / 100,
  });
  const [playTone3, { stop: stopTone3 }] = useSound(tone3MP3, {
    volume: volume / 100,
  });
  const [playTone4, { stop: stopTone4 }] = useSound(tone4MP3, {
    volume: volume / 100,
  });

  // すべての音を停止する関数
  const stopAllSounds = useCallback(() => {
    stopDefault();
    // stopBell();
    // stopPigeon();
    stopBellding();
    stopCatMeow();
    stopDogBark();
    stopCoin();
    stopNotification();
    stopNotification2();
    stopTone1();
    stopTone2();
    stopTone3();
    stopTone4();
  }, [
    stopDefault,
    stopBellding,
    stopCatMeow,
    stopDogBark,
    stopCoin,
    stopNotification,
    stopNotification2,
    stopTone1,
    stopTone2,
    stopTone3,
    stopTone4,
  ]);

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

  // 選択されたアラーム音を再生する関数
  const playSelectedAlarm = useCallback(() => {
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
  }, [
    selectedAlarm,
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
  ]);

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
  }, [
    timeLeft,
    isRunning,
    currentPhotographer,
    totalPhotographers,
    timeLimit,
    playSelectedAlarm,
  ]);

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

  const playWarningLast10Seconds = useCallback(() => {
    stopAllSounds();
    switch (selectedWarningAlarm) {
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
  }, [
    selectedWarningAlarm,
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
  ]);

  // LocalStorageに保存
  useEffect(() => {
    localStorage.setItem("warningAlarm", selectedWarningAlarm);
  }, [selectedWarningAlarm]);

  // LocalStorageから読み込み
  useEffect(() => {
    const savedWarningAlarm = localStorage.getItem("warningAlarm");
    if (savedWarningAlarm) {
      setSelectedWarningAlarm(savedWarningAlarm);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("warningHalfAlarm", selectedWarningHalfAlarm);
  }, [selectedWarningHalfAlarm]);

  useEffect(() => {
    const savedWarningHalfAlarm = localStorage.getItem("warningHalfAlarm");
    if (savedWarningHalfAlarm) {
      setSelectedWarningHalfAlarm(savedWarningHalfAlarm);
    }
  }, []);

  // playWarningHalf関数を追加
  const playWarningHalf = useCallback(() => {
    stopAllSounds();
    switch (selectedWarningHalfAlarm) {
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
  }, [
    selectedWarningHalfAlarm,
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
  ]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
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
            <div style={{ paddingTop: "16px", paddingBottom: "16px" }}>
              <div style={{ paddingLeft: "16px", paddingRight: "16px" }}>
                <Header
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  currentTime={currentTime}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
              {activeTab === "timer" && (
                <div style={{ paddingLeft: "16px", paddingRight: "16px" }}>
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
                </div>
              )}
              {activeTab === "memo" && <MemoContent />}
              {activeTab === "settings" && (
                <div 
                  style={{
                    height: "calc(100vh - 150px)", // 下部ナビゲーションと上部余白を考慮
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch", // iOSでのスムーススクロール
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
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
                    playTone1={playTone1}
                    playTone2={playTone2}
                    playTone3={playTone3}
                    playTone4={playTone4}
                    stopAllSounds={stopAllSounds}
                    waveColors={waveColors}
                    onWaveColorChange={handleWaveColorChange}
                    selectedWarningAlarm={selectedWarningAlarm}
                    setSelectedWarningAlarm={setSelectedWarningAlarm}
                    selectedWarningHalfAlarm={selectedWarningHalfAlarm}
                    setSelectedWarningHalfAlarm={setSelectedWarningHalfAlarm}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </App>
    </ConfigProvider>
  );
};

export default TimerApp;
