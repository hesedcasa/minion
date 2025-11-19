import { DatabaseOutlined, TableOutlined } from '@ant-design/icons';
import { Badge, Input, List, Space, Typography } from 'antd';
import { useState } from 'react';

import type { TableInfo } from '../../types/database';

const { Search } = Input;
const { Text } = Typography;

interface DatabaseSidebarProps {
  tables: TableInfo[];
  selectedTable: string | null;
  onSelectTable: (tableName: string) => void;
  loading?: boolean;
}

export function DatabaseSidebar({
  tables,
  selectedTable,
  onSelectTable,
  loading = false,
}: DatabaseSidebarProps) {
  const [searchText, setSearchText] = useState('');

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div
      style={{
        width: 280,
        borderRight: '1px solid var(--border-color, #f0f0f0)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-color, #f0f0f0)',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <DatabaseOutlined style={{ fontSize: '20px', color: '#fdb813' }} />
            <Text strong style={{ fontSize: '16px' }}>
              Database
            </Text>
          </Space>
          <Search
            placeholder="Search tables..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%' }}
          />
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <List
          loading={loading}
          dataSource={filteredTables}
          renderItem={table => (
            <List.Item
              onClick={() => onSelectTable(table.name)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: selectedTable === table.name ? '#fdb81320' : 'transparent',
                borderLeft:
                  selectedTable === table.name ? '3px solid #fdb813' : '3px solid transparent',
              }}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <TableOutlined style={{ color: table.type === 'view' ? '#007acc' : '#666' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>
                      {table.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {table.type}
                    </Text>
                  </div>
                </Space>
                <Badge
                  count={table.rowCount}
                  showZero
                  overflowCount={999999}
                  style={{
                    backgroundColor: '#f0f0f0',
                    color: '#666',
                    boxShadow: 'none',
                  }}
                />
              </Space>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
