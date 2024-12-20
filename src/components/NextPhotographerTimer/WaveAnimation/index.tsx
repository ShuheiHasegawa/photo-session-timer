import React from "react";
import styled, { keyframes } from "styled-components";

const waveAnimation = keyframes`
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }
  50% {
    transform: translateX(-25%) translateZ(0) scaleY(0.55);
  }
  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
`;

const WaveWrapper = styled.div<{
  $percent: number;
  $isRunning: boolean;
  $isDanger: boolean;
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: ${(props) => props.$percent}%;
  background-color: ${(props) =>
    props.$isDanger ? "rgba(255,77,79,0.2)" : "rgba(24,144,255,0.2)"};
  transform-origin: center bottom;
  transition: height 0.3s ease;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background-repeat: repeat-x;
    background-position: 0 bottom;
    background-size: 50% 100%;
  }

  &::before {
    background-image: ${(props) =>
      `radial-gradient(ellipse at 50% 100%, ${
        props.$isDanger ? "#ff4d4f" : "#1890ff"
      } 0%, transparent 70%)`};
    animation: ${waveAnimation} ${(props) => (props.$isRunning ? "7s" : "0s")}
      infinite linear;
  }

  &::after {
    background-image: ${(props) =>
      `radial-gradient(ellipse at 50% 100%, ${
        props.$isDanger ? "#ff7875" : "#40a9ff"
      } 0%, transparent 70%)`};
    animation: ${waveAnimation} ${(props) => (props.$isRunning ? "13s" : "0s")}
      infinite linear;
    opacity: 0.5;
  }
`;

interface WaveAnimationProps {
  percent: number;
  isRunning: boolean;
  isDanger: boolean;
}

export const WaveAnimation = ({
  percent,
  isRunning,
  isDanger,
}: WaveAnimationProps) => {
  return (
    <WaveWrapper
      $percent={percent}
      $isRunning={isRunning}
      $isDanger={isDanger}
    />
  );
};
