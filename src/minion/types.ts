/**
 * Core types for Minion web orchestration
 */

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'stopped';

export interface AgentConfig {
  id: string;
  name: string;
  workspacePath: string;
  branchName: string;
  apiKey?: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  output?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  status: AgentStatus;
  workspacePath: string;
  branchName: string;
  currentTask?: AgentTask;
  createdAt: Date;
  lastActivity?: Date;
}

export interface WorkspaceInfo {
  path: string;
  branchName: string;
  agentId: string;
  isActive: boolean;
}

export interface TaskRequest {
  description: string;
  context?: string;
}

export interface MergeRequest {
  targetBranch?: string;
  deleteWorktree?: boolean;
}

export interface WebSocketMessage {
  type: 'agent_status' | 'task_update' | 'agent_log' | 'error';
  agentId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}
