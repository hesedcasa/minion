import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';

import type { ColumnInfo, TableDataResponse, TableSchema } from '../../types/database';
import { CellEditor } from './CellEditor';

const { Text } = Typography;
const API_BASE_URL = window.location.origin;

interface TableViewProps {
  tableName: string;
}

export function TableView({ tableName }: TableViewProps) {
  const [data, setData] = useState<any[]>([]);
  const [schema, setSchema] = useState<TableSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 50,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} rows`,
    pageSizeOptions: ['10', '20', '50', '100'],
  });
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    column: string;
    value: any;
  } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadSchema = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/database/tables/${tableName}/schema`);
      if (!response.ok) throw new Error('Failed to load schema');
      const schema = await response.json();
      setSchema(schema);
    } catch (error) {
      message.error('Failed to load table schema');
      console.error(error);
    }
  }, [tableName]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.current || 1),
        pageSize: String(pagination.pageSize || 50),
      });

      if (sortField) {
        params.append('sortBy', sortField);
        params.append('sortOrder', sortOrder);
      }

      // Add filters
      for (const [column, value] of Object.entries(filters)) {
        if (value) {
          params.append(`filter_${column}`, value);
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/database/tables/${tableName}/data?${params}`);
      if (!response.ok) throw new Error('Failed to load data');

      const result: TableDataResponse = await response.json();
      setData(result.rows);
      setTotal(result.total);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      message.error('Failed to load table data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [tableName, pagination.current, pagination.pageSize, sortField, sortOrder, filters]);

  useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  useEffect(() => {
    if (schema) {
      loadData();
    }
  }, [loadData, schema]);

  const handleTableChange = (newPagination: TablePaginationConfig, _filters: any, sorter: any) => {
    setPagination(newPagination);

    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      setSortField(null);
    }
  };

  const handleDelete = async (record: any) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/database/tables/${tableName}/row/${record.id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to delete row');
      message.success('Row deleted successfully');
      loadData();
    } catch (error) {
      message.error('Failed to delete row');
      console.error(error);
    }
  };

  const handleCellEdit = async (rowId: string, column: string, value: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/database/tables/${tableName}/row/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [column]: value }),
      });
      if (!response.ok) throw new Error('Failed to update cell');
      message.success('Cell updated successfully');
      loadData();
      setEditingCell(null);
    } catch (error) {
      message.error('Failed to update cell');
      console.error(error);
    }
  };

  const handleAddRow = async (values: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/database/tables/${tableName}/row`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to add row');
      message.success('Row added successfully');
      setIsAddModalOpen(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('Failed to add row');
      console.error(error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/database/tables/${tableName}/export/csv`);
      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Data exported successfully');
    } catch (error) {
      message.error('Failed to export data');
      console.error(error);
    }
  };

  const renderCellValue = (value: any, column: ColumnInfo, record: any) => {
    if (value === null) {
      return <Text type="secondary" italic>NULL</Text>;
    }
    if (value === '') {
      return <Text type="secondary" italic>Empty</Text>;
    }
    if (typeof value === 'boolean') {
      return <Tag color={value ? 'success' : 'default'}>{String(value)}</Tag>;
    }
    if (typeof value === 'object') {
      return (
        <Tooltip title={JSON.stringify(value, null, 2)}>
          <Text code style={{ cursor: 'pointer' }}>
            {JSON.stringify(value).substring(0, 50)}...
          </Text>
        </Tooltip>
      );
    }
    if (column.type.includes('timestamp') || column.type.includes('date')) {
      return new Date(value).toLocaleString();
    }
    return String(value);
  };

  const columns: ColumnsType<any> = schema
    ? [
        ...schema.columns.map(column => ({
          title: (
            <Space direction="vertical" size={0}>
              <Text strong>{column.name}</Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {column.type}
                {column.isPrimary && ' • PK'}
                {column.isForeign && ' • FK'}
              </Text>
            </Space>
          ),
          dataIndex: column.name,
          key: column.name,
          sorter: true,
          width: 200,
          ellipsis: true,
          render: (value: any, record: any) => (
            <div
              onClick={() => {
                if (!column.isPrimary) {
                  setEditingCell({ rowId: record.id, column: column.name, value });
                }
              }}
              style={{
                cursor: column.isPrimary ? 'default' : 'pointer',
                padding: '4px',
                borderRadius: '4px',
              }}
              onMouseEnter={e => {
                if (!column.isPrimary) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {renderCellValue(value, column, record)}
            </div>
          ),
        })),
        {
          title: 'Actions',
          key: 'actions',
          fixed: 'right',
          width: 100,
          render: (_: any, record: any) => (
            <Space>
              <Popconfirm
                title="Delete row"
                description="Are you sure you want to delete this row?"
                onConfirm={() => handleDelete(record)}
                okText="Delete"
                okType="danger"
                cancelText="Cancel"
              >
                <Button danger type="text" size="small" icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          ),
        },
      ]
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
          <Space>
            <Text strong style={{ fontSize: '18px' }}>
              {tableName}
            </Text>
            <Tag color="blue">{total} rows</Tag>
          </Space>
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              type={showFilters ? 'primary' : 'default'}
            >
              Filter
            </Button>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsAddModalOpen(true)}>
              Add Row
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Export CSV
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              Refresh
            </Button>
          </Space>
        </Space>
      </div>

      {showFilters && (
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color, #f0f0f0)',
            backgroundColor: '#fafafa',
          }}
        >
          <Space wrap>
            {schema?.columns.map(column => (
              <Input
                key={column.name}
                placeholder={`Filter ${column.name}...`}
                value={filters[column.name] || ''}
                onChange={e => {
                  setFilters(prev => ({ ...prev, [column.name]: e.target.value }));
                }}
                style={{ width: 200 }}
                allowClear
              />
            ))}
            <Button type="primary" onClick={loadData}>
              Apply Filters
            </Button>
            <Button
              onClick={() => {
                setFilters({});
                setTimeout(loadData, 100);
              }}
            >
              Clear All
            </Button>
          </Space>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </div>

      <Modal
        title="Add New Row"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddRow}>
          {schema?.columns
            .filter(col => !col.isPrimary && !col.defaultValue)
            .map(column => (
              <Form.Item
                key={column.name}
                label={`${column.name} (${column.type})`}
                name={column.name}
                rules={[{ required: !column.nullable, message: 'This field is required' }]}
              >
                <Input placeholder={`Enter ${column.name}`} />
              </Form.Item>
            ))}
        </Form>
      </Modal>

      {editingCell && schema && (
        <CellEditor
          column={schema.columns.find(c => c.name === editingCell.column)!}
          value={editingCell.value}
          onSave={value => handleCellEdit(editingCell.rowId, editingCell.column, value)}
          onCancel={() => setEditingCell(null)}
        />
      )}
    </div>
  );
}
