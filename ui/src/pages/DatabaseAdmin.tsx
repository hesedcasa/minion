import { ArrowLeftOutlined, CodeOutlined, DatabaseOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Layout, message, Space, Tabs, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { DatabaseSidebar } from '../components/database/DatabaseSidebar';
import { QueryEditor } from '../components/database/QueryEditor';
import { TableView } from '../components/database/TableView';
import type { TableInfo } from '../types/database';

const { Content } = Layout;
const { Text } = Typography;
const API_BASE_URL = window.location.origin;

interface DatabaseAdminProps {
  onBack?: () => void;
}

export function DatabaseAdmin({ onBack }: DatabaseAdminProps) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'query'>('tables');

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/database/tables`);
      if (!response.ok) throw new Error('Failed to load tables');

      const data: TableInfo[] = await response.json();
      setTables(data);

      // Auto-select first table if none selected
      if (!selectedTable && data.length > 0) {
        setSelectedTable(data[0].name);
      }
    } catch (error) {
      message.error('Failed to load database tables');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  return (
    <Layout style={{ height: '100vh' }}>
      <DatabaseSidebar
        tables={tables}
        selectedTable={selectedTable}
        onSelectTable={table => {
          setSelectedTable(table);
          setActiveTab('tables');
        }}
        loading={loading}
      />

      <Layout>
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color, #f0f0f0)',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text strong style={{ fontSize: '20px' }}>
            <DatabaseOutlined style={{ marginRight: 8, color: '#fdb813' }} />
            Database Admin Portal
          </Text>
          {onBack && (
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Back to Agents
            </Button>
          )}
        </div>

        <Content style={{ overflow: 'hidden' }}>
          <Tabs
            activeKey={activeTab}
            onChange={key => setActiveTab(key as 'tables' | 'query')}
            style={{ height: '100%' }}
            items={[
              {
                key: 'tables',
                label: (
                  <span>
                    <TableOutlined /> Table View
                  </span>
                ),
                children: selectedTable ? (
                  <TableView key={selectedTable} tableName={selectedTable} />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <Text type="secondary">Select a table from the sidebar to view its data</Text>
                  </div>
                ),
              },
              {
                key: 'query',
                label: (
                  <span>
                    <CodeOutlined /> SQL Query
                  </span>
                ),
                children: <QueryEditor />,
              },
            ]}
          />
        </Content>
      </Layout>
    </Layout>
  );
}
