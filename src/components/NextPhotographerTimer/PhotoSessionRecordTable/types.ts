export interface PhotoSessionRecord {
  cheki: number;
  selfie: number;
}

export interface PhotoSessionRecords {
  [key: string]: {
    cheki: number;
    selfie: number;
  };
}

export interface PhotoSessionRecordTableProps {
  totalPhotographers: number;
}
