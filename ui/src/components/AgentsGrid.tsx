import { Row, Col } from 'antd';
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
  return (
    <Row gutter={[16, 16]}>
      {agents.map((agent) => (
        <Col key={agent.id} xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
          <AgentCard
            agent={agent}
            onAssignTask={onAssignTask}
            onViewDiff={onViewDiff}
            onStopAgent={onStopAgent}
            onRemoveAgent={onRemoveAgent}
          />
        </Col>
      ))}
    </Row>
  );
}
