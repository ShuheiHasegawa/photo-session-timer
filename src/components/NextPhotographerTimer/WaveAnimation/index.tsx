import React from "react";
import styled, { keyframes } from "styled-components";
import { DEFAULT_WAVE_COLORS, WaveColors } from "./colors";

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

interface WaveWrapperProps {
  $percent: number;
  $isRunning: boolean;
  $isDanger: boolean;
  $colors: WaveColors;
}

const WaveWrapper = styled.div<WaveWrapperProps>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: ${(props) => props.$percent}%;
  background-color: ${(props) =>
    props.$isDanger
      ? props.$colors.danger.primary
      : props.$colors.normal.primary};
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
        props.$isDanger
          ? props.$colors.danger.wave1
          : props.$colors.normal.wave1
      } 0%, transparent 70%)`};
    animation: ${waveAnimation} ${(props) => (props.$isRunning ? "7s" : "0s")}
      infinite linear;
  }

  &::after {
    background-image: ${(props) =>
      `radial-gradient(ellipse at 50% 100%, ${
        props.$isDanger
          ? props.$colors.danger.wave2
          : props.$colors.normal.wave2
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
  colors?: WaveColors;
}

export const WaveAnimation = ({
  percent,
  isRunning,
  isDanger,
  colors = DEFAULT_WAVE_COLORS,
}: WaveAnimationProps) => {
  return (
    <WaveWrapper
      $percent={percent}
      $isRunning={isRunning}
      $isDanger={isDanger}
      $colors={colors}
    />
  );
};
