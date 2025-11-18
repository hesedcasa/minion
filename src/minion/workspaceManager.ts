/**
 * Git worktree manager for isolated agent workspaces
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import type { WorkspaceInfo } from './types.js';

export class WorkspaceManager {
  private workspaces: Map<string, WorkspaceInfo> = new Map();
  private baseRepoPath: string;
  private worktreesPath: string;

  constructor(baseRepoPath: string = process.cwd()) {
    this.baseRepoPath = baseRepoPath;
    this.worktreesPath = join(baseRepoPath, '.minion-worktrees');

    // Ensure worktrees directory exists
    if (!existsSync(this.worktreesPath)) {
      mkdirSync(this.worktreesPath, { recursive: true });
    }

    // Verify we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { cwd: this.baseRepoPath, stdio: 'pipe' });
    } catch {
      throw new Error('Not a git repository. Minion requires a git repository.');
    }
  }

  /**
   * Creates a new git worktree for an agent
   */
  async createWorktree(agentId: string, branchName: string): Promise<string> {
    const worktreePath = join(this.worktreesPath, agentId);

    // Check if worktree already exists
    if (existsSync(worktreePath)) {
      throw new Error(`Worktree already exists for agent ${agentId}`);
    }

    try {
      // Create new branch from current HEAD
      execSync(`git branch ${branchName}`, {
        cwd: this.baseRepoPath,
        stdio: 'pipe',
      });

      // Create worktree
      execSync(`git worktree add "${worktreePath}" ${branchName}`, {
        cwd: this.baseRepoPath,
        stdio: 'pipe',
      });

      // Store workspace info
      const workspaceInfo: WorkspaceInfo = {
        path: worktreePath,
        branchName,
        agentId,
        isActive: true,
      };
      this.workspaces.set(agentId, workspaceInfo);

      return worktreePath;
    } catch (error: unknown) {
      throw new Error(`Failed to create worktree: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Removes a git worktree
   */
  async removeWorktree(agentId: string, force: boolean = false): Promise<void> {
    const workspace = this.workspaces.get(agentId);
    if (!workspace) {
      throw new Error(`No worktree found for agent ${agentId}`);
    }

    try {
      const forceFlag = force ? '--force' : '';
      execSync(`git worktree remove "${workspace.path}" ${forceFlag}`, {
        cwd: this.baseRepoPath,
        stdio: 'pipe',
      });

      this.workspaces.delete(agentId);
    } catch (error: unknown) {
      throw new Error(`Failed to remove worktree: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Merges an agent's branch into target branch
   */
  async mergeBranch(agentId: string, targetBranch: string = 'main', deleteBranch: boolean = false): Promise<void> {
    const workspace = this.workspaces.get(agentId);
    if (!workspace) {
      throw new Error(`No workspace found for agent ${agentId}`);
    }

    try {
      // Switch to target branch in main repo
      execSync(`git checkout ${targetBranch}`, {
        cwd: this.baseRepoPath,
        stdio: 'pipe',
      });

      // Merge the agent's branch
      execSync(`git merge ${workspace.branchName} --no-edit`, {
        cwd: this.baseRepoPath,
        stdio: 'pipe',
      });

      // Optionally delete the branch
      if (deleteBranch) {
        execSync(`git branch -d ${workspace.branchName}`, {
          cwd: this.baseRepoPath,
          stdio: 'pipe',
        });
      }
    } catch (error: unknown) {
      throw new Error(`Failed to merge branch: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets the diff for an agent's workspace
   */
  getDiff(agentId: string, targetBranch: string = 'main'): string {
    const workspace = this.workspaces.get(agentId);
    if (!workspace) {
      throw new Error(`No workspace found for agent ${agentId}`);
    }

    try {
      return execSync(`git diff ${targetBranch}...${workspace.branchName}`, {
        cwd: this.baseRepoPath,
        encoding: 'utf-8',
      });
    } catch (error: unknown) {
      throw new Error(`Failed to get diff: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets workspace info for an agent
   */
  getWorkspace(agentId: string): WorkspaceInfo | undefined {
    return this.workspaces.get(agentId);
  }

  /**
   * Lists all active workspaces
   */
  listWorkspaces(): WorkspaceInfo[] {
    return Array.from(this.workspaces.values());
  }

  /**
   * Cleanup all worktrees (useful for shutdown)
   */
  async cleanup(): Promise<void> {
    const agentIds = Array.from(this.workspaces.keys());
    for (const agentId of agentIds) {
      try {
        await this.removeWorktree(agentId, true);
      } catch (error) {
        console.error(`Failed to cleanup worktree for ${agentId}:`, error);
      }
    }
  }
}
