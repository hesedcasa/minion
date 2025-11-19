/**
 * TypeScript types for database admin functionality
 */

export interface TableInfo {
  name: string;
  schema: string;
  rowCount: number;
  type: 'table' | 'view';
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimary: boolean;
  isForeign: boolean;
  foreignTable?: string;
  foreignColumn?: string;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
}

export interface QueryResult {
  rows: any[];
  rowCount: number;
  fields: { name: string; type: string }[];
}

export interface TableDataResponse {
  rows: any[];
  total: number;
}
