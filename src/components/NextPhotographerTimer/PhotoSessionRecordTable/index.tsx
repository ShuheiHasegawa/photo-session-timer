import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message, Modal } from "antd";
import { useTheme } from "antd-style";
import { PlusOutlined, MinusOutlined, CopyOutlined, UndoOutlined } from "@ant-design/icons";
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

    // recordsの初期化ロジックを修正
    const [records, setRecords] = useState<PhotoSessionRecords>(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem("photo-session-records");
        if (saved) {
          const parsed = JSON.parse(saved);
          // 保存されたデータと現在の撮影者数が一致するかチェック
          if (Object.keys(parsed).length === totalPhotographers) {
            return parsed;
          }
        }
      }
      // 初期値を設定
      const initialRecords: PhotoSessionRecords = {};
      for (let i = 1; i <= totalPhotographers; i++) {
        initialRecords[i] = { cheki: 0, selfie: 0 };
      }
      return initialRecords;
    });

    // localStorage更新の処理を最適化
    useEffect(() => {
      const handleStorage = () => {
        const saved = localStorage.getItem("photo-session-records");
        if (saved) {
          const parsed = JSON.parse(saved);
          setRecords(parsed);
        }
      };

      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // 撮影者数変更時の処理を最適化
    useEffect(() => {
      const newRecords: PhotoSessionRecords = { ...records };
      let hasChanges = false;

      // 新しい撮影者を追加
      for (let i = 1; i <= totalPhotographers; i++) {
        if (!newRecords[i]) {
          newRecords[i] = { cheki: 0, selfie: 0 };
          hasChanges = true;
        }
      }

      // 余分な撮影者を削除
      Object.keys(newRecords).forEach(key => {
        if (Number(key) > totalPhotographers) {
          delete newRecords[key];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setRecords(newRecords);
        localStorage.setItem("photo-session-records", JSON.stringify(newRecords));
      }
    }, [totalPhotographers]);

    // 値更新の処理を最適化
    const updateValue = useCallback(
      (photographerId: number, type: "cheki" | "selfie", increment: boolean) => {
        setRecords(prev => {
          const newValue = Math.max(0, prev[photographerId][type] + (increment ? 1 : -1));
          const newRecords = {
            ...prev,
            [photographerId]: {
              ...prev[photographerId],
              [type]: newValue
            }
          };
          localStorage.setItem("photo-session-records", JSON.stringify(newRecords));
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

    // メモリセット機能を追加
    const handleMemoReset = useCallback(() => {
      Modal.confirm({
        title: "メモリセットの確認",
        content: "すべてのメモ（チェキ・デジタル）をリセットしますか？",
        okText: "リセット",
        cancelText: "キャンセル",
        onOk: () => {
          const initialRecords: PhotoSessionRecords = {};
          for (let i = 1; i <= totalPhotographers; i++) {
            initialRecords[i] = { cheki: 0, selfie: 0 };
          }
          setRecords(initialRecords);
          localStorage.setItem("photo-session-records", JSON.stringify(initialRecords));
          message.success("メモをリセットしました");
        }
      });
    }, [totalPhotographers]);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: `calc(100vh - 160px - ${BOTTOM_NAV_HEIGHT}px)`,
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
            scroll={{ y: `calc(100vh - 260px - ${BOTTOM_NAV_HEIGHT}px)` }}
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
          <div style={{ textAlign: "center", paddingBottom: 16 }}>
            <Button
              type="text"
              icon={<UndoOutlined />}
              onClick={() => handleMemoReset()}
              size="middle"
            >
              メモをリセット
            </Button>
          </div>
          <CopyButton records={records} />
        </div>
      </div>
    );
  }
);

PhotoSessionRecordTable.displayName = "PhotoSessionRecordTable";

export default PhotoSessionRecordTable;
