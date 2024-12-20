import React, { memo } from "react";
import { Button } from "antd";
import { ClockCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { theme } from "antd";

interface BottomNavProps {
  activeTab: "timer" | "memo" | "settings";
  setActiveTab: (tab: "timer" | "memo" | "settings") => void;
}

const BottomNav = memo(({ activeTab, setActiveTab }: BottomNavProps) => {
  const { token } = theme.useToken();

  return (
    <div
      className="bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: token.colorBgElevated,
        borderTop: `1px solid ${token.colorBorder}`,
        padding: "8px",
        display: "flex",
        justifyContent: "space-around",
        maxWidth: 400,
        margin: "0 auto",
        zIndex: 1000,
        height: "64px",
      }}
    >
      <Button
        type="text"
        style={{
          color: activeTab === "timer" ? token.colorPrimary : token.colorText,
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
          color: activeTab === "memo" ? token.colorPrimary : token.colorText,
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
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
