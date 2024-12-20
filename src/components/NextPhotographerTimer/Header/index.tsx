import React, { memo } from "react";
import { Button, Switch } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useTheme } from "antd-style";

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  currentTime: Date;
  activeTab: string;
  setActiveTab: (tab: "timer" | "memo" | "settings") => void;
}

const Header = memo(
  ({
    isDarkMode,
    setIsDarkMode,
    currentTime,
    activeTab,
    setActiveTab,
  }: HeaderProps) => {
    const theme = useTheme();

    return (
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
          onChange={setIsDarkMode}
          checkedChildren="🌙"
          unCheckedChildren="🌞"
          style={{
            backgroundColor: isDarkMode ? theme.colorPrimary : undefined,
          }}
        />
        <div
          style={{
            color: theme.colorText,
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
          style={{
            color:
              activeTab === "settings" ? theme.colorPrimary : theme.colorText,
          }}
        />
      </div>
    );
  }
);

Header.displayName = "Header";

export default Header;
