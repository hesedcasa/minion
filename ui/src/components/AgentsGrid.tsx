import { AgentCard } from './AgentCard';
import type { Agent } from '../types/agent';

interface AgentsGridProps {
  agents: Agent[];
  onAssignTask: (agentId: string) => void;
  onViewDiff: (agentId: string) => void;
  onStopAgent: (agentId: string) => void;
  onRemoveAgent: (agentId: string) => void;
}

export function AgentsGrid({
  agents,
  onAssignTask,
  onViewDiff,
  onStopAgent,
  onRemoveAgent,
}: AgentsGridProps) {
  if (agents.length === 0) {
    return (
      <div className="agents-grid">
        <div className="empty-state">
          <div className="empty-icon">🎼</div>
          <h2>No agents yet</h2>
          <p>Create your first agent to start orchestrating your AI coding team</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agents-grid">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onAssignTask={onAssignTask}
          onViewDiff={onViewDiff}
          onStopAgent={onStopAgent}
          onRemoveAgent={onRemoveAgent}
        />
      ))}
    </div>
  );
}
