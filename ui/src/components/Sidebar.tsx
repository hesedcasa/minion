import {
  BranchesOutlined,
  DeleteOutlined,
  DownOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';

interface SidebarProps {
  onOpenProject: () => void;
  onCloneFromUrl: () => void;
  currentWorkspace?: string;
}

export function Sidebar({ onOpenProject, onCloneFromUrl, currentWorkspace }: SidebarProps) {
  const workspaceItems: MenuProps['items'] = [
    {
      key: 'current',
      label: currentWorkspace || 'Select workspace',
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'new',
      label: 'New workspace',
      icon: <PlusOutlined />,
      onClick: onOpenProject,
    },
  ];

  return (
    <div
      style={{
        width: 260,
        background: 'var(--sidebar-bg, #f0f2f5)',
        borderRight: '1px solid var(--sidebar-border, #d9d9d9)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '8px',
      }}
    >
      <Menu
        mode="inline"
        style={{ background: 'transparent', border: 'none' }}
        items={[
          {
            key: 'home',
            icon: <HomeOutlined />,
            label: 'Home',
          },
        ]}
      />

      <Dropdown
        menu={{ items: workspaceItems }}
        trigger={['click']}
      >
        <Button
          block
          style={{
            marginTop: 8,
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              textAlign: 'left',
            }}
          >
            {currentWorkspace || 'Select workspace'}
          </span>
          <DownOutlined />
        </Button>
      </Dropdown>

      <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color, #d9d9d9)' }}>
        <Menu
          mode="inline"
          style={{ background: 'transparent', border: 'none' }}
          items={[
            {
              key: 'open',
              icon: <FolderOpenOutlined />,
              label: 'Open project',
              onClick: onOpenProject,
            },
            {
              key: 'clone',
              icon: <BranchesOutlined />,
              label: 'Clone from URL',
              onClick: onCloneFromUrl,
            },
            {
              key: 'messages',
              icon: <MessageOutlined />,
              label: 'Add repository',
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Delete',
            },
            {
              key: 'more',
              icon: <MoreOutlined />,
              label: 'More options',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Settings',
            },
          ]}
        />
      </div>
    </div>
  );
}
