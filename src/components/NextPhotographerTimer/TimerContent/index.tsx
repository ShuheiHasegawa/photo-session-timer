import React, { memo } from "react";
import { Button, Typography, Statistic, Space } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  UndoOutlined,
  StopOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { theme } from "antd";
import { WaveAnimation } from "../WaveAnimation";
import { PhotographerProgress } from "../PhotographerProgress";

const { Text } = Typography;

// 定数として bottom-nav の高さを定義
const BOTTOM_NAV_HEIGHT = 81; // 64px(height) + 16px(padding) + 1px(border)

interface TimerContentProps {
  modelName: string;
  round: number;
  currentPhotographer: number;
  totalPhotographers: number;
  timeLeft: number;
  timeLimit: number;
  timerStatus: "stopped" | "running" | "paused";
  activeTime: number;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  handleReset: () => void;
  formatTime: (seconds: number) => string;
}

const TimerContent = memo(
  ({
    modelName,
    round,
    currentPhotographer,
    totalPhotographers,
    timeLeft,
    timeLimit,
    timerStatus,
    activeTime,
    startTimer,
    pauseTimer,
    stopTimer,
    handleReset,
    formatTime,
  }: TimerContentProps) => {
    const { token } = theme.useToken();
    const progressPercent = (timeLeft / timeLimit) * 100;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: `calc(100vh - ${BOTTOM_NAV_HEIGHT + 280}px)`,
        }}
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "space-evenly",
          }}
        >
          {modelName && (
            <Statistic
              title="モデル"
              value={modelName}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          )}

          <PhotographerProgress
            round={round}
            currentPhotographer={currentPhotographer}
            totalPhotographers={totalPhotographers}
          />

          <div
            style={{
              position: "relative",
              height: 120,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: token.colorBgContainer,
              boxShadow: token.boxShadow,
            }}
          >
            <WaveAnimation
              percent={progressPercent}
              isRunning={timerStatus === "running"}
              isDanger={timeLeft <= 10}
            />

            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 32,
                fontWeight: "bold",
                color: timeLeft <= 10 ? token.colorError : token.colorText,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "color 0.3s ease",
              }}
            >
              <ClockCircleOutlined />
              &nbsp;&nbsp;{timeLeft}&nbsp;秒
            </div>
          </div>
        </Space>

        <div
          style={{
            marginTop: "auto",
            position: "fixed",
            bottom: BOTTOM_NAV_HEIGHT,
            left: 0,
            right: 0,
            backgroundColor: token.colorBgContainer,
            borderTop: `1px solid ${token.colorBorder}`,
            padding: "16px",
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
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
              onClick={() => handleReset()}
              size="middle"
            >
              リセット
            </Button>
          </div>

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

          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              color: token.colorTextSecondary,
            }}
          >
            <Text>合計撮影時間: {formatTime(activeTime)}</Text>
          </div>
        </div>
      </div>
    );
  }
);

TimerContent.displayName = "TimerContent";

export default TimerContent;
