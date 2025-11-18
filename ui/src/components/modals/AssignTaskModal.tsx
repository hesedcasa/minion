import { Form, Input, Modal, message } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;

interface AssignTaskModalProps {
  isOpen: boolean;
  agentId: string | null;
  onClose: () => void;
  onAssignTask: (agentId: string, description: string, context?: string) => Promise<void>;
}

export function AssignTaskModal({ isOpen, agentId, onClose, onAssignTask }: AssignTaskModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: { description: string; context?: string }) => {
    if (!agentId) return;

    setIsSubmitting(true);
    try {
      await onAssignTask(agentId, values.description.trim(), values.context?.trim() || undefined);
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
      title="Assign Task"
      open={isOpen && !!agentId}
      onOk={form.submit}
      onCancel={handleCancel}
      confirmLoading={isSubmitting}
      okText={isSubmitting ? 'Assigning...' : 'Assign Task'}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Task Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a task description' }]}
        >
          <TextArea
            rows={4}
            placeholder="Describe what you want the agent to do..."
          />
        </Form.Item>
        <Form.Item
          label="Additional Context (optional)"
          name="context"
        >
          <TextArea
            rows={3}
            placeholder="Provide any additional context or requirements..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
