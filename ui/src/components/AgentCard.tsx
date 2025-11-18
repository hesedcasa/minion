import type { Agent } from '../types/agent';

interface AgentCardProps {
  agent: Agent;
  onAssignTask: (agentId: string) => void;
  onViewDiff: (agentId: string) => void;
  onStopAgent: (agentId: string) => void;
  onRemoveAgent: (agentId: string) => void;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function AgentCard({
  agent,
  onAssignTask,
  onViewDiff,
  onStopAgent,
  onRemoveAgent,
}: AgentCardProps) {
  const statusClass = `status-${agent.status}`;
  const statusText = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);

  return (
    <div className="agent-card" data-agent-id={agent.id}>
      <div className="agent-header">
        <div>
          <div
            className="agent-name"
            dangerouslySetInnerHTML={{ __html: escapeHtml(agent.name) }}
          />
          <div className="agent-id">{agent.id.slice(0, 8)}</div>
        </div>
        <span className={`agent-status ${statusClass}`}>{statusText}</span>
      </div>

      <div className="agent-info">
        <div className="info-row">
          <span className="info-label">Branch:</span>
          <span
            className="info-value"
            dangerouslySetInnerHTML={{ __html: escapeHtml(agent.branchName) }}
          />
        </div>
        <div className="info-row">
          <span className="info-label">Created:</span>
          <span className="info-value">{new Date(agent.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {agent.currentTask && (
        <div className="current-task">
          <div
            className="task-description"
            dangerouslySetInnerHTML={{ __html: escapeHtml(agent.currentTask.description) }}
          />
          <div className="task-status">Status: {agent.currentTask.status}</div>
        </div>
      )}

      <div className="agent-actions">
        <button className="btn btn-primary btn-small" onClick={() => onAssignTask(agent.id)}>
          Assign Task
        </button>
        <button className="btn btn-secondary btn-small" onClick={() => onViewDiff(agent.id)}>
          View Changes
        </button>
        {agent.status === 'running' ? (
          <button className="btn btn-danger btn-small" onClick={() => onStopAgent(agent.id)}>
            Stop
          </button>
        ) : (
          <button className="btn btn-danger btn-small" onClick={() => onRemoveAgent(agent.id)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
