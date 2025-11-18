import { DeleteOutlined, EyeOutlined, FileTextOutlined, StopOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Descriptions, Space, Tag, Typography } from 'antd';

import type { Agent } from '../types/agent';

const { Text, Paragraph } = Typography;

interface AgentCardProps {
  agent: Agent;
  onAssignTask: (agentId: string) => void;
  onViewDiff: (agentId: string) => void;
  onStopAgent: (agentId: string) => void;
  onRemoveAgent: (agentId: string) => void;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    idle: 'default',
    running: 'processing',
    completed: 'success',
    error: 'error',
    stopped: 'warning',
  };
  return colors[status] || 'default';
};

export function AgentCard({ agent, onAssignTask, onViewDiff, onStopAgent, onRemoveAgent }: AgentCardProps) {
  const statusText = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);

  return (
    <Card
      hoverable
      title={
        <Space
          direction="vertical"
          size={0}
          style={{ width: '100%' }}
        >
          <Text strong>{agent.name}</Text>
          <Text
            type="secondary"
            style={{ fontSize: '12px', fontFamily: 'monospace' }}
          >
            {agent.id.slice(0, 8)}
          </Text>
        </Space>
      }
      extra={<Tag color={getStatusColor(agent.status)}>{statusText}</Tag>}
    >
      <Descriptions
        column={1}
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="Branch">
          <Text code>{agent.branchName}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Created">{new Date(agent.createdAt).toLocaleString()}</Descriptions.Item>
      </Descriptions>

      {agent.currentTask && (
        <Alert
          message="Current Task"
          description={
            <Space
              direction="vertical"
              size={0}
            >
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ margin: 0 }}
              >
                {agent.currentTask.description}
              </Paragraph>
              <Text
                type="secondary"
                style={{ fontSize: '12px' }}
              >
                Status: {agent.currentTask.status}
              </Text>
            </Space>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}

      <Space wrap>
        <Button
          type="primary"
          size="small"
          icon={<FileTextOutlined />}
          onClick={() => onAssignTask(agent.id)}
        >
          Assign Task
        </Button>
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDiff(agent.id)}
        >
          View Changes
        </Button>
        {agent.status === 'running' ? (
          <Button
            danger
            size="small"
            icon={<StopOutlined />}
            onClick={() => onStopAgent(agent.id)}
          >
            Stop
          </Button>
        ) : (
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onRemoveAgent(agent.id)}
          >
            Remove
          </Button>
        )}
      </Space>
    </Card>
  );
}
