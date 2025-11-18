import { useState } from 'react';

interface AssignTaskModalProps {
  isOpen: boolean;
  agentId: string | null;
  onClose: () => void;
  onAssignTask: (agentId: string, description: string, context?: string) => Promise<void>;
}

export function AssignTaskModal({
  isOpen,
  agentId,
  onClose,
  onAssignTask,
}: AssignTaskModalProps) {
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !agentId) return null;

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Please enter a task description');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAssignTask(agentId, description.trim(), context.trim() || undefined);
      setDescription('');
      setContext('');
      onClose();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal active" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Assign Task</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="taskDescription">Task Description</label>
            <textarea
              id="taskDescription"
              rows={4}
              placeholder="Describe what you want the agent to do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskContext">Additional Context (optional)</label>
            <textarea
              id="taskContext"
              rows={3}
              placeholder="Provide any additional context or requirements..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Assign Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
