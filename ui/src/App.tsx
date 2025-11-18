import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { AgentsGrid } from './components/AgentsGrid';
import { Controls } from './components/Controls';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { EmptyState } from './components/EmptyState';
import { AssignTaskModal } from './components/modals/AssignTaskModal';
import { CreateAgentModal } from './components/modals/CreateAgentModal';
import { DiffModal } from './components/modals/DiffModal';
import { useWebSocket } from './hooks/useWebSocket';
import type { Agent, WebSocketMessage } from './types/agent';

const API_BASE_URL = window.location.origin;

function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [currentAgentForTask, setCurrentAgentForTask] = useState<string | null>(null);
  const [currentAgentForDiff, setCurrentAgentForDiff] = useState<string | null>(null);
  const [diffContent, setDiffContent] = useState('');
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('minion');

  const loadAgents = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents`);
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }, []);

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log('WebSocket message:', message);

      switch (message.type) {
        case 'initial_state':
          if (message.data?.agents) {
            setAgents(message.data.agents);
          }
          break;

        case 'agent_status':
        case 'task_update':
          loadAgents();
          break;

        case 'agent_log':
          console.log(`Agent ${message.agentId}:`, message.data);
          break;

        case 'error':
          console.error(`Error from agent ${message.agentId}:`, message.data);
          loadAgents();
          break;
      }
    },
    [loadAgents]
  );

  const { isConnected } = useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleCreateAgent = async (name: string, apiKey?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, apiKey }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create agent');
    }

    const agent = await response.json();
    setAgents((prev) => [...prev, agent]);
  };

  const handleAssignTask = async (agentId: string, description: string, context?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, context }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign task');
    }

    setTimeout(() => loadAgents(), 500);
  };

  const handleViewDiff = async (agentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/diff`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get diff');
      }

      const data = await response.json();
      setCurrentAgentForDiff(agentId);
      setDiffContent(data.diff || 'No changes yet');
      setIsDiffModalOpen(true);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleMerge = async (agentId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetBranch: 'main', deleteWorktree: false }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to merge');
    }

    alert('Changes merged successfully!');
    loadAgents();
  };

  const handleStopAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to stop this agent?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stop agent');
      }

      loadAgents();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRemoveAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to remove this agent? This will delete its workspace.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}?force=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove agent');
      }

      setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const showTaskModal = (agentId: string) => {
    setCurrentAgentForTask(agentId);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Sidebar
        onOpenProject={() => setIsCreateModalOpen(true)}
        onCloneFromUrl={() => setIsCreateModalOpen(true)}
        currentWorkspace={currentWorkspace}
      />

      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <Header />
          </div>
          <div className="top-bar-right">
            <ThemeToggle />
            <Controls
              isConnected={isConnected}
              onCreateAgent={() => setIsCreateModalOpen(true)}
              onRefresh={loadAgents}
            />
          </div>
        </div>

        <div className="content-area">
          {agents.length === 0 ? (
            <EmptyState
              onOpenProject={() => setIsCreateModalOpen(true)}
              onCloneFromUrl={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <AgentsGrid
              agents={agents}
              onAssignTask={showTaskModal}
              onViewDiff={handleViewDiff}
              onStopAgent={handleStopAgent}
              onRemoveAgent={handleRemoveAgent}
            />
          )}
        </div>
      </main>

      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAgent={handleCreateAgent}
      />

      <AssignTaskModal
        isOpen={isTaskModalOpen}
        agentId={currentAgentForTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setCurrentAgentForTask(null);
        }}
        onAssignTask={handleAssignTask}
      />

      <DiffModal
        isOpen={isDiffModalOpen}
        agentId={currentAgentForDiff}
        diff={diffContent}
        onClose={() => {
          setIsDiffModalOpen(false);
          setCurrentAgentForDiff(null);
          setDiffContent('');
        }}
        onMerge={handleMerge}
      />
    </div>
  );
}

export default App;
