import { Form, Input, Modal, message } from 'antd';
import { useState } from 'react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (name: string, apiKey?: string) => Promise<void>;
}

export function CreateAgentModal({ isOpen, onClose, onCreateAgent }: CreateAgentModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: { name: string; apiKey?: string }) => {
    setIsSubmitting(true);
    try {
      await onCreateAgent(values.name.trim(), values.apiKey?.trim() || undefined);
      form.resetFields();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      message.error(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create New Agent"
      open={isOpen}
      onOk={form.submit}
      onCancel={handleCancel}
      confirmLoading={isSubmitting}
      okText={isSubmitting ? 'Creating...' : 'Create Agent'}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Agent Name"
          name="name"
          rules={[{ required: true, message: 'Please enter an agent name' }]}
        >
          <Input placeholder="e.g., Frontend Developer" />
        </Form.Item>
        <Form.Item
          label="Anthropic API Key (optional)"
          name="apiKey"
          help="Leave empty to use ANTHROPIC_API_KEY environment variable"
        >
          <Input.Password placeholder="sk-ant-..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
