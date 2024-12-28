export const DEFAULT_WAVE_COLORS = {
  normal: {
    primary: "rgba(24,144,255,0.2)", // 通常時の波の背景色
    wave1: "#1890ff", // 通常時の第1波の色
    wave2: "#40a9ff", // 通常時の第2波の色
  },
  danger: {
    primary: "rgba(255,77,79,0.2)", // 危険時の波の背景色
    wave1: "#ff4d4f", // 危険時の第1波の色
    wave2: "#ff7875", // 危険時の第2波の色
  },
} as const;

export type WaveColors = typeof DEFAULT_WAVE_COLORS;
