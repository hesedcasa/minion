export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'stopped';
  branchName: string;
  createdAt: string;
  currentTask?: {
    description: string;
    status: string;
  };
}

export interface WebSocketMessage {
  type: 'initial_state' | 'agent_status' | 'task_update' | 'agent_log' | 'error';
  agentId?: string;
  data?: any;
}

export interface CreateAgentRequest {
  name: string;
  apiKey?: string;
}

export interface AssignTaskRequest {
  description: string;
  context?: string;
}

export interface MergeRequest {
  targetBranch: string;
  deleteWorktree: boolean;
}
