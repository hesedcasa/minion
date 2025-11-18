import { ConnectionStatus } from './ConnectionStatus';

interface ControlsProps {
  isConnected: boolean;
  onCreateAgent: () => void;
  onRefresh: () => void;
}

export function Controls({ isConnected, onCreateAgent, onRefresh }: ControlsProps) {
  return (
    <div className="controls">
      <button className="btn btn-primary" onClick={onCreateAgent}>
        + Create New Agent
      </button>
      <button className="btn btn-secondary" onClick={onRefresh}>
        🔄 Refresh
      </button>
      <ConnectionStatus isConnected={isConnected} />
    </div>
  );
}
