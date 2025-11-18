/**
 * Minion Web UI - Frontend JavaScript
 */

class MINIONUI {
  constructor() {
    this.ws = null;
    this.agents = new Map();
    this.currentAgentForTask = null;
    this.currentAgentForDiff = null;
    this.apiBaseUrl = window.location.origin;

    this.init();
  }

  init() {
    this.setupWebSocket();
    this.setupEventListeners();
    this.loadAgents();
  }

  setupWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.updateConnectionStatus(true);
    };

    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    };

    this.ws.onerror = error => {
      console.error('WebSocket error:', error);
      this.updateConnectionStatus(false);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.updateConnectionStatus(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.setupWebSocket(), 5000);
    };
  }

  updateConnectionStatus(connected) {
    const statusDot = document.getElementById('wsStatus');
    const statusText = document.getElementById('wsStatusText');

    if (connected) {
      statusDot.classList.add('connected');
      statusText.textContent = 'Connected';
    } else {
      statusDot.classList.remove('connected');
      statusText.textContent = 'Disconnected';
    }
  }

  handleWebSocketMessage(message) {
    console.log('WebSocket message:', message);

    switch (message.type) {
      case 'initial_state':
        message.data.agents.forEach(agent => {
          this.agents.set(agent.id, agent);
        });
        this.renderAgents();
        break;

      case 'agent_status':
        this.loadAgents(); // Refresh all agents
        break;

      case 'task_update':
        this.loadAgents(); // Refresh all agents
        break;

      case 'agent_log':
        console.log(`Agent ${message.agentId}:`, message.data);
        break;

      case 'error':
        console.error(`Error from agent ${message.agentId}:`, message.data);
        this.loadAgents();
        break;
    }
  }

  setupEventListeners() {
    // Create Agent Modal
    document.getElementById('createAgentBtn').addEventListener('click', () => {
      this.showModal('createAgentModal');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      this.hideModal('createAgentModal');
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.hideModal('createAgentModal');
    });

    document.getElementById('confirmCreateBtn').addEventListener('click', () => {
      this.createAgent();
    });

    // Task Modal
    document.getElementById('closeTaskModalBtn').addEventListener('click', () => {
      this.hideModal('taskModal');
    });

    document.getElementById('cancelTaskBtn').addEventListener('click', () => {
      this.hideModal('taskModal');
    });

    document.getElementById('confirmTaskBtn').addEventListener('click', () => {
      this.assignTask();
    });

    // Diff Modal
    document.getElementById('closeDiffModalBtn').addEventListener('click', () => {
      this.hideModal('diffModal');
    });

    document.getElementById('closeDiffBtn').addEventListener('click', () => {
      this.hideModal('diffModal');
    });

    document.getElementById('mergeDiffBtn').addEventListener('click', () => {
      this.mergeChanges();
    });

    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.loadAgents();
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          this.hideModal(modal.id);
        }
      });
    });
  }

  showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  async loadAgents() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/agents`);
      const agents = await response.json();

      this.agents.clear();
      agents.forEach(agent => {
        this.agents.set(agent.id, agent);
      });

      this.renderAgents();
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }

  renderAgents() {
    const grid = document.getElementById('agentsGrid');
    const emptyState = document.getElementById('emptyState');

    if (this.agents.size === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    // Clear existing cards (except empty state)
    grid.querySelectorAll('.agent-card').forEach(card => card.remove());

    this.agents.forEach(agent => {
      const card = this.createAgentCard(agent);
      grid.appendChild(card);
    });
  }

  createAgentCard(agent) {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.dataset.agentId = agent.id;

    const statusClass = `status-${agent.status}`;
    const statusText = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);

    let taskHtml = '';
    if (agent.currentTask) {
      taskHtml = `
                <div class="current-task">
                    <div class="task-description">${this.escapeHtml(agent.currentTask.description)}</div>
                    <div class="task-status">Status: ${agent.currentTask.status}</div>
                </div>
            `;
    }

    card.innerHTML = `
            <div class="agent-header">
                <div>
                    <div class="agent-name">${this.escapeHtml(agent.name)}</div>
                    <div class="agent-id">${agent.id.slice(0, 8)}</div>
                </div>
                <span class="agent-status ${statusClass}">${statusText}</span>
            </div>

            <div class="agent-info">
                <div class="info-row">
                    <span class="info-label">Branch:</span>
                    <span class="info-value">${this.escapeHtml(agent.branchName)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Created:</span>
                    <span class="info-value">${new Date(agent.createdAt).toLocaleTimeString()}</span>
                </div>
            </div>

            ${taskHtml}

            <div class="agent-actions">
                <button class="btn btn-primary btn-small" onclick="minion.showTaskModal('${agent.id}')">
                    Assign Task
                </button>
                <button class="btn btn-secondary btn-small" onclick="minion.viewDiff('${agent.id}')">
                    View Changes
                </button>
                ${
                  agent.status === 'running'
                    ? `<button class="btn btn-danger btn-small" onclick="minion.stopAgent('${agent.id}')">Stop</button>`
                    : `<button class="btn btn-danger btn-small" onclick="minion.removeAgent('${agent.id}')">Remove</button>`
                }
            </div>
        `;

    return card;
  }

  async createAgent() {
    const name = document.getElementById('agentName').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!name) {
      alert('Please enter an agent name');
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, apiKey: apiKey || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create agent');
      }

      const agent = await response.json();
      this.agents.set(agent.id, agent);
      this.renderAgents();

      // Clear form and close modal
      document.getElementById('agentName').value = '';
      document.getElementById('apiKey').value = '';
      this.hideModal('createAgentModal');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  showTaskModal(agentId) {
    this.currentAgentForTask = agentId;
    this.showModal('taskModal');
  }

  async assignTask() {
    if (!this.currentAgentForTask) return;

    const description = document.getElementById('taskDescription').value.trim();
    const context = document.getElementById('taskContext').value.trim();

    if (!description) {
      alert('Please enter a task description');
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/agents/${this.currentAgentForTask}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, context: context || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign task');
      }

      // Clear form and close modal
      document.getElementById('taskDescription').value = '';
      document.getElementById('taskContext').value = '';
      this.hideModal('taskModal');

      // Refresh agents
      setTimeout(() => this.loadAgents(), 500);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  async viewDiff(agentId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/agents/${agentId}/diff`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get diff');
      }

      const data = await response.json();
      this.currentAgentForDiff = agentId;

      const diffContent = document.getElementById('diffContent');
      diffContent.textContent = data.diff || 'No changes yet';

      this.showModal('diffModal');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  async mergeChanges() {
    if (!this.currentAgentForDiff) return;

    if (!confirm('Are you sure you want to merge these changes into the main branch?')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/agents/${this.currentAgentForDiff}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetBranch: 'main', deleteWorktree: false }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to merge');
      }

      alert('Changes merged successfully!');
      this.hideModal('diffModal');
      this.loadAgents();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  async stopAgent(agentId) {
    if (!confirm('Are you sure you want to stop this agent?')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/agents/${agentId}/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stop agent');
      }

      this.loadAgents();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  async removeAgent(agentId) {
    if (!confirm('Are you sure you want to remove this agent? This will delete its workspace.')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/agents/${agentId}?force=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove agent');
      }

      this.agents.delete(agentId);
      this.renderAgents();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the UI
const minion = new MINIONUI();
