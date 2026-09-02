class LUMIQAPI {
  constructor() {
    const metaBase = document.querySelector('meta[name="api-base"]')?.content.trim() || '';
    const hasConfiguredBase = metaBase && !metaBase.startsWith('__') && metaBase !== 'port/8000';
    const isLocal = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
    this.baseURL = hasConfiguredBase ? metaBase : (isLocal ? 'http://localhost:8000' : window.location.origin);
    this.token = null;
    this.user = null;
  }

  setToken(token) { this.token = token; }
  setUser(user) { this.user = user; }

  async request(method, endpoint, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    let res;
    try {
      res = await fetch(`${this.baseURL}/api/${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch (error) {
      throw new Error('Unable to connect to the LUMIQ server. Start the backend on port 8000 and try again.');
    }
    if (res.status === 401) { window.location.hash = '#/login'; throw new Error('Session expired'); }
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Request failed'); }
    return res.json();
  }

  // Auth
  login(email, password, loginType, name) { return this.request('POST', 'auth/login', { email, password, login_type: loginType, name }); }
  changePassword(currentPassword, newPassword) { return this.request('POST', 'auth/change-password', { current_password: currentPassword, new_password: newPassword }); }
  logout() { return this.request('POST', 'auth/logout'); }
  me() { return this.request('GET', 'auth/me'); }

  // Dashboard
  dashboard() { return this.request('GET', 'dashboard'); }

  // Clients
  clients() { return this.request('GET', 'clients'); }
  client(id) { return this.request('GET', `clients/${id}`); }
  createClient(data) { return this.request('POST', 'clients', data); }
  updateClient(id, data) { return this.request('PUT', `clients/${id}`, data); }
  deleteClient(id) { return this.request('DELETE', `clients/${id}`); }

  // Projects
  projects(status, clientId) { return this.request('GET', `projects?status=${status || 'all'}&client_id=${clientId || ''}`); }
  project(id) { return this.request('GET', `projects/${id}`); }
  createProject(data) { return this.request('POST', 'projects', data); }
  updateProject(id, data) { return this.request('PUT', `projects/${id}`, data); }
  deleteProject(id) { return this.request('DELETE', `projects/${id}`); }
  addPayment(projectId, data) { return this.request('POST', `projects/${projectId}/payments`, data); }
  addTask(projectId, data) { return this.request('POST', `projects/${projectId}/tasks`, data); }

  // Expenses
  expenses(category, status) { return this.request('GET', `expenses?category=${category || 'all'}&status=${status || 'all'}`); }
  createExpense(data) { return this.request('POST', 'expenses', data); }

  // Transactions
  transactions(type, status) { return this.request('GET', `transactions?type=${type || 'all'}&status=${status || 'all'}`); }
  createTransaction(data) { return this.request('POST', 'transactions', data); }

  // Team
  team() { return this.request('GET', 'team'); }
  teamMember(id) { return this.request('GET', `team/${id}`); }
  addEntry(workerId, data) { return this.request('POST', `team/${workerId}/entries`, data); }

  // Worker management
  createWorker(data) { return this.request('POST', 'workers', data); }
  deactivateWorker(id) { return this.request('PUT', `workers/${id}/deactivate`); }
  activateWorker(id) { return this.request('PUT', `workers/${id}/activate`); }
  deleteWorker(id) { return this.request('DELETE', `workers/${id}`); }
  resetWorkerPassword(id) { return this.request('POST', `workers/${id}/reset-password`); }

  // Approvals
  approvals() { return this.request('GET', 'approvals'); }
  approveRequest(id, notes) { return this.request('POST', `approvals/${id}/approve`, { notes }); }
  rejectRequest(id, notes) { return this.request('POST', `approvals/${id}/reject`, { notes }); }
  requestChanges(id, notes) { return this.request('POST', `approvals/${id}/changes`, { notes }); }

  // Permissions
  permissionRequests() { return this.request('GET', 'permissions/requests'); }
  requestPermission(data) { return this.request('POST', 'permissions/request', data); }
  approvePermission(id, notes) { return this.request('POST', `permissions/${id}/approve`, { notes }); }
  denyPermission(id, notes) { return this.request('POST', `permissions/${id}/deny`, { notes }); }
  workerPermissions() { return this.request('GET', 'permissions/workers'); }

  // Chat
  chatRooms() { return this.request('GET', 'chat/rooms'); }
  createChatRoom(data) { return this.request('POST', 'chat/rooms', data); }
  chatMessages(roomId) { return this.request('GET', `chat/rooms/${roomId}/messages`); }
  sendMessage(roomId, data) { return this.request('POST', `chat/rooms/${roomId}/messages`, data); }
  chatMembers() { return this.request('GET', 'chat/members'); }

  // Pricing
  pricingRules() { return this.request('GET', 'pricing/rules'); }
  calculatePricing(data) { return this.request('POST', 'pricing/calculate', data); }
  generateProposal(calcId, data) { return this.request('POST', `pricing/${calcId}/proposal`, data); }
  convertToProject(calcId, data) { return this.request('POST', `pricing/${calcId}/convert`, data); }

  // Reports
  report(type) { return this.request('GET', `reports/${type}`); }

  // Audit & Activity
  auditLogs() { return this.request('GET', 'audit'); }
  activityLogs() { return this.request('GET', 'activity'); }

  // Settings
  settings() { return this.request('GET', 'settings'); }
  updateSettings(data) { return this.request('PUT', 'settings', data); }

  // Notifications
  notifications() { return this.request('GET', 'notifications'); }
  markNotificationRead(id) { return this.request('PUT', `notifications/${id}/read`); }
  markAllNotificationsRead() { return this.request('PUT', 'notifications/read-all'); }
}

const api = new LUMIQAPI();
