/**
 * Express web server with WebSocket support for Minion
 */

import express, { type Request, type Response } from 'express';
import { createServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { AgentManager } from './agentManager.js';
import { WorkspaceManager } from './workspaceManager.js';
import type { TaskRequest, MergeRequest, WebSocketMessage } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MINIONServer {
	private app: express.Application;
	private server: any;
	private wss: WebSocketServer;
	private agentManager: AgentManager;
	private workspaceManager: WorkspaceManager;
	private port: number;
	private clients: Set<WebSocket> = new Set();

	constructor(port: number = 3000, baseRepoPath?: string, apiKey?: string) {
		this.port = port;
		this.app = express();
		this.server = createServer(this.app);
		this.wss = new WebSocketServer({ server: this.server });

		// Initialize managers
		this.workspaceManager = new WorkspaceManager(baseRepoPath);
		this.agentManager = new AgentManager(this.workspaceManager, apiKey);

		this.setupMiddleware();
		this.setupRoutes();
		this.setupWebSocket();
		this.setupEventListeners();
	}

	private setupMiddleware(): void {
		this.app.use(cors());
		this.app.use(express.json());
		// Serve React build (production) or fallback to public (development)
		this.app.use(express.static(join(__dirname, '../../dist-ui')));
	}

	private setupRoutes(): void {
		const router = express.Router();

		// Health check
		router.get('/health', (req: Request, res: Response) => {
			res.json({ status: 'ok', timestamp: new Date() });
		});

		// Agent routes
		router.post('/agents', async (req: Request, res: Response) => {
			try {
				const { name, apiKey } = req.body;
				if (!name) {
					res.status(400).json({ error: 'Agent name is required' });
					return;
				}
				const agent = await this.agentManager.createAgent(name, apiKey);
				res.status(201).json(agent);
			} catch (error: any) {
				res.status(500).json({ error: error.message });
			}
		});

		router.get('/agents', (req: Request, res: Response) => {
			const agents = this.agentManager.listAgents();
			res.json(agents);
		});

		router.get('/agents/:id', (req: Request, res: Response) => {
			const agent = this.agentManager.getAgent(req.params.id);
			if (!agent) {
				res.status(404).json({ error: 'Agent not found' });
				return;
			}
			res.json(agent);
		});

		router.post('/agents/:id/tasks', async (req: Request, res: Response) => {
			try {
				const taskRequest: TaskRequest = req.body;
				if (!taskRequest.description) {
					res.status(400).json({ error: 'Task description is required' });
					return;
				}
				const task = await this.agentManager.assignTask(req.params.id, taskRequest);
				res.status(201).json(task);
			} catch (error: any) {
				res.status(500).json({ error: error.message });
			}
		});

		router.post('/agents/:id/stop', async (req: Request, res: Response) => {
			try {
				await this.agentManager.stopAgent(req.params.id);
				res.json({ success: true });
			} catch (error: any) {
				res.status(500).json({ error: error.message });
			}
		});

		router.delete('/agents/:id', async (req: Request, res: Response) => {
			try {
				const force = req.query.force === 'true';
				await this.agentManager.removeAgent(req.params.id, force);
				res.json({ success: true });
			} catch (error: any) {
				res.status(500).json({ error: error.message });
			}
		});

		router.get('/agents/:id/tasks', (req: Request, res: Response) => {
			const tasks = this.agentManager.listTasksForAgent(req.params.id);
			res.json(tasks);
		});

		router.get('/agents/:id/diff', (req: Request, res: Response) => {
			try {
				const targetBranch = (req.query.target as string) || 'main';
				const diff = this.workspaceManager.getDiff(req.params.id, targetBranch);
				res.json({ diff });
			} catch (error: any) {
				res.status(500).json({ error: error.message });
			}
		});

		router.post('/agents/:id/merge', async (req: Request, res: Response) => {
			try {
				const mergeRequest: MergeRequest = req.body;
				const targetBranch = mergeRequest.targetBranch || 'main';
				const deleteBranch = mergeRequest.deleteWorktree || false;

				await this.workspaceManager.mergeBranch(req.params.id, targetBranch, deleteBranch);
				res.json({ success: true });
			} catch (error: any) {
				res.status(500).json({ error: error.message });
			}
		});

		// Workspace routes
		router.get('/workspaces', (req: Request, res: Response) => {
			const workspaces = this.workspaceManager.listWorkspaces();
			res.json(workspaces);
		});

		this.app.use('/api', router);

		// SPA fallback - serve index.html for all non-API routes
		this.app.use((req, res) => {
			res.sendFile(join(__dirname, '../../dist-ui/index.html'));
		});
	}

	private setupWebSocket(): void {
		this.wss.on('connection', (ws: WebSocket) => {
			console.log('New WebSocket client connected');
			this.clients.add(ws);

			ws.on('close', () => {
				console.log('WebSocket client disconnected');
				this.clients.delete(ws);
			});

			ws.on('error', (error) => {
				console.error('WebSocket error:', error);
				this.clients.delete(ws);
			});

			// Send current state to new client
			const agents = this.agentManager.listAgents();
			ws.send(
				JSON.stringify({
					type: 'initial_state',
					data: { agents },
					timestamp: new Date(),
				})
			);
		});
	}

	private setupEventListeners(): void {
		// Broadcast agent events to all WebSocket clients
		this.agentManager.on('agent_created', (data) => {
			this.broadcast({ type: 'agent_status', agentId: data.id, timestamp: new Date(), data });
		});

		this.agentManager.on('agent_status_changed', (data) => {
			this.broadcast({ type: 'agent_status', agentId: data.agentId, timestamp: new Date(), data });
		});

		this.agentManager.on('task_status_changed', (data) => {
			this.broadcast({ type: 'task_update', agentId: data.agentId, timestamp: new Date(), data });
		});

		this.agentManager.on('agent_log', (data) => {
			this.broadcast({ type: 'agent_log', agentId: data.agentId, timestamp: new Date(), data });
		});

		this.agentManager.on('task_completed', (data) => {
			this.broadcast({ type: 'task_update', agentId: data.agentId, timestamp: new Date(), data });
		});

		this.agentManager.on('task_error', (data) => {
			this.broadcast({ type: 'error', agentId: data.agentId, timestamp: new Date(), data });
		});

		this.agentManager.on('agent_stopped', (data) => {
			this.broadcast({ type: 'agent_status', agentId: data.agentId, timestamp: new Date(), data });
		});

		this.agentManager.on('agent_removed', (data) => {
			this.broadcast({ type: 'agent_status', agentId: data.agentId, timestamp: new Date(), data });
		});
	}

	private broadcast(message: WebSocketMessage): void {
		const payload = JSON.stringify(message);
		this.clients.forEach((client) => {
			if (client.readyState === 1) {
				// OPEN
				client.send(payload);
			}
		});
	}

	async start(): Promise<void> {
		return new Promise((resolve) => {
			this.server.listen(this.port, () => {
				console.log(`\n🎵 Minion Server running at http://localhost:${this.port}`);
				console.log(`📡 WebSocket ready for real-time updates`);
				console.log(`📁 Working directory: ${this.workspaceManager['baseRepoPath']}\n`);
				resolve();
			});
		});
	}

	async stop(): Promise<void> {
		console.log('\n🛑 Shutting down Minion...');

		// Cleanup agents and workspaces
		await this.agentManager.cleanup();
		await this.workspaceManager.cleanup();

		// Close WebSocket connections
		this.clients.forEach((client) => {
			client.close();
		});

		// Close server
		return new Promise((resolve, reject) => {
			this.server.close((error?: Error) => {
				if (error) reject(error);
				else {
					console.log('✅ Minion stopped gracefully');
					resolve();
				}
			});
		});
	}
}
