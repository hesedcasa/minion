import { DatePicker, Input, Modal, Radio, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import { useState } from 'react';

import type { ColumnInfo } from '../../types/database';

const { RangePicker } = DatePicker;

interface CellEditorProps {
  column: ColumnInfo;
  value: any;
  onSave: (value: any) => void;
  onCancel: () => void;
}

export function CellEditor({ column, value, onSave, onCancel }: CellEditorProps) {
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
  };

  const renderEditor = () => {
    // Boolean type
    if (column.type === 'boolean') {
      return (
        <Radio.Group value={editValue} onChange={e => setEditValue(e.target.value)}>
          <Radio value={true}>True</Radio>
          <Radio value={false}>False</Radio>
          {column.nullable && <Radio value={null}>NULL</Radio>}
        </Radio.Group>
      );
    }

    // JSON type
    if (column.type === 'json' || column.type === 'jsonb') {
      return (
        <TextArea
          value={typeof editValue === 'object' ? JSON.stringify(editValue, null, 2) : editValue}
          onChange={e => {
            try {
              setEditValue(JSON.parse(e.target.value));
            } catch {
              setEditValue(e.target.value);
            }
          }}
          rows={10}
          placeholder="Enter JSON data"
        />
      );
    }

    // Date/Time types
    if (
      column.type.includes('timestamp') ||
      column.type.includes('date') ||
      column.type.includes('time')
    ) {
      return (
        <DatePicker
          showTime={column.type.includes('timestamp') || column.type.includes('time')}
          value={editValue ? dayjs(editValue) : null}
          onChange={date => setEditValue(date ? date.toISOString() : null)}
          style={{ width: '100%' }}
        />
      );
    }

    // Number types
    if (
      column.type.includes('int') ||
      column.type.includes('numeric') ||
      column.type.includes('decimal') ||
      column.type.includes('float') ||
      column.type.includes('double')
    ) {
      return (
        <Input
          type="number"
          value={editValue}
          onChange={e => setEditValue(e.target.value ? Number(e.target.value) : null)}
          placeholder={`Enter ${column.name}`}
        />
      );
    }

    // Text type (long text)
    if (column.type === 'text') {
      return (
        <TextArea
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          rows={6}
          placeholder={`Enter ${column.name}`}
        />
      );
    }

    // Default: regular input
    return (
      <Input
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        placeholder={`Enter ${column.name}`}
      />
    );
  };

  return (
    <Modal
      title={`Edit ${column.name}`}
      open={true}
      onOk={handleSave}
      onCancel={onCancel}
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, color: '#666' }}>
          <strong>Type:</strong> {column.type}
          {column.nullable && ' (nullable)'}
        </div>
        {column.isForeign && (
          <div style={{ marginBottom: 8, color: '#666' }}>
            <strong>Foreign Key:</strong> {column.foreignTable}.{column.foreignColumn}
          </div>
        )}
      </div>
      {renderEditor()}
      {column.nullable && (
        <div style={{ marginTop: 16 }}>
          <Switch
            checked={editValue === null}
            onChange={checked => setEditValue(checked ? null : '')}
          />{' '}
          Set to NULL
        </div>
      )}
    </Modal>
  );
}
