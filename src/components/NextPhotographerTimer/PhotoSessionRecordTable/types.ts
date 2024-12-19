export interface PhotoSessionRecord {
  cheki: number;
  selfie: number;
}

export interface PhotoSessionRecords {
  [photographerId: number]: PhotoSessionRecord;
}

export interface PhotoSessionRecordTableProps {
  totalPhotographers: number;
}
