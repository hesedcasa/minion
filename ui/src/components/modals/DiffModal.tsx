import { Modal, message } from 'antd';

interface DiffModalProps {
  isOpen: boolean;
  agentId: string | null;
  diff: string;
  onClose: () => void;
  onMerge: (agentId: string) => Promise<void>;
}

export function DiffModal({ isOpen, agentId, diff, onClose, onMerge }: DiffModalProps) {
  const handleMerge = async () => {
    if (!agentId) return;

    Modal.confirm({
      title: 'Merge Changes',
      content: 'Are you sure you want to merge these changes into the main branch?',
      okText: 'Merge',
      okType: 'primary',
      onOk: async () => {
        try {
          await onMerge(agentId);
          message.success('Changes merged successfully!');
          onClose();
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error);
          message.error(`Error: ${msg}`);
        }
      },
    });
  };

  return (
    <Modal
      title="Changes Preview"
      open={isOpen && !!agentId}
      onCancel={onClose}
      width={900}
      okText="Merge Changes"
      onOk={handleMerge}
      okButtonProps={{ type: 'primary' }}
    >
      <pre
        style={{
          background: 'var(--bg-primary, #f5f5f5)',
          padding: 16,
          borderRadius: 4,
          overflow: 'auto',
          maxHeight: 500,
          fontFamily: 'Monaco, Courier New, monospace',
          fontSize: 12,
          lineHeight: 1.5,
          border: '1px solid var(--border-color, #d9d9d9)',
        }}
      >
        {diff || 'No changes yet'}
      </pre>
    </Modal>
  );
}
