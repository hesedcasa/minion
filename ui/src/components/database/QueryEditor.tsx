import { PlayCircleOutlined } from '@ant-design/icons';
import { Button, message, Space, Table, Tabs, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useState } from 'react';

import type { QueryResult } from '../../types/database';

const { Text } = Typography;
const API_BASE_URL = window.location.origin;

export function QueryEditor() {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async () => {
    if (!query.trim()) {
      message.warning('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/database/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Query failed');
      }

      const data: QueryResult = await response.json();
      setResult(data);
      message.success(`Query executed successfully (${data.rowCount} rows)`);
    } catch (err: any) {
      setError(err.message);
      message.error(`Query failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columns =
    result?.rows.length > 0
      ? Object.keys(result.rows[0]).map(key => ({
          title: key,
          dataIndex: key,
          key,
          ellipsis: true,
          render: (value: any) => {
            if (value === null) return <Text type="secondary" italic>NULL</Text>;
            if (typeof value === 'object') {
              return <Text code>{JSON.stringify(value)}</Text>;
            }
            return String(value);
          },
        }))
      : [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color, #f0f0f0)',
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong style={{ fontSize: '18px' }}>
            SQL Query Editor
          </Text>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={executeQuery}
            loading={loading}
          >
            Execute Query
          </Button>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Query
            </Text>
            <TextArea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter your SQL query here..."
              rows={10}
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fff2e8',
                border: '1px solid #ffbb96',
                borderRadius: '8px',
              }}
            >
              <Text type="danger">
                <strong>Error:</strong> {error}
              </Text>
            </div>
          )}

          {result && (
            <div>
              <Tabs
                items={[
                  {
                    key: 'results',
                    label: `Results (${result.rowCount} rows)`,
                    children: (
                      <Table
                        columns={columns}
                        dataSource={result.rows}
                        pagination={{
                          pageSize: 50,
                          showSizeChanger: true,
                          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} rows`,
                        }}
                        scroll={{ x: 'max-content' }}
                        size="small"
                      />
                    ),
                  },
                  {
                    key: 'raw',
                    label: 'Raw JSON',
                    children: (
                      <pre
                        style={{
                          backgroundColor: '#f5f5f5',
                          padding: '16px',
                          borderRadius: '8px',
                          overflow: 'auto',
                          maxHeight: '400px',
                        }}
                      >
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </Space>
      </div>
    </div>
  );
}
