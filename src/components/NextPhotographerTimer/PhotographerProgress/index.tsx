import React from "react";
import { UserOutlined, CheckOutlined } from "@ant-design/icons";
import { theme, Card, Statistic } from "antd";
import styled from "styled-components";

const ProgressContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
`;

const UserIconRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-basis: 100%;
`;

const UserIcon = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$active
      ? props.theme.colorPrimary
      : props.$completed
      ? props.theme.colorFillQuaternary
      : props.theme.colorFillSecondary};
  color: ${(props) =>
    props.$active
      ? "#fff"
      : props.$completed
      ? props.theme.colorTextQuaternary
      : props.theme.colorTextSecondary};
  opacity: ${(props) => (props.$completed ? 0.7 : 1)};
  transition: all 0.3s ease;

  &:hover {
    transform: ${(props) => (props.$active ? "scale(1.1)" : "none")};
  }
`;

interface PhotographerProgressProps {
  round: number;
  currentPhotographer: number;
  totalPhotographers: number;
}

export const PhotographerProgress = ({
  round,
  currentPhotographer,
  totalPhotographers,
}: PhotographerProgressProps) => {
  const { token } = theme.useToken();

  return (
    <Card
      bordered={false}
      style={{
        backgroundColor: token.colorBgContainer,
      }}
    >
      <Statistic
        title={`${round}巡目 - ${currentPhotographer}番目`}
        value={`${currentPhotographer}／${totalPhotographers}`}
        valueRender={(value) => (
          <ProgressContainer>
            {Array.from({ length: Math.ceil(totalPhotographers / 5) }).map(
              (_, rowIndex) => (
                <UserIconRow key={rowIndex}>
                  {Array.from({
                    length: Math.min(5, totalPhotographers - rowIndex * 5),
                  }).map((_, colIndex) => {
                    const index = rowIndex * 5 + colIndex;
                    const isCompleted = index + 1 < currentPhotographer;
                    const isActive = index + 1 === currentPhotographer;
                    return (
                      <UserIcon
                        key={index}
                        $active={isActive}
                        $completed={isCompleted}
                        style={{
                          backgroundColor:
                            isActive
                              ? token.colorPrimary
                              : isCompleted
                              ? token.colorFillQuaternary
                              : token.colorFillSecondary,
                          color:
                            isActive
                              ? "#fff"
                              : isCompleted
                              ? token.colorTextQuaternary
                              : token.colorTextSecondary,
                        }}
                      >
                        {isCompleted ? (
                          <CheckOutlined style={{ fontSize: 16 }} />
                        ) : (
                          <UserOutlined style={{ fontSize: 20 }} />
                        )}
                      </UserIcon>
                    );
                  })}
                </UserIconRow>
              )
            )}
          </ProgressContainer>
        )}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </Card>
  );
};
