interface DiffModalProps {
  isOpen: boolean;
  agentId: string | null;
  diff: string;
  onClose: () => void;
  onMerge: (agentId: string) => Promise<void>;
}

export function DiffModal({ isOpen, agentId, diff, onClose, onMerge }: DiffModalProps) {
  if (!isOpen || !agentId) return null;

  const handleMerge = async () => {
    if (!confirm('Are you sure you want to merge these changes into the main branch?')) {
      return;
    }

    try {
      await onMerge(agentId);
      onClose();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal active" onClick={handleBackdropClick}>
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h2>Changes Preview</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <pre className="diff-content">{diff || 'No changes yet'}</pre>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-success" onClick={handleMerge}>
            Merge Changes
          </button>
        </div>
      </div>
    </div>
  );
}
