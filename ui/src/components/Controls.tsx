import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';

import { ConnectionStatus } from './ConnectionStatus';

interface ControlsProps {
  isConnected: boolean;
  onCreateAgent: () => void;
  onRefresh: () => void;
}

export function Controls({ isConnected, onCreateAgent, onRefresh }: ControlsProps) {
  return (
    <Space>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onCreateAgent}
      >
        Create New Agent
      </Button>
      <Button
        icon={<ReloadOutlined />}
        onClick={onRefresh}
      >
        Refresh
      </Button>
      <ConnectionStatus isConnected={isConnected} />
    </Space>
  );
}
