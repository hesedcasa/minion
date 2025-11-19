/**
 * Database admin operations for Drizzle Studio-like functionality
 */
import { sql } from 'drizzle-orm';

import { getDatabase } from './connection.js';

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

/**
 * Get list of all tables and views in the database
 */
export async function getTables(): Promise<TableInfo[]> {
  const db = getDatabase();

  const result = await db.execute(sql`
    SELECT
      t.table_name as name,
      t.table_schema as schema,
      t.table_type as type,
      COALESCE(
        (SELECT COUNT(*)
         FROM information_schema.tables t2
         WHERE t2.table_name = t.table_name
         AND t2.table_schema = t.table_schema),
        0
      ) as row_count
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type IN ('BASE TABLE', 'VIEW')
    ORDER BY t.table_name;
  `);

  const tables: TableInfo[] = [];
  for (const row of result.rows as any[]) {
    // Get actual row count for each table
    let rowCount = 0;
    if (row.type === 'BASE TABLE') {
      try {
        const countResult = await db.execute(
          sql.raw(`SELECT COUNT(*) as count FROM "${row.name}"`)
        );
        rowCount = Number((countResult.rows[0] as any).count);
      } catch (error) {
        console.error(`Failed to get row count for ${row.name}:`, error);
      }
    }

    tables.push({
      name: row.name as string,
      schema: row.schema as string,
      rowCount,
      type: row.type === 'VIEW' ? 'view' : 'table',
    });
  }

  return tables;
}

/**
 * Get schema information for a specific table
 */
export async function getTableSchema(tableName: string): Promise<TableSchema> {
  const db = getDatabase();

  // Get column information
  const columnsResult = await db.execute(sql`
    SELECT
      c.column_name as name,
      c.data_type as type,
      c.is_nullable as nullable,
      c.column_default as default_value,
      CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary,
      CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign,
      fk.foreign_table_name as foreign_table,
      fk.foreign_column_name as foreign_column
    FROM information_schema.columns c
    LEFT JOIN (
      SELECT ku.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage ku
        ON tc.constraint_name = ku.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = ${tableName}
    ) pk ON c.column_name = pk.column_name
    LEFT JOIN (
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = ${tableName}
    ) fk ON c.column_name = fk.column_name
    WHERE c.table_name = ${tableName}
    ORDER BY c.ordinal_position;
  `);

  const columns: ColumnInfo[] = (columnsResult.rows as any[]).map(row => ({
    name: row.name,
    type: row.type,
    nullable: row.nullable === 'YES',
    defaultValue: row.default_value,
    isPrimary: row.is_primary,
    isForeign: row.is_foreign,
    foreignTable: row.foreign_table,
    foreignColumn: row.foreign_column,
  }));

  return {
    tableName,
    columns,
  };
}

/**
 * Get data from a table with pagination, sorting, and filtering
 */
export async function getTableData(
  tableName: string,
  options: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  } = {}
): Promise<{ rows: any[]; total: number }> {
  const db = getDatabase();
  const { page = 1, pageSize = 50, sortBy, sortOrder = 'asc', filters = {} } = options;

  // Build WHERE clause from filters
  let whereClause = '';
  for (const [column, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined && value !== '') {
      if (whereClause) {
        whereClause += ' AND ';
      }
      // Escape single quotes in value to prevent SQL injection
      const escapedValue = String(value).replace(/'/g, "''");
      whereClause += `"${column}" ILIKE '%${escapedValue}%'`;
    }
  }

  // Get total count
  const countQuery = whereClause
    ? sql.raw(`SELECT COUNT(*) as count FROM "${tableName}" WHERE ${whereClause}`)
    : sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`);

  const countResult = await db.execute(countQuery);
  const total = Number((countResult.rows[0] as any).count);

  // Build ORDER BY clause
  const orderBy = sortBy ? `ORDER BY "${sortBy}" ${sortOrder.toUpperCase()}` : '';

  // Get paginated data
  const offset = (page - 1) * pageSize;
  const dataQuery = whereClause
    ? sql.raw(
        `SELECT * FROM "${tableName}" WHERE ${whereClause} ${orderBy} LIMIT ${pageSize} OFFSET ${offset}`
      )
    : sql.raw(`SELECT * FROM "${tableName}" ${orderBy} LIMIT ${pageSize} OFFSET ${offset}`);

  const dataResult = await db.execute(dataQuery);

  return {
    rows: dataResult.rows as any[],
    total,
  };
}

/**
 * Helper function to escape SQL values
 */
function escapeSqlValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Insert a new row into a table
 */
export async function insertRow(tableName: string, data: Record<string, any>): Promise<any> {
  const db = getDatabase();

  const columns = Object.keys(data);
  const values = Object.values(data).map(escapeSqlValue);

  const query = sql.raw(
    `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) RETURNING *`
  );

  const result = await db.execute(query);
  return result.rows[0];
}

/**
 * Update a row in a table
 */
export async function updateRow(
  tableName: string,
  id: string,
  data: Record<string, any>
): Promise<any> {
  const db = getDatabase();

  const columns = Object.keys(data);
  const setClause = columns
    .map(col => `"${col}" = ${escapeSqlValue(data[col])}`)
    .join(', ');

  const query = sql.raw(
    `UPDATE "${tableName}" SET ${setClause} WHERE id = '${id.replace(/'/g, "''")}' RETURNING *`
  );

  const result = await db.execute(query);
  return result.rows[0];
}

/**
 * Delete a row from a table
 */
export async function deleteRow(tableName: string, id: string): Promise<void> {
  const db = getDatabase();

  const query = sql.raw(`DELETE FROM "${tableName}" WHERE id = '${id.replace(/'/g, "''")}'`);
  await db.execute(query);
}

/**
 * Execute a custom SQL query
 */
export async function executeQuery(query: string): Promise<QueryResult> {
  const db = getDatabase();

  const result = await db.execute(sql.raw(query));

  return {
    rows: result.rows as any[],
    rowCount: result.rowCount || 0,
    fields:
      result.fields?.map(f => ({
        name: f.name,
        type: f.dataTypeID?.toString() || 'unknown',
      })) || [],
  };
}

/**
 * Export table data to CSV format
 */
export async function exportTableToCSV(tableName: string): Promise<string> {
  const db = getDatabase();

  const result = await db.execute(sql.raw(`SELECT * FROM "${tableName}"`));
  const rows = result.rows as any[];

  if (rows.length === 0) {
    return '';
  }

  // Get headers
  const headers = Object.keys(rows[0]);
  const csvHeaders = headers.map(h => `"${h}"`).join(',');

  // Convert rows to CSV
  const csvRows = rows.map(row => {
    return headers
      .map(header => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}
