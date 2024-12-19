import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message } from "antd";
import { PlusOutlined, MinusOutlined, CopyOutlined } from "@ant-design/icons";
import { PhotoSessionRecords, PhotoSessionRecordTableProps } from "./types";

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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
    <Button
      icon={<CopyOutlined />}
      onClick={handleCopy}
      style={{ width: "100%" }}
    >
      集計データをコピー
    </Button>
  );
});

CopyButton.displayName = "CopyButton";

const PhotoSessionRecordTable = memo(
  ({ totalPhotographers }: PhotoSessionRecordTableProps) => {
    const [records, setRecords] = useState<PhotoSessionRecords>({});

    useEffect(() => {
      const initialRecords: PhotoSessionRecords = {};
      for (let i = 1; i <= totalPhotographers; i++) {
        initialRecords[i] = { cheki: 0, selfie: 0 };
      }
      setRecords(initialRecords);
    }, [totalPhotographers]);

    const updateValue = useCallback(
      (
        photographerId: number,
        type: "cheki" | "selfie",
        increment: boolean
      ) => {
        setRecords((prev) => ({
          ...prev,
          [photographerId]: {
            ...prev[photographerId],
            [type]: Math.max(
              0,
              prev[photographerId][type] + (increment ? 1 : -1)
            ),
          },
        }));
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
          onCell: () => ({
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          }),
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
          onCell: () => ({
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          }),
        },
        {
          title: "写メ",
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
          onCell: () => ({
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          }),
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
      <div onClick={(e) => e.stopPropagation()}>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          style={{ marginBottom: 16 }}
          onRow={() => ({
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          })}
          size="small"
        />
        <CopyButton records={records} />
      </div>
    );
  }
);

PhotoSessionRecordTable.displayName = "PhotoSessionRecordTable";

export default PhotoSessionRecordTable;
