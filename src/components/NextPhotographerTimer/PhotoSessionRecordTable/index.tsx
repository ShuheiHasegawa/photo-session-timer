import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message } from "antd";
import { useTheme } from "antd-style";
import { PlusOutlined, MinusOutlined, CopyOutlined } from "@ant-design/icons";
import { PhotoSessionRecords, PhotoSessionRecordTableProps } from "./types";

// 定数として bottom-nav の高さを定義
const BOTTOM_NAV_HEIGHT = 81; // 64px(height) + 16px(padding) + 1px(border)

const CounterCell = memo(
  ({
    value,
    photographerId,
    type,
    onUpdate,
  }: {
    value: number;
    photographerId: number;
    type: "cheki" | "selfie";
    onUpdate: (
      photographerId: number,
      type: "cheki" | "selfie",
      increment: boolean
    ) => void;
  }) => {
    const handleClick = useCallback(
      (increment: boolean) => {
        onUpdate(photographerId, type, increment);
      },
      [photographerId, type, onUpdate]
    );

    return (
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}
      >
        <Button
          size="small"
          onClick={() => handleClick(false)}
          icon={<MinusOutlined />}
        />
        <span style={{ minWidth: "2em", textAlign: "center" }}>{value}</span>
        <Button
          size="small"
          onClick={() => handleClick(true)}
          icon={<PlusOutlined />}
        />
      </div>
    );
  }
);

CounterCell.displayName = "CounterCell";

const CopyButton = memo(({ records }: { records: PhotoSessionRecords }) => {
  const handleCopy = useCallback(() => {
    const text = Object.entries(records)
      .map(
        ([id, record]) =>
          `撮影者${id}: チェキ${record.cheki}枚, 写メ${record.selfie}枚`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    message.success("集計データをコピーしました");
  }, [records]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        type="primary"
        icon={<CopyOutlined />}
        onClick={handleCopy}
        size="large"
        style={{
          width: "80%",
          height: 48,
        }}
      >
        集計データをコピー
      </Button>
    </div>
  );
});

CopyButton.displayName = "CopyButton";

const PhotoSessionRecordTable = memo(
  ({ totalPhotographers }: PhotoSessionRecordTableProps) => {
    const theme = useTheme();

    // ローカルストレージから初期状態を読み込む
    const [records, setRecords] = useState<PhotoSessionRecords>(() => {
      // 初期値を空のオブジェクトで設定
      const initialRecords: PhotoSessionRecords = {};
      for (let i = 1; i <= totalPhotographers; i++) {
        initialRecords[i] = { cheki: 0, selfie: 0 };
      }
      return initialRecords;
    });

    // localStorage関連の処理をクライアントサイドでのみ実行
    useEffect(() => {
      const saved = localStorage.getItem("photo-session-records");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length === totalPhotographers) {
          setRecords(parsed);
        }
      }
    }, [totalPhotographers]);

    // 撮影者数が変更された場合の処理
    useEffect(() => {
      const newRecords: PhotoSessionRecords = {};
      for (let i = 1; i <= totalPhotographers; i++) {
        newRecords[i] = records[i] || { cheki: 0, selfie: 0 };
      }
      setRecords(newRecords);
    }, [totalPhotographers]);

    // レコードが更新されたらローカルストレージに保存
    useEffect(() => {
      localStorage.setItem("photo-session-records", JSON.stringify(records));
    }, [records]);

    const updateValue = useCallback(
      (
        photographerId: number,
        type: "cheki" | "selfie",
        increment: boolean
      ) => {
        setRecords((prev) => {
          const newRecords = {
            ...prev,
            [photographerId]: {
              ...prev[photographerId],
              [type]: Math.max(
                0,
                prev[photographerId][type] + (increment ? 1 : -1)
              ),
            },
          };
          return newRecords;
        });
      },
      []
    );

    const columns = useMemo(
      () => [
        {
          title: "撮影者",
          dataIndex: "id",
          render: (id: number) => `${id}`,
          width: 100,
          align: "center" as const,
        },
        {
          title: "チェキ",
          dataIndex: "cheki",
          render: (value: number, record: { id: number }) => (
            <CounterCell
              value={value}
              photographerId={record.id}
              type="cheki"
              onUpdate={updateValue}
            />
          ),
          width: 120,
          align: "center" as const,
        },
        {
          title: "デジタル",
          dataIndex: "selfie",
          render: (value: number, record: { id: number }) => (
            <CounterCell
              value={value}
              photographerId={record.id}
              type="selfie"
              onUpdate={updateValue}
            />
          ),
          width: 120,
          align: "center" as const,
        },
      ],
      [updateValue]
    );

    const dataSource = useMemo(
      () =>
        Object.entries(records).map(([id, record]) => ({
          key: id,
          id: Number(id),
          ...record,
        })),
      [records]
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: "calc(100vh - 180px)",
          marginTop: 32,
        }}
      >
        <style jsx global>{`
          .ant-table-row:nth-child(odd) {
            background-color: ${theme.colorBgContainer};
          }
          .ant-table-row:nth-child(even) {
            background-color: ${theme.colorFillAlter};
          }
          .ant-table-cell {
            background-color: inherit !important;
          }
          .ant-table-row:hover > td {
            background-color: ${theme.colorFillSecondary} !important;
          }
        `}</style>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginBottom: 16,
          }}
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            size="small"
            scroll={{ y: "calc(100vh - 280px)" }}
            sticky
            style={{
              backgroundColor: theme.colorBgContainer,
            }}
          />
        </div>
        <div
          style={{
            position: "fixed",
            bottom: BOTTOM_NAV_HEIGHT,
            left: 0,
            right: 0,
            backgroundColor: theme.colorBgContainer,
            borderTop: `1px solid ${theme.colorBorder}`,
            padding: "16px",
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          <CopyButton records={records} />
        </div>
      </div>
    );
  }
);

PhotoSessionRecordTable.displayName = "PhotoSessionRecordTable";

export default PhotoSessionRecordTable;

