import { BranchesOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { Card, Space, Typography } from 'antd';

const { Title } = Typography;

interface EmptyStateProps {
  onOpenProject: () => void;
  onCloneFromUrl: () => void;
}

export function EmptyState({ onOpenProject, onCloneFromUrl }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '48px',
      }}
    >
      <Title style={{ fontSize: '72px', fontWeight: 800, letterSpacing: '-2px', fontFamily: 'monospace' }}>
        CLONEHUB
      </Title>

      <Space size="large">
        <Card
          hoverable
          style={{ width: 200, textAlign: 'center' }}
          onClick={onOpenProject}
        >
          <Space
            direction="vertical"
            size="middle"
          >
            <FolderOpenOutlined style={{ fontSize: 48 }} />
            <span>Open project</span>
          </Space>
        </Card>

        <Card
          hoverable
          style={{ width: 200, textAlign: 'center' }}
          onClick={onCloneFromUrl}
        >
          <Space
            direction="vertical"
            size="middle"
          >
            <BranchesOutlined style={{ fontSize: 48 }} />
            <span>Clone from URL</span>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
