// ==================== LUMIQ APPLICATION ====================
const state = {
  currentPage: 'dashboard',
  user: null,
  org: null,
  data: {},
  charts: {},
  sidebarCollapsed: false,
  theme: 'dark',
  notifications: [],
  notificationRefreshInterval: null,
};

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function fmt(n) { return new Intl.NumberFormat('en-AE').format(Math.round(n || 0)); }
function fmtAED(n) { return `AED ${fmt(n)}`; }
function fmtDate(d) { if (!d) return 'N/A'; return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
function fmtDateShort(d) { if (!d) return 'N/A'; return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); }
function fmtDateTime(d) { if (!d) return 'N/A'; return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function pct(n) { return `${Math.round((n || 0) * 10) / 10}%`; }
function avatar(name) { return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'; }
function statusColor(s) { return { 'active': 'var(--green)', 'planning': 'var(--blue)', 'completed': 'var(--green)', 'on_hold': 'var(--amber)', 'awaiting_client': 'var(--amber)', 'cancelled': 'var(--red)', 'pending': 'var(--amber)', 'approved': 'var(--green)', 'rejected': 'var(--red)', 'changes_requested': 'var(--amber)', 'todo': 'var(--amber)', 'in_progress': 'var(--blue)', 'review': 'var(--amber)', 'done': 'var(--green)' }[s] || 'var(--gray3)'; }
function statusLabel(s) { return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

function getMarginStatus(margin, settings) {
  if (!settings) return '—';
  if (margin >= settings.profit_threshold_healthy) return { label: 'Excellent', color: 'var(--green)' };
  if (margin >= settings.profit_threshold_moderate) return { label: 'Healthy', color: 'var(--green)' };
  if (margin >= settings.profit_threshold_low) return { label: 'Moderate', color: 'var(--amber)' };
  return { label: 'Low', color: 'var(--red)' };
}

// ==================== LOGIN PAGE ====================

function renderLogin() {
  const loginType = state.loginType || 'owner';
  const isStaffLogin = loginType === 'owner' || loginType === 'co_owner';
  const roleLabel = loginType === 'co_owner' ? 'Co-Owner Login' : loginType === 'worker' ? 'Worker Login' : 'Sign in to your account';
  
  $('#app').innerHTML = `
    <div class="login-bg"></div>
    <div class="login-container">
      <div class="login-left">
        <div class="login-logo">
          <img src="lumiqlogo.png" alt="LUMIQ logo" class="login-logo-image">
        </div>
        <h1 class="login-hero">Run Projects.<br>Track Money.<br>Grow Smarter.</h1>
        <p class="login-sub">The complete financial operating system for modern creative agencies.</p>
        <div class="login-features">
          <div class="login-feature"><div class="login-feature-dot"></div>Real-time project financial tracking</div>
          <div class="login-feature"><div class="login-feature-dot"></div>Smart pricing & profitability analysis</div>
          <div class="login-feature"><div class="login-feature-dot"></div>Multi-level approval workflows</div>
          <div class="login-feature"><div class="login-feature-dot"></div>Comprehensive audit & activity logs</div>
        </div>
      </div>
      <div class="login-card">
        <div class="login-toggle">
          <button class="login-toggle-btn ${loginType === 'owner' ? 'active' : ''}" data-type="owner">Owner</button>
          <button class="login-toggle-btn ${loginType === 'co_owner' ? 'active' : ''}" data-type="co_owner">Co-Owner</button>
          <button class="login-toggle-btn ${loginType === 'worker' ? 'active' : ''}" data-type="worker">Worker</button>
        </div>
        <h2 class="login-title">${roleLabel}</h2>
        <p class="login-desc">${isStaffLogin ? 'Enter your credentials to access the LUMIQ dashboard' : 'Enter your registered worker name and password'}</p>
        <form id="login-form" class="login-form">
          ${isStaffLogin ? `
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="login-email" placeholder="you@lumiq.ae" required autocomplete="email" />
            </div>
          ` : `
            <div class="form-group">
              <label>Worker Name</label>
              <input type="text" id="login-name" placeholder="Enter your registered name" required autocomplete="name" />
            </div>
          `}
          <div class="form-group">
            <label>Password</label>
            <div class="password-field">
              <input type="password" id="login-password" placeholder="Enter your password" required autocomplete="current-password" />
              <button type="button" class="password-toggle" aria-label="Show password" title="Show password">
                <svg class="password-eye" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8"/>
                </svg>
              </button>
            </div>
          </div>
          <div id="login-error" class="login-error" style="display:none"></div>
          <button type="submit" class="login-submit">Sign In</button>
        </form>
        <div class="login-footer">
          <div class="login-hint">${isStaffLogin ? `${loginType === 'owner' ? 'Owner' : 'Co-Owner'} access only` : 'Workers must be registered by the Owner'}</div>
          <div class="login-brand">LUMIQ · Agency Management System</div>
        </div>
      </div>
    </div>
  `;

  // Toggle login type
  $$('.login-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.loginType = btn.dataset.type;
      renderLogin();
      setTimeout(() => { const inp = $('#login-email') || $('#login-name'); if (inp) inp.focus(); }, 50);
    });
  });

  $('.password-toggle').addEventListener('click', () => {
    const passwordInput = $('#login-password');
    const shouldShow = passwordInput.type === 'password';
    passwordInput.type = shouldShow ? 'text' : 'password';
    const toggle = $('.password-toggle');
    toggle.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
    toggle.setAttribute('title', shouldShow ? 'Hide password' : 'Show password');
  });

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email')?.value || '';
    const name = $('#login-name')?.value || '';
    const password = $('#login-password').value;
    const errEl = $('#login-error');
    errEl.style.display = 'none';

    try {
      const res = await api.login(email, password, loginType, name);
      api.setToken(res.token);
      api.setUser(res.user);
      state.user = res.user;
      state.token = res.token;

      if (res.must_change_password) {
        renderChangePassword();
      } else if (loginType === 'worker') {
        renderConfidentialityNotice();
      } else {
        initApp();
      }
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  });

  setTimeout(() => { const inp = $('#login-email') || $('#login-name'); if (inp) inp.focus(); }, 100);
}

// ==================== CHANGE PASSWORD (Forced) ====================

function renderChangePassword() {
  $('#app').innerHTML = `
    <div class="login-bg"></div>
    <div class="change-pw-container">
      <div class="change-pw-card">
        <div class="change-pw-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect x="18" y="24" width="20" height="16" rx="3" stroke="var(--green)" stroke-width="2.5"/>
            <path d="M22 24 V20 a6 6 0 0 1 12 0 V24" stroke="var(--green)" stroke-width="2.5" fill="none"/>
            <circle cx="28" cy="32" r="2" fill="var(--green)"/>
          </svg>
        </div>
        <h2 class="change-pw-title">Security: Change Your Password</h2>
        <p class="change-pw-desc">For your security, you must change your initial password before continuing. Choose a strong password you haven't used before.</p>
        <form id="change-pw-form" class="change-pw-form">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" id="cpw-current" required autocomplete="current-password" />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="cpw-new" required autocomplete="new-password" minlength="8" />
            <div class="form-hint">Minimum 8 characters</div>
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" id="cpw-confirm" required autocomplete="new-password" />
          </div>
          <div id="cpw-error" class="login-error" style="display:none"></div>
          <button type="submit" class="login-submit">Update Password & Continue</button>
        </form>
      </div>
    </div>
  `;

  $('#change-pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = $('#cpw-current').value;
    const newPw = $('#cpw-new').value;
    const confirm = $('#cpw-confirm').value;
    const errEl = $('#cpw-error');
    errEl.style.display = 'none';

    if (newPw !== confirm) { errEl.textContent = 'Passwords do not match'; errEl.style.display = 'block'; return; }
    if (newPw.length < 8) { errEl.textContent = 'Password must be at least 8 characters'; errEl.style.display = 'block'; return; }

    try {
      await api.changePassword(current, newPw);
      state.user.must_change_password = 0;
      if (state.user.role === 'worker') {
        renderConfidentialityNotice();
      } else {
        initApp();
      }
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  });
}

// ==================== CONFIDENTIALITY NOTICE ====================

function renderConfidentialityNotice() {
  const org = state.org || {};
  const policy = org.confidentiality_policy || 'Company information is confidential. LUMIQ financial information, client information, project information, pricing, revenue, expenses, internal communications, and other company data must not be shared outside the company without authorization. Unauthorized disclosure or misuse of confidential company information may result in disciplinary action, removal of access, and other consequences in accordance with company policy and applicable law.';

  $('#app').innerHTML = `
    <div class="login-bg"></div>
    <div class="confidential-container">
      <div class="confidential-card">
        <div class="confidential-header">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 6 L40 12 V24 C40 34 33 40 24 42 C15 40 8 34 8 24 V12 Z" stroke="var(--green)" stroke-width="2.5" fill="none"/>
            <path d="M18 24 L22 28 L30 20" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h2>LUMIQ Confidentiality Notice</h2>
        </div>
        <div class="confidential-body">
          <p class="confidential-intro">Company information is confidential.</p>
          <div class="confidential-policy">${policy}</div>
        </div>
        <button id="confidential-accept" class="login-submit">I Understand & Continue</button>
      </div>
    </div>
  `;

  $('#confidential-accept').addEventListener('click', () => {
    initApp();
  });
}

// ==================== INIT APP ====================

async function initApp() {
  // Fetch org settings
  try {
    const settingsRes = await api.settings();
    state.org = settingsRes.organization;
    state.settings = settingsRes.settings;
  } catch (e) { /* worker may not have access */ }

  // Start notification polling
  startNotificationPolling();

  // Route
  const hash = window.location.hash.replace('#/', '') || 'dashboard';
  state.currentPage = hash.split('/')[0];
  renderShell();
  await loadPage(state.currentPage);
}

// ==================== SHELL (Sidebar + Topbar) ====================

function renderShell() {
  const isWorker = state.user.role === 'worker';
  const navItems = isWorker ? [
    { id: 'dashboard', label: 'My Dashboard', icon: 'grid' },
    { id: 'chat', label: 'Chat', icon: 'chat' },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'clients', label: 'Clients', icon: 'users' },
    { id: 'projects', label: 'Projects', icon: 'folder' },
    { id: 'finance', label: 'Finance', icon: 'wallet' },
    { id: 'transactions', label: 'Transactions', icon: 'exchange' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt' },
    { id: 'team', label: 'Team', icon: 'people' },
    { id: 'chat', label: 'Chat', icon: 'chat' },
    { id: 'approvals', label: 'Approvals', icon: 'check' },
    { id: 'pricing', label: 'Pricing Calculator', icon: 'calculator' },
    { id: 'reports', label: 'Reports', icon: 'chart' },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  $('#app').innerHTML = `
    <aside class="sidebar ${state.sidebarCollapsed ? 'collapsed' : ''}" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M16 16 L16 32 M16 16 L28 16 M16 24 L24 24" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="32" cy="28" r="6" stroke="var(--green)" stroke-width="2.5" fill="none"/>
            <path d="M36 32 L40 36" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          ${state.sidebarCollapsed ? '' : '<span>LUMIQ</span>'}
        </div>
        <button class="sidebar-collapse" id="sidebar-collapse">${state.sidebarCollapsed ? '▶' : '◀'}</button>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(item => `
          <a href="#/${item.id}" class="nav-item ${state.currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
            ${navIcon(item.icon)}
            <span class="nav-label">${item.label}</span>
            ${item.id === 'approvals' ? '<span class="nav-badge" id="nav-approvals-badge" style="display:none"></span>' : ''}
            ${item.id === 'chat' ? '<span class="nav-badge" id="nav-chat-badge" style="display:none"></span>' : ''}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar">${avatar(state.user.name)}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${state.user.name}</div>
            <div class="sidebar-user-role">${statusLabel(state.user.role)}</div>
          </div>
        </div>
        <button class="sidebar-logout" id="logout-btn">Sign Out</button>
      </div>
    </aside>
    <div class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">${getPageTitle(state.currentPage)}</h1>
        </div>
        <div class="topbar-right">
          <div class="topbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M16 16 L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <input type="text" placeholder="Search..." />
          </div>
          <button class="topbar-icon-btn" id="notif-btn" title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span class="notif-badge" id="notif-count" style="display:none">0</span>
          </button>
          <div class="topbar-user">
            <div class="avatar">${avatar(state.user.name)}</div>
            <div class="topbar-user-info">
              <div class="topbar-user-name">${state.user.name}</div>
              <div class="topbar-user-role">${statusLabel(state.user.role)}</div>
            </div>
          </div>
        </div>
      </header>
      <div class="notification-dropdown" id="notif-dropdown" style="display:none">
        <div class="notif-dropdown-header">
          <span>Notifications</span>
          <button id="notif-mark-all">Mark all read</button>
        </div>
        <div class="notif-dropdown-list" id="notif-list"></div>
      </div>
      <main class="page-content" id="page-content">
        <div class="loading-spinner"><div class="spinner"></div></div>
      </main>
    </div>
  `;

  // Sidebar collapse
  $('#sidebar-collapse').addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    renderShell();
    loadPage(state.currentPage);
  });

  // Nav routing
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      window.location.hash = `#/${page}`;
    });
  });

  // Logout
  $('#logout-btn').addEventListener('click', async () => {
    try { await api.logout(); } catch (e) {}
    api.setToken(null);
    api.setUser(null);
    state.user = null;
    state.token = null;
    stopNotificationPolling();
    window.location.hash = '#/login';
    renderLogin();
  });

  // Notification button
  $('#notif-btn').addEventListener('click', () => {
    const dd = $('#notif-dropdown');
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
  });

  // Click outside closes notification dropdown
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown')) {
      const dd = $('#notif-dropdown');
      if (dd) dd.style.display = 'none';
    }
  });

  // Mark all notifications read
  $('#notif-mark-all')?.addEventListener('click', async () => {
    await api.markAllNotificationsRead();
    await refreshNotifications();
  });

  // Load notifications
  refreshNotifications();
}

function getPageTitle(page) {
  const titles = {
    dashboard: state.user?.role === 'worker' ? 'My Dashboard' : 'Dashboard',
    clients: 'Clients', projects: 'Projects', finance: 'Financial Overview',
    transactions: 'Transactions', expenses: 'Expense Tracker',
    team: 'Team', chat: 'Team Chat', approvals: 'Approval Center',
    pricing: 'Pricing Calculator', reports: 'Reports', settings: 'Settings',
  };
  return titles[page] || 'Dashboard';
}

function navIcon(name) {
  const icons = {
    grid: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/></svg>',
    users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    folder: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wallet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    exchange: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 3l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 7H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 21l-4-4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    receipt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 21V3h14v18l-3-2-2 2-2-2-2 2-3-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    people: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    chat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    calculator: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2"/><line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="10" x2="8" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="10" x2="12" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="14" x2="8" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="14" x2="12" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="14" x2="16" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 14l4-4 4 4 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  return icons[name] || icons.grid;
}

// ==================== PAGE ROUTER ====================

async function loadPage(page) {
  state.currentPage = page;
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === page));
  $('#page-content').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    const pages = {
      dashboard: renderDashboard, clients: renderClients, projects: renderProjects,
      finance: renderFinance, transactions: renderTransactions, expenses: renderExpenses,
      team: renderTeam, chat: renderChat, approvals: renderApprovals,
      pricing: renderPricing, reports: renderReports, settings: renderSettings,
    };
    if (pages[page]) await pages[page]();
    else await renderDashboard();
  } catch (err) {
    $('#page-content').innerHTML = `<div class="error-state"><div class="error-icon">!</div><h2>Something went wrong</h2><p>${err.message}</p></div>`;
  }
}

// ==================== EMPTY STATE COMPONENT ====================

function emptyState(title, message, actionLabel, actionFn) {
  const id = 'empty-action-' + Math.random().toString(36).slice(2, 8);
  setTimeout(() => {
    const btn = $('#' + id);
    if (btn && actionFn) btn.addEventListener('click', actionFn);
  }, 100);
  return `
    <div class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="12" width="40" height="40" rx="10" stroke="var(--gray4)" stroke-width="2" opacity="0.3"/>
          <path d="M24 32 L40 32 M32 24 L32 40" stroke="var(--gray4)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
        </svg>
      </div>
      <h3 class="empty-title">${title}</h3>
      <p class="empty-message">${message}</p>
      ${actionLabel ? `<button class="empty-action" id="${id}">${actionLabel}</button>` : ''}
    </div>
  `;
}

function emptyChart(canvasId, label) {
  return `
    <div class="empty-chart-state">
      <div class="empty-chart-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M8 40 V8 M8 40 H40" stroke="var(--gray4)" stroke-width="2" opacity="0.3"/>
          <path d="M14 34 L20 28 L26 32 L34 18" stroke="var(--gray4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.2" stroke-dasharray="3 3"/>
        </svg>
      </div>
      <p class="empty-chart-text">${label || 'No data to display yet'}</p>
    </div>
  `;
}

// ==================== DASHBOARD ====================

async function renderDashboard() {
  const data = await api.dashboard();

  if (state.user.role === 'worker') {
    renderWorkerDashboard(data);
    return;
  }

  const k = data.kpis;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const kpiCards = [
    { label: 'Total Revenue', value: fmtAED(k.totalRevenue), icon: 'wallet', accent: 'green' },
    { label: 'Outstanding', value: fmtAED(k.outstanding), icon: 'alert', accent: 'amber' },
    { label: 'Net Profit', value: fmtAED(k.netProfit), icon: 'trending', accent: k.netProfit >= 0 ? 'green' : 'red' },
    { label: 'Expenses', value: fmtAED(k.expenses), icon: 'receipt', accent: 'red' },
    { label: 'Pending Payments', value: k.pendingPaymentsCount, icon: 'clock', accent: 'amber' },
    { label: 'Active Projects', value: k.totalProjects, icon: 'folder', accent: 'blue' },
  ];

  const marginStatus = getMarginStatus(k.profitMargin, data.settings);
  const isEmpty = data.isEmpty;

  $('#page-content').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-greeting">${greeting}, ${state.user.name}</div>
        <div class="page-greeting-sub">Here's what's happening across LUMIQ today.</div>
      </div>
    </div>

    ${isEmpty ? `
      <div class="dashboard-empty">
        ${emptyState(
          'No financial data yet',
          'Add your first client, project, payment, or expense to start seeing your LUMIQ analytics.',
          'Add Your First Client',
          () => { window.location.hash = '#/clients'; }
        )}
        <div class="empty-quick-actions">
          <div class="empty-quick-card" onclick="window.location.hash='#/clients'">
            <div class="empty-quick-icon">👥</div>
            <div class="empty-quick-label">Add Client</div>
          </div>
          <div class="empty-quick-card" onclick="window.location.hash='#/projects'">
            <div class="empty-quick-icon">📁</div>
            <div class="empty-quick-label">Create Project</div>
          </div>
          <div class="empty-quick-card" onclick="window.location.hash='#/expenses'">
            <div class="empty-quick-icon">🧾</div>
            <div class="empty-quick-label">Record Expense</div>
          </div>
          <div class="empty-quick-card" onclick="window.location.hash='#/pricing'">
            <div class="empty-quick-icon">🧮</div>
            <div class="empty-quick-label">Calculate Price</div>
          </div>
        </div>
      </div>
    ` : `
      <div class="kpi-grid">
        ${kpiCards.map(card => `
          <div class="kpi-card kpi-${card.accent}">
            <div class="kpi-top">
              <div class="kpi-icon kpi-icon-${card.accent}">${kpiIcon(card.icon)}</div>
              <div class="kpi-sparkline" id="spark-${card.label.replace(/\s/g,'')}"></div>
            </div>
            <div class="kpi-label">${card.label}</div>
            <div class="kpi-value">${card.value}</div>
          </div>
        `).join('')}
      </div>

      <div class="dashboard-grid">
        <div class="card chart-card">
          <div class="card-header">
            <h3>Financial Overview</h3>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background:var(--green)"></span>Revenue</span>
              <span class="legend-item"><span class="legend-dot" style="background:var(--red)"></span>Expenses</span>
              <span class="legend-item"><span class="legend-dot" style="background:var(--blue)"></span>Profit</span>
            </div>
          </div>
          <div class="chart-container">
            ${data.monthlyData.every(m => m.revenue === 0 && m.expenses === 0) ? emptyChart('financial', 'No financial data for this period yet') : '<canvas id="financialChart"></canvas>'}
          </div>
        </div>
        <div class="card chart-card">
          <div class="card-header"><h3>Profitability Status</h3></div>
          <div class="gauge-container">
            <div class="gauge">
              <div class="gauge-track">
                <div class="gauge-fill" style="width:${Math.min(k.profitMargin, 100)}%;background:${marginStatus.color}"></div>
              </div>
              <div class="gauge-value" style="color:${marginStatus.color}">${pct(k.profitMargin)}</div>
              <div class="gauge-label" style="color:${marginStatus.color}">${marginStatus.label}</div>
            </div>
            <div class="gauge-detail">
              <div class="gauge-stat"><span>Revenue</span><strong>${fmtAED(k.totalRevenue)}</strong></div>
              <div class="gauge-stat"><span>Expenses</span><strong>${fmtAED(k.expenses)}</strong></div>
              <div class="gauge-stat"><span>Net Profit</span><strong style="color:${marginStatus.color}">${fmtAED(k.netProfit)}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid-2">
        <div class="card chart-card">
          <div class="card-header"><h3>Expense Breakdown</h3></div>
          <div class="chart-container small">
            ${Object.keys(data.expenseByCategory).length === 0 ? emptyChart('expense', 'No expenses recorded yet') : '<canvas id="expenseChart"></canvas>'}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>Recent Activity</h3></div>
          <div class="activity-list">
            ${data.recentActivity.length === 0 ? '<div class="empty-inline">No recent activity</div>' : data.recentActivity.map(a => `
              <div class="activity-item">
                <div class="activity-icon ${a.type}">${a.type === 'payment' ? '⬇' : '⬆'}</div>
                <div class="activity-info">
                  <div class="activity-title">${a.type === 'payment' ? `Payment received from ${a.client_name || 'client'}` : a.reference || 'Expense recorded'}</div>
                  <div class="activity-sub">${a.project_name || 'General'} · ${fmtDateShort(a.date)}</div>
                </div>
                <div class="activity-amount ${a.type}">${a.type === 'payment' ? '+' : '-'}${fmtAED(a.amount)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>Active Projects</h3><a href="#/projects" class="card-link">View All</a></div>
        ${data.activeProjects.length === 0 ? emptyState('No active projects', 'Create a project to start tracking its financials.') : `
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Value</th><th>Collected</th><th>Remaining</th><th>Profit Margin</th></tr></thead>
              <tbody>
                ${data.activeProjects.map(p => {
                  const ms = getMarginStatus(p.profit_margin, data.settings);
                  return `<tr>
                    <td><a href="#/projects/${p.id}" class="table-link">${p.name}</a></td>
                    <td>${p.client_name || '—'}</td>
                    <td><span class="status-badge" style="background:${statusColor(p.status)}22;color:${statusColor(p.status)}">${statusLabel(p.status)}</span></td>
                    <td><strong>${fmtAED(p.project_value)}</strong></td>
                    <td class="text-green">${fmtAED(p.collected)}</td>
                    <td class="text-amber">${fmtAED(p.remaining)}</td>
                    <td><span class="profit-badge" style="background:${ms.color}22;color:${ms.color}">${pct(p.profit_margin)} · ${ms.label}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `}
  `;

  // Render charts if data exists
  if (!isEmpty) {
    if (data.monthlyData.some(m => m.revenue > 0 || m.expenses > 0)) renderFinancialChart(data.monthlyData);
    if (Object.keys(data.expenseByCategory).length > 0) renderExpenseChart(data.expenseByCategory);
    renderSparklines(data.monthlyData);
  }
}

function renderWorkerDashboard(data) {
  const k = data.kpis;
  $('#page-content').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-greeting">Welcome, ${state.user.name}</div>
        <div class="page-greeting-sub">Your assigned projects and account entries</div>
      </div>
    </div>
    <div class="kpi-grid">
      <div class="kpi-card kpi-green"><div class="kpi-top"><div class="kpi-icon kpi-icon-green">${kpiIcon('wallet')}</div></div><div class="kpi-label">Total Earnings</div><div class="kpi-value">${fmtAED(k.earnings)}</div></div>
      <div class="kpi-card kpi-amber"><div class="kpi-top"><div class="kpi-icon kpi-icon-amber">${kpiIcon('clock')}</div></div><div class="kpi-label">Pending Payments</div><div class="kpi-value">${fmtAED(k.pendingPayments)}</div></div>
      <div class="kpi-card kpi-blue"><div class="kpi-top"><div class="kpi-icon kpi-icon-blue">${kpiIcon('folder')}</div></div><div class="kpi-label">Assigned Projects</div><div class="kpi-value">${k.assignedProjects}</div></div>
      <div class="kpi-card kpi-green"><div class="kpi-top"><div class="kpi-icon kpi-icon-green">${kpiIcon('check')}</div></div><div class="kpi-label">Completed Tasks</div><div class="kpi-value">${k.completedTasks}</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>My Projects</h3></div>
      ${data.workerProjects.length === 0 ? emptyState('No projects assigned', 'You have no projects assigned yet. Ask the Owner to assign you to a project.') : `
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Value</th><th>Rate</th></tr></thead>
          <tbody>${data.workerProjects.map(p => `<tr><td><a href="#/projects/${p.id}" class="table-link">${p.name}</a></td><td>${p.client_name || '—'}</td><td><span class="status-badge" style="background:${statusColor(p.status)}22;color:${statusColor(p.status)}">${statusLabel(p.status)}</span></td><td>${fmtAED(p.project_value)}</td><td>${fmtAED(p.assigned_rate || 0)}</td></tr>`).join('')}</tbody>
        </table></div>
      `}
    </div>
    <div class="card">
      <div class="card-header"><h3>My Account Entries</h3></div>
      ${data.workerEntries.length === 0 ? emptyState('No entries yet', 'Submit your first account entry to track your earnings.') : `
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>${data.workerEntries.map(e => `<tr><td>${fmtDate(e.entry_date)}</td><td>${e.category}</td><td>${e.description || '—'}</td><td>${fmtAED(e.amount)}</td><td><span class="status-badge" style="background:${statusColor(e.status)}22;color:${statusColor(e.status)}">${statusLabel(e.status)}</span></td></tr>`).join('')}</tbody>
        </table></div>
      `}
    </div>
  `;
}

function kpiIcon(name) {
  const icons = {
    wallet: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    alert: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trending: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    receipt: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 21V3h14v18l-3-2-2 2-2-2-2 2-3-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    folder: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  return icons[name] || icons.wallet;
}

// ==================== CHARTS ====================

function renderFinancialChart(monthlyData) {
  const ctx = document.getElementById('financialChart');
  if (!ctx) return;
  if (state.charts.financial) state.charts.financial.destroy();
  state.charts.financial = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthlyData.map(m => m.month),
      datasets: [
        { label: 'Revenue', data: monthlyData.map(m => m.revenue), backgroundColor: 'rgba(163, 230, 53, 0.7)', borderColor: 'rgba(163, 230, 53, 1)', borderWidth: 1, borderRadius: 6 },
        { label: 'Expenses', data: monthlyData.map(m => m.expenses), backgroundColor: 'rgba(239, 68, 68, 0.7)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 1, borderRadius: 6 },
        { label: 'Profit', data: monthlyData.map(m => m.profit), type: 'line', borderColor: 'rgba(59, 130, 246, 1)', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: 'rgba(59, 130, 246, 1)' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', callback: v => fmtAED(v) } }
      }
    }
  });
}

function renderExpenseChart(byCategory) {
  const ctx = document.getElementById('expenseChart');
  if (!ctx) return;
  if (state.charts.expense) state.charts.expense.destroy();
  const colors = ['#a3e635', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];
  state.charts.expense = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(byCategory),
      datasets: [{ data: Object.values(byCategory), backgroundColor: colors, borderColor: 'var(--bg-card)', borderWidth: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', padding: 12, font: { size: 11 } } } }
    }
  });
}

function renderSparklines(monthlyData) {
  const revenues = monthlyData.map(m => m.revenue);
  const expenses = monthlyData.map(m => m.expenses);
  const profits = monthlyData.map(m => m.profit);
  const sparkData = { 'TotalRevenue': revenues, 'Outstanding': monthlyData.map(m => m.revenue - m.expenses), 'NetProfit': profits, 'Expenses': expenses };
  Object.entries(sparkData).forEach(([key, values]) => {
    const el = document.getElementById(`spark-${key}`);
    if (!el || values.every(v => v === 0)) return;
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 32;
    el.appendChild(canvas);
    const colors = { 'TotalRevenue': '#a3e635', 'Outstanding': '#f59e0b', 'NetProfit': '#a3e635', 'Expenses': '#ef4444' };
    new Chart(canvas, {
      type: 'line',
      data: { labels: values.map((_, i) => i), datasets: [{ data: values, borderColor: colors[key] || '#a3e635', borderWidth: 1.5, fill: false, tension: 0.4, pointRadius: 0 }] },
      options: { responsive: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
  });
}

// ==================== CLIENTS ====================

async function renderClients() {
  const clients = await api.clients();
  const expenseCats = state.settings?.expense_categories || ['Worker Payments','Software','Advertising','Transportation','Equipment','Office','Client Expenses','Hosting','Domains','Other'];

  $('#page-content').innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Clients</h2>
        <p class="page-subtitle">${clients.length} ${clients.length === 1 ? 'client' : 'clients'} in your portfolio</p>
      </div>
      ${state.user.role !== 'worker' ? `<button class="btn-primary" id="add-client-btn">+ Add Client</button>` : ''}
    </div>
    ${clients.length === 0 ? emptyState('No clients yet', 'Add your first client to start creating projects and tracking revenue.', state.user.role !== 'worker' ? 'Add Your First Client' : null, state.user.role !== 'worker' ? () => showClientModal(expenseCats) : null) : `
      <div class="client-grid">
        ${clients.map(c => `
          <div class="client-card" onclick="window.location.hash='#/clients/${c.id}'">
            <div class="client-card-header">
              <div class="client-avatar">${avatar(c.name)}</div>
              <div>
                <div class="client-name">${c.name}</div>
                <div class="client-company">${c.company || 'Individual'}</div>
              </div>
            </div>
            <div class="client-stats">
              <div class="client-stat"><div class="client-stat-label">Projects</div><div class="client-stat-value">${c.totalProjects}</div></div>
              <div class="client-stat"><div class="client-stat-label">Total Value</div><div class="client-stat-value">${fmtAED(c.totalProjectValue)}</div></div>
              <div class="client-stat"><div class="client-stat-label">Outstanding</div><div class="client-stat-value text-amber">${fmtAED(c.outstanding)}</div></div>
            </div>
            <div class="client-progress">
              <div class="client-progress-label">Collected: ${fmtAED(c.totalPaid)} / ${fmtAED(c.totalProjectValue)}</div>
              <div class="client-progress-bar"><div class="client-progress-fill" style="width:${c.totalProjectValue > 0 ? (c.totalPaid / c.totalProjectValue) * 100 : 0}%"></div></div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  $('#add-client-btn')?.addEventListener('click', () => showClientModal(expenseCats));
}

function showClientModal(expenseCats) {
  // Simple modal implementation
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Add New Client</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label>Client Name *</label><input id="cl-name" placeholder="e.g., Emirates Group" /></div>
        <div class="form-group"><label>Company</label><input id="cl-company" placeholder="Company name" /></div>
        <div class="form-group"><label>Contact Person</label><input id="cl-contact" placeholder="Contact person" /></div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input id="cl-phone" placeholder="+971 50 123 4567" /></div>
          <div class="form-group"><label>Email</label><input id="cl-email" placeholder="contact@company.com" /></div>
        </div>
        <div class="form-group"><label>Location</label><input id="cl-location" placeholder="Dubai, UAE" /></div>
        <div class="form-group"><label>Notes</label><textarea id="cl-notes" placeholder="Additional notes about this client"></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary modal-close-btn">Cancel</button>
        <button class="btn-primary" id="save-client">Save Client</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  modal.querySelector('#save-client').addEventListener('click', async () => {
    const name = modal.querySelector('#cl-name').value;
    if (!name) return;
    await api.createClient({
      name, company: modal.querySelector('#cl-company').value, contact_person: modal.querySelector('#cl-contact').value,
      phone: modal.querySelector('#cl-phone').value, email: modal.querySelector('#cl-email').value,
      location: modal.querySelector('#cl-location').value, notes: modal.querySelector('#cl-notes').value,
    });
    close();
    await renderClients();
  });
}

// ==================== PROJECTS ====================

async function renderProjects() {
  const projects = await api.projects();
  const clients = await api.clients();

  $('#page-content').innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Projects</h2>
        <p class="page-subtitle">${projects.length} ${projects.length === 1 ? 'project' : 'projects'} in your pipeline</p>
      </div>
      ${state.user.role !== 'worker' ? `<button class="btn-primary" id="add-project-btn">+ Create Project</button>` : ''}
    </div>
    ${projects.length === 0 ? emptyState('No projects yet', 'Create your first project to start tracking payments, expenses, and profitability.', state.user.role !== 'worker' ? 'Create Your First Project' : null, state.user.role !== 'worker' ? () => showProjectModal(clients) : null) : `
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Value</th><th>Collected</th><th>Remaining</th><th>Progress</th><th>Profit</th></tr></thead>
            <tbody>
              ${projects.map(p => {
                const ms = getMarginStatus(p.profit_margin, state.settings);
                return `<tr>
                  <td><a href="#/projects/${p.id}" class="table-link">${p.name}</a><div class="table-sub">${p.project_type || ''}</div></td>
                  <td>${p.client_name || '—'}</td>
                  <td><span class="status-badge" style="background:${statusColor(p.status)}22;color:${statusColor(p.status)}">${statusLabel(p.status)}</span></td>
                  <td><strong>${fmtAED(p.project_value)}</strong></td>
                  <td class="text-green">${fmtAED(p.collected)}</td>
                  <td class="text-amber">${fmtAED(p.remaining)}</td>
                  <td><div class="progress-bar"><div class="progress-fill" style="width:${p.progress || 0}%"></div></div><span class="progress-label">${p.progress || 0}%</span></td>
                  <td><span class="profit-badge" style="background:${ms.color}22;color:${ms.color}">${pct(p.profit_margin)}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}
  `;

  $('#add-project-btn')?.addEventListener('click', () => showProjectModal(clients));
}

function showProjectModal(clients) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  const projectTypes = state.settings?.project_types || ['Website','E-commerce Website','Landing Page','Branding','Logo Design','Social Media Management','Social Media Design','Video Editing','Motion Graphics','Photography','Digital Marketing','SEO','UI/UX Design','Mobile App','Custom Project'];
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Create New Project</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label>Client *</label><select id="pr-client">${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Project Name *</label><input id="pr-name" placeholder="e.g., Corporate Website Redesign" /></div>
        <div class="form-row">
          <div class="form-group"><label>Project Type</label><select id="pr-type">${projectTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
          <div class="form-group"><label>Status</label><select id="pr-status"><option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On Hold</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Start Date</label><input type="date" id="pr-start" /></div>
          <div class="form-group"><label>Deadline</label><input type="date" id="pr-deadline" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Project Value (AED) *</label><input type="number" id="pr-value" placeholder="25000" /></div>
          <div class="form-group"><label>Estimated Cost (AED)</label><input type="number" id="pr-cost" placeholder="8000" /></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="pr-desc" placeholder="Project scope and details"></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary modal-close-btn">Cancel</button>
        <button class="btn-primary" id="save-project">Create Project</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelector('#save-project').addEventListener('click', async () => {
    const name = modal.querySelector('#pr-name').value;
    const value = modal.querySelector('#pr-value').value;
    if (!name || !value) return;
    await api.createProject({
      client_id: parseInt(modal.querySelector('#pr-client').value), name, project_type: modal.querySelector('#pr-type').value,
      start_date: modal.querySelector('#pr-start').value, deadline: modal.querySelector('#pr-deadline').value,
      status: modal.querySelector('#pr-status').value, project_value: parseFloat(value), estimated_cost: parseFloat(modal.querySelector('#pr-cost').value) || 0,
      advance_received: 0, description: modal.querySelector('#pr-desc').value,
    });
    close();
    await renderProjects();
  });
}

// ==================== FINANCE ====================

async function renderFinance() {
  const dash = await api.dashboard();
  const expenses = await api.expenses();

  $('#page-content').innerHTML = `
    <div class="page-header"><div><h2 class="page-title">Financial Overview</h2><p class="page-subtitle">Revenue, expenses, and profitability analysis</p></div></div>
    ${dash.isEmpty ? emptyState('No financial data yet', 'Add clients, projects, payments, or expenses to start seeing your financial analytics.') : `
      <div class="kpi-grid">
        <div class="kpi-card kpi-green"><div class="kpi-label">Total Revenue</div><div class="kpi-value">${fmtAED(dash.kpis.totalRevenue)}</div></div>
        <div class="kpi-card kpi-red"><div class="kpi-label">Total Expenses</div><div class="kpi-value">${fmtAED(dash.kpis.expenses)}</div></div>
        <div class="kpi-card kpi-blue"><div class="kpi-label">Net Profit</div><div class="kpi-value">${fmtAED(dash.kpis.netProfit)}</div></div>
        <div class="kpi-card kpi-amber"><div class="kpi-label">Outstanding</div><div class="kpi-value">${fmtAED(dash.kpis.outstanding)}</div></div>
      </div>
      <div class="dashboard-grid">
        <div class="card chart-card">
          <div class="card-header"><h3>Revenue vs Expenses</h3></div>
          <div class="chart-container">${dash.monthlyData.every(m => m.revenue === 0 && m.expenses === 0) ? emptyChart('fin', 'No data yet') : '<canvas id="finChart"></canvas>'}</div>
        </div>
        <div class="card chart-card">
          <div class="card-header"><h3>Expense Categories</h3></div>
          <div class="chart-container small">${Object.keys(dash.expenseByCategory).length === 0 ? emptyChart('exp', 'No expenses yet') : '<canvas id="finExpChart"></canvas>'}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Business Analysis</h3></div>
        <div class="analysis-grid">
          <div class="analysis-item"><div class="analysis-label">Revenue Growth</div><div class="analysis-value">${dash.monthlyData.length > 1 && dash.monthlyData[0].revenue > 0 ? pct(((dash.monthlyData[dash.monthlyData.length-1].revenue - dash.monthlyData[0].revenue) / dash.monthlyData[0].revenue) * 100) : '—'}</div></div>
          <div class="analysis-item"><div class="analysis-label">Cost Ratio</div><div class="analysis-value">${dash.kpis.totalRevenue > 0 ? pct((dash.kpis.expenses / dash.kpis.totalRevenue) * 100) : '—'}</div></div>
          <div class="analysis-item"><div class="analysis-label">Profit Margin</div><div class="analysis-value" style="color:${getMarginStatus(dash.kpis.profitMargin, dash.settings).color}">${pct(dash.kpis.profitMargin)}</div></div>
          <div class="analysis-item"><div class="analysis-label">Collection Rate</div><div class="analysis-value">${dash.kpis.projectValue > 0 ? pct((dash.kpis.amountCollected / dash.kpis.projectValue) * 100) : '—'}</div></div>
        </div>
      </div>
    `}
  `;

  if (!dash.isEmpty) {
    if (dash.monthlyData.some(m => m.revenue > 0 || m.expenses > 0)) renderFinancialChart(dash.monthlyData);
    if (Object.keys(dash.expenseByCategory).length > 0) renderExpenseChart(dash.expenseByCategory);
  }
}

// ==================== TRANSACTIONS ====================

async function renderTransactions() {
  const data = await api.transactions();

  $('#page-content').innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Transactions</h2><p class="page-subtitle">${data.transactions.length} transactions · Net: ${fmtAED(data.summary.net)}</p></div>
      ${state.user.role !== 'worker' ? `<button class="btn-primary" id="add-tx-btn">+ Add Transaction</button>` : ''}
    </div>
    ${data.transactions.length === 0 ? emptyState('No transactions yet', 'Record your first income or expense transaction to build your financial ledger.', state.user.role !== 'worker' ? 'Add First Transaction' : null, state.user.role !== 'worker' ? () => showTransactionModal() : null) : `
      <div class="card"><div class="table-wrap"><table class="data-table">
        <thead><tr><th>Date</th><th>Description</th><th>Client/Project</th><th>Category</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>${data.transactions.map(t => `<tr>
          <td>${fmtDate(t.date)}</td><td>${t.description}</td><td>${t.client_name || t.project_name || '—'}</td><td>${t.category || '—'}</td>
          <td><span class="status-badge" style="background:${t.type === 'income' ? 'var(--green)' : 'var(--red)'}22;color:${t.type === 'income' ? 'var(--green)' : 'var(--red)'}">${t.type === 'income' ? 'Income' : 'Expense'}</span></td>
          <td class="${t.type === 'income' ? 'text-green' : 'text-red'}">${t.type === 'income' ? '+' : '-'}${fmtAED(t.amount)}</td>
          <td><span class="status-badge" style="background:${statusColor(t.status)}22;color:${statusColor(t.status)}">${statusLabel(t.status)}</span></td>
        </tr>`).join('')}</tbody>
      </table></div></div>
    `}
  `;

  $('#add-tx-btn')?.addEventListener('click', () => showTransactionModal());
}

function showTransactionModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Add Transaction</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label>Date *</label><input type="date" id="tx-date" value="${new Date().toISOString().slice(0,10)}" /></div>
          <div class="form-group"><label>Type *</label><select id="tx-type"><option value="income">Income</option><option value="expense">Expense</option></select></div>
        </div>
        <div class="form-group"><label>Description *</label><input id="tx-desc" placeholder="Transaction description" /></div>
        <div class="form-row">
          <div class="form-group"><label>Category</label><input id="tx-cat" placeholder="e.g., Software, Advertising" /></div>
          <div class="form-group"><label>Amount (AED) *</label><input type="number" id="tx-amount" placeholder="5000" /></div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary modal-close-btn">Cancel</button><button class="btn-primary" id="save-tx">Save Transaction</button></div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelector('#save-tx').addEventListener('click', async () => {
    const desc = modal.querySelector('#tx-desc').value;
    const amount = modal.querySelector('#tx-amount').value;
    if (!desc || !amount) return;
    await api.createTransaction({
      date: modal.querySelector('#tx-date').value, description: desc, type: modal.querySelector('#tx-type').value,
      category: modal.querySelector('#tx-cat').value, amount: parseFloat(amount),
    });
    close();
    await renderTransactions();
  });
}

// ==================== EXPENSES ====================

async function renderExpenses() {
  const data = await api.expenses();

  $('#page-content').innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Expense Tracker</h2><p class="page-subtitle">${data.expenses.length} expenses · Total: ${fmtAED(data.summary.totalExpenses)}</p></div>
      ${state.user.role !== 'worker' ? `<button class="btn-primary" id="add-exp-btn">+ Add Expense</button>` : ''}
    </div>
    ${data.expenses.length === 0 ? emptyState('No expenses recorded', 'Track your first expense to monitor your spending patterns and profitability.', state.user.role !== 'worker' ? 'Add First Expense' : null, state.user.role !== 'worker' ? () => showExpenseModal() : null) : `
      <div class="dashboard-grid-2">
        <div class="card chart-card">
          <div class="card-header"><h3>Expense Categories</h3></div>
          <div class="chart-container small">${Object.keys(data.summary.byCategory).length === 0 ? emptyChart('exp-cat', 'No data') : '<canvas id="expCatChart"></canvas>'}</div>
        </div>
        <div class="card chart-card">
          <div class="card-header"><h3>By Project</h3></div>
          <div class="chart-container small">${Object.keys(data.summary.byProject).length === 0 ? emptyChart('exp-proj', 'No data') : '<canvas id="expProjChart"></canvas>'}</div>
        </div>
      </div>
      <div class="card"><div class="table-wrap"><table class="data-table">
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Project</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>${data.expenses.map(e => `<tr>
          <td>${fmtDate(e.expense_date)}</td><td>${e.category}</td><td>${e.description || '—'}</td><td>${e.project_name || 'General'}</td>
          <td class="text-red">${fmtAED(e.amount)}</td><td><span class="status-badge" style="background:${statusColor(e.status)}22;color:${statusColor(e.status)}">${statusLabel(e.status)}</span></td>
        </tr>`).join('')}</tbody>
      </table></div></div>
    `}
  `;

  if (data.expenses.length > 0) {
    if (Object.keys(data.summary.byCategory).length > 0) renderExpenseChart(data.summary.byCategory);
  }
}

function showExpenseModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  const cats = state.settings?.expense_categories || ['Worker Payments','Software','Advertising','Transportation','Equipment','Office','Client Expenses','Hosting','Domains','Other'];
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Add Expense</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label>Category *</label><select id="ex-cat">${cats.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
        <div class="form-group"><label>Description *</label><input id="ex-desc" placeholder="Expense description" /></div>
        <div class="form-row">
          <div class="form-group"><label>Amount (AED) *</label><input type="number" id="ex-amount" placeholder="500" /></div>
          <div class="form-group"><label>Date *</label><input type="date" id="ex-date" value="${new Date().toISOString().slice(0,10)}" /></div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary modal-close-btn">Cancel</button><button class="btn-primary" id="save-exp">Save Expense</button></div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelector('#save-exp').addEventListener('click', async () => {
    const desc = modal.querySelector('#ex-desc').value;
    const amount = modal.querySelector('#ex-amount').value;
    if (!desc || !amount) return;
    await api.createExpense({
      category: modal.querySelector('#ex-cat').value, description: desc, amount: parseFloat(amount),
      expense_date: modal.querySelector('#ex-date').value, project_id: null,
    });
    close();
    await renderExpenses();
  });
}

// ==================== TEAM ====================

async function renderTeam() {
  const team = await api.team();

  $('#page-content').innerHTML = `
    <div class="page-header">
      <div><h2 class="page-title">Team</h2><p class="page-subtitle">${team.length} ${team.length === 1 ? 'member' : 'members'} in your team</p></div>
    </div>
    ${team.length === 0 ? emptyState('No team members yet', 'Add team members to assign them to projects and track their work.') : `
      <div class="team-grid">
        ${team.map(m => `
          <div class="team-card" onclick="window.location.hash='#/team/${m.id}'">
            <div class="team-card-header">
              <div class="avatar large">${avatar(m.name)}</div>
              <div>
                <div class="team-name">${m.name}</div>
                <div class="team-role">${statusLabel(m.role)}</div>
                <div class="team-status ${m.active ? 'active' : 'inactive'}">${m.active ? 'Active' : 'Inactive'}</div>
              </div>
            </div>
            <div class="team-stats">
              <div class="team-stat"><div class="team-stat-label">Projects</div><div class="team-stat-value">${m.assignedProjects.length}</div></div>
              <div class="team-stat"><div class="team-stat-label">Earnings</div><div class="team-stat-value">${fmtAED(m.earnings)}</div></div>
              <div class="team-stat"><div class="team-stat-label">Pending</div><div class="team-stat-value">${fmtAED(m.pendingPayments)}</div></div>
            </div>
            <div class="team-footer"><span>Last login: ${m.last_login ? fmtDateShort(m.last_login) : 'Never'}</span></div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

// ==================== APPROVALS ====================

async function renderApprovals() {
  const data = await api.approvals();

  // Update nav badge
  const badge = $('#nav-approvals-badge');
  if (badge) {
    if (data.pendingCount > 0) { badge.style.display = 'flex'; badge.textContent = data.pendingCount; }
    else badge.style.display = 'none';
  }

  $('#page-content').innerHTML = `
    <div class="page-header"><div><h2 class="page-title">Approval Center</h2><p class="page-subtitle">${data.pendingCount} pending ${data.pendingCount === 1 ? 'request' : 'requests'} awaiting your review</p></div></div>
    ${data.approvals.length === 0 ? emptyState('No approval requests', 'When workers submit expenses, account entries, or payment requests, they will appear here for your approval.') : `
      <div class="approval-grid">
        ${data.approvals.map(a => `
          <div class="approval-card ${a.status}">
            <div class="approval-header">
              <div class="approval-type">${statusLabel(a.request_type.replace(/_/g, ' '))}</div>
              <span class="status-badge" style="background:${statusColor(a.status)}22;color:${statusColor(a.status)}">${statusLabel(a.status)}</span>
            </div>
            <div class="approval-body">
              ${a.worker_name ? `<div class="approval-row"><span>Worker</span><strong>${a.worker_name}</strong></div>` : ''}
              ${a.project_name ? `<div class="approval-row"><span>Project</span><strong>${a.project_name}</strong></div>` : ''}
              ${a.amount ? `<div class="approval-row"><span>Amount</span><strong class="text-amber">${fmtAED(a.amount)}</strong></div>` : ''}
              ${a.category ? `<div class="approval-row"><span>Category</span><strong>${a.category}</strong></div>` : ''}
              ${a.description ? `<div class="approval-row"><span>Description</span><strong>${a.description}</strong></div>` : ''}
              <div class="approval-row"><span>Submitted</span><strong>${fmtDate(a.created_at)}</strong></div>
              ${a.approval_notes ? `<div class="approval-row"><span>Notes</span><strong>${a.approval_notes}</strong></div>` : ''}
            </div>
            ${a.status === 'pending' ? `
              <div class="approval-actions">
                <button class="btn-approve" data-id="${a.id}">Approve</button>
                <button class="btn-reject" data-id="${a.id}">Reject</button>
                <button class="btn-changes" data-id="${a.id}">Request Changes</button>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `}
  `;

  $$('.btn-approve').forEach(btn => btn.addEventListener('click', async () => { await api.approveRequest(btn.dataset.id, ''); await renderApprovals(); }));
  $$('.btn-reject').forEach(btn => btn.addEventListener('click', async () => { await api.rejectRequest(btn.dataset.id, ''); await renderApprovals(); }));
  $$('.btn-changes').forEach(btn => btn.addEventListener('click', async () => { await api.requestChanges(btn.dataset.id, ''); await renderApprovals(); }));
}

// ==================== CHAT ====================

let chatState = { currentRoom: null, messages: [], rooms: [], pollInterval: null };

async function renderChat() {
  chatState.rooms = await api.chatRooms();
  const members = await api.chatMembers();

  const defaultRoom = chatState.rooms[0]?.id || null;
  chatState.currentRoom = defaultRoom;

  $('#page-content').innerHTML = `
    <div class="chat-container">
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <h3>Conversations</h3>
          <button class="chat-new-btn" id="new-chat-btn" title="New Group Chat">+</button>
        </div>
        <div class="chat-rooms-list" id="chat-rooms-list">
          ${chatState.rooms.length === 0 ? '<div class="chat-empty">No conversations yet</div>' : chatState.rooms.map(r => `
            <div class="chat-room-item ${r.id === chatState.currentRoom ? 'active' : ''}" data-room="${r.id}">
              <div class="chat-room-avatar">${r.type === 'dm' ? avatar(r.name) : '👥'}</div>
              <div class="chat-room-info">
                <div class="chat-room-name">${r.name}</div>
                <div class="chat-room-type">${r.type === 'dm' ? 'Direct Message' : r.type === 'project' ? 'Project Chat' : 'Group Chat'}</div>
              </div>
              ${r.unread_count > 0 ? `<span class="chat-room-badge">${r.unread_count}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="chat-main" id="chat-main">
        ${chatState.currentRoom ? `
          <div class="chat-header">
            <div class="chat-header-info">
              <h3 id="chat-room-name">${chatState.rooms[0]?.name || 'Chat'}</h3>
              <span class="chat-header-type">${chatState.rooms[0]?.type === 'dm' ? 'Direct Message' : chatState.rooms[0]?.type === 'project' ? 'Project Chat' : 'Group Chat'}</span>
            </div>
          </div>
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-input-area">
            <button class="chat-perm-btn" id="chat-perm-btn" title="Request Permission">🔒</button>
            <input type="text" id="chat-input" placeholder="Type a message..." />
            <button class="chat-send-btn" id="chat-send-btn">Send</button>
          </div>
        ` : emptyState('No conversations', 'Create a group chat or start a direct message to begin communicating with your team.', 'Start New Chat', () => showNewChatModal(members))}
      </div>
    </div>
  `;

  // Room selection
  $$('.chat-room-item').forEach(item => {
    item.addEventListener('click', async () => {
      chatState.currentRoom = parseInt(item.dataset.room);
      $$('.chat-room-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const room = chatState.rooms.find(r => r.id === chatState.currentRoom);
      $('#chat-room-name').textContent = room.name;
      $('.chat-header-type').textContent = room.type === 'dm' ? 'Direct Message' : room.type === 'project' ? 'Project Chat' : 'Group Chat';
      await loadChatMessages();
    });
  });

  // Send message
  const sendMessage = async () => {
    const input = $('#chat-input');
    const msg = input.value.trim();
    if (!msg || !chatState.currentRoom) return;
    input.value = '';
    await api.sendMessage(chatState.currentRoom, { message: msg, message_type: 'text' });
    await loadChatMessages();
  };

  $('#chat-send-btn')?.addEventListener('click', sendMessage);
  $('#chat-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

  // Permission request button
  $('#chat-perm-btn')?.addEventListener('click', () => showPermissionRequestModal(members));

  // New chat button
  $('#new-chat-btn')?.addEventListener('click', () => showNewChatModal(members));

  // Load messages
  if (chatState.currentRoom) await loadChatMessages();

  // Start polling
  startChatPolling();
}

async function loadChatMessages() {
  if (!chatState.currentRoom) return;
  chatState.messages = await api.chatMessages(chatState.currentRoom);
  renderChatMessages();
}

function renderChatMessages() {
  const container = $('#chat-messages');
  if (!container) return;
  if (chatState.messages.length === 0) {
    container.innerHTML = '<div class="chat-no-messages">No messages yet. Start the conversation!</div>';
    return;
  }
  container.innerHTML = chatState.messages.map(m => {
    const isOwn = m.sender_id === state.user.id;
    const isSystem = m.message_type === 'system';
    const isPermReq = m.message_type === 'permission_request';

    if (isSystem) {
      return `<div class="chat-msg-system">${m.message}</div>`;
    }

    return `
      <div class="chat-msg ${isOwn ? 'own' : ''} ${isPermReq ? 'perm-request' : ''}">
        <div class="chat-msg-avatar">${avatar(m.sender_name)}</div>
        <div class="chat-msg-body">
          <div class="chat-msg-header">
            <span class="chat-msg-sender">${isOwn ? 'You' : m.sender_name}</span>
            <span class="chat-msg-time">${fmtDateTime(m.created_at)}</span>
          </div>
          <div class="chat-msg-text">${m.message}</div>
          ${isPermReq && m.permission_request_id ? `<div class="chat-perm-result" id="perm-${m.permission_request_id}">Loading...</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;

  // Load permission request statuses
  chatState.messages.filter(m => m.permission_request_id).forEach(async m => {
    const el = $(`#perm-${m.permission_request_id}`);
    if (!el) return;
    const reqs = await api.permissionRequests();
    const req = reqs.find(r => r.id === m.permission_request_id);
    if (req) {
      const color = req.status === 'approved' ? 'var(--green)' : req.status === 'denied' ? 'var(--red)' : 'var(--amber)';
      el.innerHTML = `<span class="perm-status" style="color:${color}">Permission: ${req.permission} — ${statusLabel(req.status)}</span>`;
    }
  });
}

function startChatPolling() {
  if (chatState.pollInterval) clearInterval(chatState.pollInterval);
  chatState.pollInterval = setInterval(async () => {
    if (chatState.currentRoom && state.currentPage === 'chat') {
      await loadChatMessages();
    }
  }, 5000);
}

function showNewChatModal(members) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>New Group Chat</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label>Chat Name *</label><input id="chat-name" placeholder="e.g., Design Team" /></div>
        <div class="form-group"><label>Select Members</label>
          <div class="checkbox-list">
            ${members.filter(m => m.id !== state.user.id).map(m => `
              <label class="checkbox-item">
                <input type="checkbox" value="${m.id}" class="chat-member-check" />
                <span>${m.name} (${statusLabel(m.role)})</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary modal-close-btn">Cancel</button><button class="btn-primary" id="save-chat">Create Chat</button></div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelector('#save-chat').addEventListener('click', async () => {
    const name = modal.querySelector('#chat-name').value;
    if (!name) return;
    const memberIds = [...modal.querySelectorAll('.chat-member-check:checked')].map(c => parseInt(c.value));
    await api.createChatRoom({ name, type: 'group', member_ids: memberIds });
    close();
    await renderChat();
  });
}

function showPermissionRequestModal(members) {
  const permissions = [
    'View assigned projects', 'Edit assigned projects', 'Add project notes',
    'Submit expenses', 'Submit payment requests', 'Upload files',
    'View limited project information', 'Request financial access',
    'View client contact information', 'Send messages',
  ];
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Request Permission</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label>Permission *</label><select id="perm-select">${permissions.map(p => `<option value="${p}">${p}</option>`).join('')}</select></div>
        <div class="form-group"><label>Description</label><textarea id="perm-desc" placeholder="Explain why you need this access"></textarea></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary modal-close-btn">Cancel</button><button class="btn-primary" id="save-perm">Send Request</button></div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelector('#save-perm').addEventListener('click', async () => {
    const permission = modal.querySelector('#perm-select').value;
    const description = modal.querySelector('#perm-desc').value;
    // Send as permission request message in current chat
    await api.sendMessage(chatState.currentRoom, {
      message: `Permission Request: ${permission}${description ? ` — ${description}` : ''}`,
      message_type: 'permission_request',
      permission_request_data: { permission, description, project_id: null },
    });
    close();
    await loadChatMessages();
  });
}

// ==================== PRICING CALCULATOR ====================

async function renderPricing() {
  const rules = await api.pricingRules();

  $('#page-content').innerHTML = `
    <div class="page-header"><div><h2 class="page-title">Pricing Calculator</h2><p class="page-subtitle">Smart pricing with market analysis and profit margins</p></div></div>
    <div class="pricing-grid">
      <div class="card pricing-input-card">
        <div class="card-header"><h3>Project Parameters</h3></div>
        <div class="pricing-form">
          <div class="form-group"><label>Project Type *</label><select id="pc-type">${rules.map(r => `<option value="${r.project_type}">${r.project_type}</option>`).join('')}</select></div>
          <div class="form-group"><label>Complexity</label>
            <div class="complexity-slider">
              <div class="complexity-options">
                <button class="complexity-btn" data-val="simple">Simple</button>
                <button class="complexity-btn active" data-val="standard">Standard</button>
                <button class="complexity-btn" data-val="advanced">Advanced</button>
                <button class="complexity-btn" data-val="premium">Premium</button>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Pages</label><input type="number" id="pc-pages" value="0" min="0" /></div>
            <div class="form-group"><label>Screens</label><input type="number" id="pc-screens" value="0" min="0" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Social Posts</label><input type="number" id="pc-social" value="0" min="0" /></div>
            <div class="form-group"><label>Revisions</label><input type="number" id="pc-revisions" value="0" min="0" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Videos</label><input type="number" id="pc-videos" value="0" min="0" /></div>
            <div class="form-group"><label>Integrations</label><input type="number" id="pc-integrations" value="0" min="0" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Urgency</label><select id="pc-urgency"><option value="standard">Standard</option><option value="urgent">Urgent (+30%)</option><option value="rush">Rush (+95%)</option></select></div>
            <div class="form-group"><label>Client Type</label><select id="pc-client"><option value="individual">Individual</option><option value="startup">Startup (-15%)</option><option value="sme">SME</option><option value="enterprise">Enterprise (+40%)</option></select></div>
          </div>
          <button class="btn-primary pricing-calc-btn" id="calc-btn">Calculate Price</button>
        </div>
      </div>
      <div class="pricing-result-area" id="pricing-result">
        <div class="card pricing-placeholder">
          <div class="pricing-placeholder-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="12" y="12" width="40" height="40" rx="10" stroke="var(--gray4)" stroke-width="2" opacity="0.3"/><path d="M24 32 L40 32 M32 24 L32 40" stroke="var(--gray4)" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>
          </div>
          <h3>Configure your project parameters</h3>
          <p>Set your project details and click Calculate to see pricing recommendations, market analysis, and profitability insights.</p>
        </div>
      </div>
    </div>
  `;

  // Complexity buttons
  let complexity = 'standard';
  $$('.complexity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.complexity-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      complexity = btn.dataset.val;
    });
  });

  $('#calc-btn').addEventListener('click', async () => {
    const data = {
      project_type: $('#pc-type').value, complexity,
      pages: parseInt($('#pc-pages').value) || 0, screens: parseInt($('#pc-screens').value) || 0,
      social_posts: parseInt($('#pc-social').value) || 0, revisions: parseInt($('#pc-revisions').value) || 0,
      videos: parseInt($('#pc-videos').value) || 0, integrations: parseInt($('#pc-integrations').value) || 0,
      urgency: $('#pc-urgency').value, client_type: $('#pc-client').value, desired_margin: 40,
    };
    const result = await api.calculatePricing(data);
    renderPricingResult(result, data);
  });
}

function renderPricingResult(result, inputs) {
  const ms = getMarginStatus(result.profitMargin, state.settings);
  $('#pricing-result').innerHTML = `
    <div class="card pricing-result-card">
      <div class="card-header"><h3>Pricing Analysis</h3></div>
      <div class="pricing-result-body">
        <div class="price-main">
          <div class="price-label">Recommended Price</div>
          <div class="price-value">${fmtAED(result.recommendedPrice)}</div>
          <div class="price-sub">Estimated Cost: ${fmtAED(result.estimatedCost)} · Profit: ${fmtAED(result.estimatedProfit)}</div>
        </div>
        <div class="price-grid">
          <div class="price-card min"><div class="price-card-label">Minimum</div><div class="price-card-value">${fmtAED(result.minimumPrice)}</div></div>
          <div class="price-card recommended"><div class="price-card-label">Recommended</div><div class="price-card-value">${fmtAED(result.recommendedPrice)}</div></div>
          <div class="price-card premium"><div class="price-card-label">Premium</div><div class="price-card-value">${fmtAED(result.premiumPrice)}</div></div>
        </div>
        <div class="price-grid">
          <div class="price-card"><div class="price-card-label">Market Low</div><div class="price-card-value">${fmtAED(result.marketLow)}</div></div>
          <div class="price-card"><div class="price-card-label">Market High</div><div class="price-card-value">${fmtAED(result.marketHigh)}</div></div>
          <div class="price-card"><div class="price-card-label">Profit Margin</div><div class="price-card-value" style="color:${ms.color}">${pct(result.profitMargin)}</div></div>
        </div>
        <div class="price-actions">
          <button class="btn-primary" id="generate-proposal">Generate Proposal</button>
          <button class="btn-secondary" id="convert-project">Convert to Project</button>
        </div>
      </div>
    </div>
  `;

  $('#generate-proposal')?.addEventListener('click', () => showProposalModal(result, inputs));
  $('#convert-project')?.addEventListener('click', () => showConvertModal(result, inputs));
}

function showProposalModal(result, inputs) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  api.clients().then(clients => {
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header"><h3>Generate Proposal</h3><button class="modal-close">&times;</button></div>
        <div class="modal-body">
          <div class="form-group"><label>Client *</label><select id="prop-client">${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label>Project Name *</label><input id="prop-name" value="${inputs.project_type} Project" /></div>
          <div class="form-group"><label>Scope</label><textarea id="prop-scope">${inputs.project_type} with ${inputs.pages} pages, ${inputs.screens} screens</textarea></div>
          <div class="form-group"><label>Deliverables</label><textarea id="prop-deliverables">Source files, documentation, training</textarea></div>
          <div class="form-row">
            <div class="form-group"><label>Timeline</label><input id="prop-timeline" value="4-6 weeks" /></div>
            <div class="form-group"><label>Advance %</label><input type="number" id="prop-advance" value="50" /></div>
          </div>
          <div class="form-group"><label>Validity</label><input id="prop-validity" value="30 days" /></div>
        </div>
        <div class="modal-footer"><button class="btn-secondary modal-close-btn">Cancel</button><button class="btn-primary" id="save-prop">Generate</button></div>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.querySelector('.modal-close-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.querySelector('#save-prop').addEventListener('click', async () => {
      await api.generateProposal(result.id, {
        client_id: parseInt(modal.querySelector('#prop-client').value), project_name: modal.querySelector('#prop-name').value,
        scope: modal.querySelector('#prop-scope').value, deliverables: modal.querySelector('#prop-deliverables').value,
        timeline: modal.querySelector('#prop-timeline').value, advance_pct: parseInt(modal.querySelector('#prop-advance').value),
        payment_terms: '50% Advance, 50% Upon Completion', validity: modal.querySelector('#prop-validity').value,
      });
      close();
      showSuccess('Proposal generated successfully!');
    });
  });
}

function showConvertModal(result, inputs) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  api.clients().then(clients => {
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header"><h3>Convert to Project</h3><button class="modal-close">&times;</button></div>
        <div class="modal-body">
          <div class="form-group"><label>Client *</label><select id="conv-client">${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label>Project Name *</label><input id="conv-name" value="${inputs.project_type} Project" /></div>
          <div class="form-group"><label>Deadline</label><input type="date" id="conv-deadline" /></div>
          <div class="conv-info">
            <div class="conv-info-row"><span>Project Value</span><strong>${fmtAED(result.recommendedPrice)}</strong></div>
            <div class="conv-info-row"><span>Estimated Cost</span><strong>${fmtAED(result.estimatedCost)}</strong></div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn-secondary modal-close-btn">Cancel</button><button class="btn-primary" id="save-conv">Create Project</button></div>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.querySelector('.modal-close-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.querySelector('#save-conv').addEventListener('click', async () => {
      await api.convertToProject(result.id, {
        client_id: parseInt(modal.querySelector('#conv-client').value), project_name: modal.querySelector('#conv-name').value,
        deadline: modal.querySelector('#conv-deadline').value,
      });
      close();
      showSuccess('Project created successfully!');
      window.location.hash = '#/projects';
    });
  });
}

function showSuccess(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== REPORTS ====================

async function renderReports() {
  const reportTypes = [
    { id: 'revenue', name: 'Revenue Report', icon: 'wallet', desc: 'Revenue by client and source' },
    { id: 'expense', name: 'Expense Report', icon: 'receipt', desc: 'Expenses by category and project' },
    { id: 'profit_loss', name: 'Profit & Loss', icon: 'trending', desc: 'Complete P&L statement' },
    { id: 'project_profitability', name: 'Project Profitability', icon: 'folder', desc: 'Profit margins per project' },
    { id: 'outstanding', name: 'Outstanding Payments', icon: 'alert', desc: 'Unpaid invoices and balances' },
    { id: 'client_revenue', name: 'Client Revenue', icon: 'users', desc: 'Revenue by client' },
    { id: 'worker_expenses', name: 'Worker Expenses', icon: 'people', desc: 'Worker payments and entries' },
    { id: 'monthly_performance', name: 'Monthly Performance', icon: 'chart', desc: 'Month-by-month breakdown' },
    { id: 'cash_flow', name: 'Cash Flow', icon: 'exchange', desc: 'Inflows and outflows' },
  ];

  $('#page-content').innerHTML = `
    <div class="page-header"><div><h2 class="page-title">Reports</h2><p class="page-subtitle">Generate detailed financial reports and export data</p></div></div>
    <div class="report-grid">
      ${reportTypes.map(r => `
        <div class="report-card" data-report="${r.id}">
          <div class="report-icon">${kpiIcon(r.icon)}</div>
          <div class="report-info"><div class="report-name">${r.name}</div><div class="report-desc">${r.desc}</div></div>
        </div>
      `).join('')}
    </div>
    <div id="report-output"></div>
  `;

  $$('.report-card').forEach(card => {
    card.addEventListener('click', async () => {
      const type = card.dataset.report;
      const report = await api.report(type);
      renderReportOutput(type, report);
    });
  });
}

function renderReportOutput(type, report) {
  const output = $('#report-output');
  let html = `<div class="card report-output-card"><div class="card-header"><h3>${report.title}</h3><button class="btn-secondary" id="export-csv">Export CSV</button></div><div class="report-body">`;

  switch(type) {
    case 'revenue':
      html += `<div class="report-total">Total Revenue: <strong>${fmtAED(report.totalRevenue)}</strong></div>`;
      if (report.byClient.length === 0) html += '<div class="empty-inline">No revenue data yet</div>';
      else html += `<table class="data-table"><thead><tr><th>Client</th><th>Amount</th></tr></thead><tbody>${report.byClient.map(c => `<tr><td>${c.name}</td><td>${fmtAED(c.amount)}</td></tr>`).join('')}</tbody></table>`;
      break;
    case 'expense':
      html += `<div class="report-total">Total Expenses: <strong>${fmtAED(report.totalExpenses)}</strong></div>`;
      if (Object.keys(report.byCategory).length === 0) html += '<div class="empty-inline">No expense data yet</div>';
      else html += `<table class="data-table"><thead><tr><th>Category</th><th>Amount</th></tr></thead><tbody>${Object.entries(report.byCategory).map(([k,v]) => `<tr><td>${k}</td><td>${fmtAED(v)}</td></tr>`).join('')}</tbody></table>`;
      break;
    case 'profit_loss':
      html += `<div class="report-summary"><div class="report-summary-item"><span>Revenue</span><strong class="text-green">${fmtAED(report.revenue)}</strong></div><div class="report-summary-item"><span>Expenses</span><strong class="text-red">${fmtAED(report.expenses)}</strong></div><div class="report-summary-item"><span>Net Profit</span><strong>${fmtAED(report.netProfit)}</strong></div><div class="report-summary-item"><span>Margin</span><strong>${pct(report.margin)}</strong></div></div>`;
      break;
    case 'project_profitability':
      if (report.projects.length === 0) html += '<div class="empty-inline">No projects yet</div>';
      else html += `<table class="data-table"><thead><tr><th>Project</th><th>Client</th><th>Value</th><th>Cost</th><th>Profit</th><th>Margin</th><th>Status</th></tr></thead><tbody>${report.projects.map(p => `<tr><td>${p.name}</td><td>${p.client || '—'}</td><td>${fmtAED(p.value)}</td><td>${fmtAED(p.cost)}</td><td>${fmtAED(p.profit)}</td><td>${pct(p.margin)}</td><td><span class="status-badge" style="background:${statusColor(p.status)}22;color:${statusColor(p.status)}">${statusLabel(p.status)}</span></td></tr>`).join('')}</tbody></table>`;
      break;
    case 'outstanding':
      if (report.items.length === 0) html += '<div class="empty-inline">No outstanding payments</div>';
      else html += `<table class="data-table"><thead><tr><th>Project</th><th>Client</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>${report.items.map(p => `<tr><td>${p.project}</td><td>${p.client}</td><td>${fmtAED(p.total)}</td><td>${fmtAED(p.paid)}</td><td class="text-amber">${fmtAED(p.outstanding)}</td><td><span class="status-badge" style="background:${statusColor(p.status.toLowerCase().replace(/\s/g,'_'))}22;color:${statusColor(p.status.toLowerCase().replace(/\s/g,'_'))}">${p.status}</span></td></tr>`).join('')}</tbody></table>`;
      break;
    case 'client_revenue':
      if (report.clients.length === 0) html += '<div class="empty-inline">No client revenue data yet</div>';
      else html += `<table class="data-table"><thead><tr><th>Client</th><th>Projects</th><th>Total Value</th><th>Collected</th><th>Outstanding</th></tr></thead><tbody>${report.clients.map(c => `<tr><td>${c.name}</td><td>${c.projectCount}</td><td>${fmtAED(c.totalValue)}</td><td>${fmtAED(c.collected)}</td><td>${fmtAED(c.outstanding)}</td></tr>`).join('')}</tbody></table>`;
      break;
    case 'worker_expenses':
      if (report.workers.length === 0) html += '<div class="empty-inline">No workers yet</div>';
      else html += `<table class="data-table"><thead><tr><th>Worker</th><th>Projects</th><th>Earnings</th><th>Pending</th><th>Entries</th></tr></thead><tbody>${report.workers.map(w => `<tr><td>${w.name}</td><td>${w.projectCount}</td><td>${fmtAED(w.totalEarnings)}</td><td>${fmtAED(w.pendingAmount)}</td><td>${w.entries}</td></tr>`).join('')}</tbody></table>`;
      break;
    case 'monthly_performance':
      if (report.months.every(m => m.revenue === 0 && m.expenses === 0)) html += '<div class="empty-inline">No performance data yet</div>';
      else html += `<table class="data-table"><thead><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Profit</th><th>Margin</th></tr></thead><tbody>${report.months.map(m => `<tr><td>${m.month}</td><td class="text-green">${fmtAED(m.revenue)}</td><td class="text-red">${fmtAED(m.expenses)}</td><td>${fmtAED(m.profit)}</td><td>${pct(m.margin)}</td></tr>`).join('')}</tbody></table>`;
      break;
    case 'cash_flow':
      if (report.inflows.length === 0 && report.outflows.length === 0) html += '<div class="empty-inline">No cash flow data yet</div>';
      else html += `<table class="data-table"><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead><tbody>${[...report.inflows.map(i => ({...i, t:'income'})), ...report.outflows.map(o => ({...o, t:'expense'}))].sort((a,b) => new Date(b.date) - new Date(a.date)).map(r => `<tr><td>${fmtDate(r.date)}</td><td>${r.description}</td><td><span class="status-badge" style="background:${r.t==='income'?'var(--green)':'var(--red)'}22;color:${r.t==='income'?'var(--green)':'var(--red)'}">${r.t === 'income' ? 'Inflow' : 'Outflow'}</span></td><td class="${r.t==='income'?'text-green':'text-red'}">${r.t==='income'?'+':'-'}${fmtAED(r.amount)}</td></tr>`).join('')}</tbody></table>`;
      break;
  }
  html += '</div></div>';
  output.innerHTML = html;

  $('#export-csv')?.addEventListener('click', () => exportReportCSV(type, report));
}

function exportReportCSV(type, report) {
  let csv = '';
  switch(type) {
    case 'revenue': csv = 'Client,Amount\n' + report.byClient.map(c => `${c.name},${c.amount}`).join('\n'); break;
    case 'expense': csv = 'Category,Amount\n' + Object.entries(report.byCategory).map(([k,v]) => `${k},${v}`).join('\n'); break;
    case 'profit_loss': csv = `Revenue,${report.revenue}\nExpenses,${report.expenses}\nNet Profit,${report.netProfit}\nMargin,${report.margin}%`; break;
    case 'project_profitability': csv = 'Project,Client,Value,Cost,Profit,Margin,Status\n' + report.projects.map(p => `${p.name},${p.client||''},${p.value},${p.cost},${p.profit},${p.margin}%,${p.status}`).join('\n'); break;
    case 'outstanding': csv = 'Project,Client,Total,Paid,Outstanding,Status\n' + report.items.map(p => `${p.project},${p.client},${p.total},${p.paid},${p.outstanding},${p.status}`).join('\n'); break;
    case 'client_revenue': csv = 'Client,Projects,Total Value,Collected,Outstanding\n' + report.clients.map(c => `${c.name},${c.projectCount},${c.totalValue},${c.collected},${c.outstanding}`).join('\n'); break;
    case 'worker_expenses': csv = 'Worker,Projects,Earnings,Pending,Entries\n' + report.workers.map(w => `${w.name},${w.projectCount},${w.totalEarnings},${w.pendingAmount},${w.entries}`).join('\n'); break;
    case 'monthly_performance': csv = 'Month,Revenue,Expenses,Profit,Margin\n' + report.months.map(m => `${m.month},${m.revenue},${m.expenses},${m.profit},${m.margin}%`).join('\n'); break;
    case 'cash_flow': csv = 'Date,Description,Type,Amount\n' + [...report.inflows, ...report.outflows].sort((a,b) => new Date(b.date) - new Date(a.date)).map(r => `${r.date},${r.description},${r.type},${r.amount}`).join('\n'); break;
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `LUMIQ_${type}_report.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ==================== SETTINGS ====================

async function renderSettings() {
  const data = await api.settings();
  state.org = data.organization;
  state.settings = data.settings;

  const isOwner = state.user.role === 'owner' || state.user.role === 'co_owner';
  const team = isOwner ? await api.team() : [];

  $('#page-content').innerHTML = `
    <div class="page-header"><div><h2 class="page-title">Settings</h2><p class="page-subtitle">${isOwner ? 'Manage your organization, team, and system configuration' : 'View your organization settings'}</p></div></div>

    ${isOwner ? `
      <div class="card settings-section">
        <div class="card-header"><h3>Owner Control Center — Security & Access</h3></div>
        <div class="settings-tabs">
          <button class="settings-tab active" data-tab="company">Company</button>
          <button class="settings-tab" data-tab="financial">Financial</button>
          <button class="settings-tab" data-tab="workers">Team & Access</button>
          <button class="settings-tab" data-tab="permissions">Permission Requests</button>
          <button class="settings-tab" data-tab="audit">Audit Log</button>
          <button class="settings-tab" data-tab="activity">Activity Log</button>
        </div>
        <div id="settings-tab-content"></div>
      </div>
    ` : `
      <div class="card settings-section">
        <div class="card-header"><h3>Company Information</h3></div>
        <div class="settings-read-only">
          <div class="settings-row"><label>Organization Name</label><div>${data.organization.name}</div></div>
          <div class="settings-row"><label>Tagline</label><div>${data.organization.tagline}</div></div>
          <div class="settings-row"><label>Currency</label><div>${data.organization.currency}</div></div>
          <div class="settings-row"><label>Timezone</label><div>${data.organization.timezone}</div></div>
        </div>
      </div>
    `}
  `;

  if (isOwner) {
    renderSettingsTab('company', data, team).catch(() => {});
    $$('.settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.settings-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderSettingsTab(tab.dataset.tab, data, team).catch(() => {});
      });
    });
  }
}

async function renderSettingsTab(tab, data, team) {
  const container = $('#settings-tab-content');
  const org = data.organization;

  switch(tab) {
    case 'company':
      container.innerHTML = `
        <div class="settings-form">
          <div class="form-group"><label>Organization Name</label><input id="set-name" value="${org.name}" /></div>
          <div class="form-group"><label>Tagline</label><input id="set-tagline" value="${org.tagline}" /></div>
          <div class="form-row">
            <div class="form-group"><label>Currency</label><select id="set-currency"><option value="AED" ${org.currency==='AED'?'selected':''}>AED</option><option value="INR" ${org.currency==='INR'?'selected':''}>INR</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
            <div class="form-group"><label>Timezone</label><input id="set-timezone" value="${org.timezone}" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Default Advance %</label><input type="number" id="set-advance" value="${org.default_advance_pct}" /></div>
            <div class="form-group"><label>Max Discount %</label><input type="number" id="set-discount" value="${org.max_discount_pct}" /></div>
          </div>
          <div class="form-group"><label>Default Payment Terms</label><input id="set-terms" value="${org.default_payment_terms}" /></div>
          <div class="form-group"><label>Confidentiality Policy</label><textarea id="set-confidential" rows="4">${org.confidentiality_policy}</textarea></div>
          <button class="btn-primary" id="save-company">Save Changes</button>
        </div>
      `;
      $('#save-company').addEventListener('click', async () => {
        await api.updateSettings({
          name: $('#set-name').value, tagline: $('#set-tagline').value, currency: $('#set-currency').value,
          timezone: $('#set-timezone').value, default_advance_pct: parseFloat($('#set-advance').value),
          max_discount_pct: parseFloat($('#set-discount').value), default_payment_terms: $('#set-terms').value,
          profit_threshold_low: org.profit_threshold_low, profit_threshold_moderate: org.profit_threshold_moderate,
          profit_threshold_healthy: org.profit_threshold_healthy, confidentiality_policy: $('#set-confidential').value,
          expense_categories: data.settings.expense_categories,
        });
        showSuccess('Settings saved successfully');
      });
      break;

    case 'financial':
      container.innerHTML = `
        <div class="settings-form">
          <div class="form-row">
            <div class="form-group"><label>Low Profit Threshold (%)</label><input type="number" id="set-pt-low" value="${org.profit_threshold_low}" /></div>
            <div class="form-group"><label>Moderate Profit Threshold (%)</label><input type="number" id="set-pt-mod" value="${org.profit_threshold_moderate}" /></div>
          </div>
          <div class="form-group"><label>Healthy Profit Threshold (%)</label><input type="number" id="set-pt-healthy" value="${org.profit_threshold_healthy}" /></div>
          <div class="form-group"><label>Expense Categories</label>
            <div class="tag-input-container">
              <div class="tag-list" id="expense-tags">${(data.settings.expense_categories || []).map(c => `<span class="tag">${c}<button class="tag-remove" data-cat="${c}">&times;</button></span>`).join('')}</div>
              <input id="new-cat" placeholder="Add category..." />
            </div>
          </div>
          <button class="btn-primary" id="save-financial">Save Changes</button>
        </div>
      `;
      let cats = [...(data.settings.expense_categories || [])];
      $('#new-cat').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = e.target.value.trim();
          if (val && !cats.includes(val)) {
            cats.push(val);
            e.target.value = '';
            $('#expense-tags').innerHTML = cats.map(c => `<span class="tag">${c}<button class="tag-remove" data-cat="${c}">&times;</button></span>`).join('');
            $$('.tag-remove').forEach(b => b.addEventListener('click', () => { cats = cats.filter(c => c !== b.dataset.cat); b.parentElement.remove(); }));
          }
        }
      });
      $$('.tag-remove').forEach(b => b.addEventListener('click', () => { cats = cats.filter(c => c !== b.dataset.cat); b.parentElement.remove(); }));
      $('#save-financial').addEventListener('click', async () => {
        await api.updateSettings({
          name: org.name, tagline: org.tagline, currency: org.currency, timezone: org.timezone,
          default_advance_pct: org.default_advance_pct, default_payment_terms: org.default_payment_terms,
          max_discount_pct: org.max_discount_pct, profit_threshold_low: parseFloat($('#set-pt-low').value),
          profit_threshold_moderate: parseFloat($('#set-pt-mod').value), profit_threshold_healthy: parseFloat($('#set-pt-healthy').value),
          confidentiality_policy: org.confidentiality_policy, expense_categories: cats,
        });
        showSuccess('Financial settings saved');
      });
      break;

    case 'workers':
      container.innerHTML = `
        <div class="settings-workers-header">
          <h4>Team & Access Control</h4>
          <button class="btn-primary" id="add-worker-btn">+ Create Worker</button>
        </div>
        ${team.filter(t => t.role === 'worker').length === 0 ? emptyState('No workers yet', 'Create worker accounts to give your team members access to LUMIQ. Workers will be able to log in, view assigned projects, and submit entries.') : `
          <div class="table-wrap"><table class="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Projects</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              ${team.filter(t => t.role === 'worker').map(w => `
                <tr>
                  <td><strong>${w.name}</strong></td>
                  <td>${w.email || '—'}</td>
                  <td><span class="status-badge" style="background:${w.active ? 'var(--green)' : 'var(--red)'}22;color:${w.active ? 'var(--green)' : 'var(--red)'}">${w.active ? 'Active' : 'Inactive'}</span></td>
                  <td>${w.assignedProjects.length}</td>
                  <td>${w.last_login ? fmtDateShort(w.last_login) : 'Never'}</td>
                  <td>
                    <div class="table-actions">
                      ${w.active ? `<button class="btn-icon" data-action="deactivate" data-id="${w.id}" title="Deactivate">⏸</button>` : `<button class="btn-icon" data-action="activate" data-id="${w.id}" title="Activate">▶</button>`}
                      <button class="btn-icon" data-action="reset" data-id="${w.id}" title="Reset Password">🔑</button>
                      <button class="btn-icon btn-danger" data-action="remove" data-id="${w.id}" title="Remove Worker">🗑</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table></div>
        `}
        <div class="settings-owner-section">
          <h4>Owner & Co-Owner Accounts</h4>
          <div class="table-wrap"><table class="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th></tr></thead>
            <tbody>
              ${team.filter(t => t.role === 'owner' || t.role === 'co_owner').map(w => `
                <tr><td><strong>${w.name}</strong></td><td>${w.email}</td><td><span class="status-badge" style="background:var(--green)22;color:var(--green)">${statusLabel(w.role)}</span></td><td>${w.last_login ? fmtDateShort(w.last_login) : 'Never'}</td></tr>
              `).join('')}
            </tbody>
          </table></div>
        </div>
      `;
      $('#add-worker-btn')?.addEventListener('click', () => showCreateWorkerModal());
      $$('.btn-icon').forEach(btn => {
        btn.addEventListener('click', async () => {
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          if (action === 'deactivate') {
            if (confirm('Deactivate this worker? They will lose access to LUMIQ immediately.')) {
              await api.deactivateWorker(id);
              const data2 = await api.settings();
              const team2 = await api.team();
              renderSettingsTab('workers', data2, team2).catch(() => {});
            }
          } else if (action === 'activate') {
            await api.activateWorker(id);
            const data2 = await api.settings();
            const team2 = await api.team();
            renderSettingsTab('workers', data2, team2).catch(() => {});
          } else if (action === 'reset') {
            const res = await api.resetWorkerPassword(id);
            showWorkerPasswordModal(res.tempPassword, 'Password has been reset');
          } else if (action === 'remove') {
            if (confirm('Remove this worker permanently? This will immediately revoke their access to LUMIQ and cannot be undone.')) {
              await api.deleteWorker(id);
              const data2 = await api.settings();
              const team2 = await api.team();
              renderSettingsTab('workers', data2, team2).catch(() => {});
            }
          }
        });
      });
      break;

    case 'permissions':
      const permReqs = await api.permissionRequests();
      container.innerHTML = `
        <h4>Permission Requests</h4>
        ${permReqs.length === 0 ? emptyState('No permission requests', 'When workers request additional access through chat, the requests will appear here for your approval.') : `
          <div class="permission-list">
            ${permReqs.map(r => `
              <div class="permission-card ${r.status}">
                <div class="permission-header">
                  <div><strong>${r.worker_name}</strong> requested <strong>${r.permission}</strong></div>
                  <span class="status-badge" style="background:${statusColor(r.status)}22;color:${statusColor(r.status)}">${statusLabel(r.status)}</span>
                </div>
                ${r.description ? `<div class="permission-desc">${r.description}</div>` : ''}
                ${r.project_name ? `<div class="permission-project">Project: ${r.project_name}</div>` : ''}
                <div class="permission-date">Requested: ${fmtDate(r.created_at)}</div>
                ${r.status === 'pending' ? `<div class="permission-actions"><button class="btn-approve" data-id="${r.id}">Approve</button><button class="btn-reject" data-id="${r.id}">Deny</button></div>` : ''}
              </div>
            `).join('')}
          </div>
        `}
      `;
      $$('.btn-approve').forEach(btn => btn.addEventListener('click', async () => { await api.approvePermission(btn.dataset.id, ''); await renderSettingsTab('permissions', data, team); }));
      $$('.btn-reject').forEach(btn => btn.addEventListener('click', async () => { await api.denyPermission(btn.dataset.id, ''); await renderSettingsTab('permissions', data, team); }));
      break;

    case 'audit':
      const audit = await api.auditLogs();
      container.innerHTML = `
        <h4>Audit Log</h4>
        ${audit.length === 0 ? emptyState('No audit entries', 'All actions performed in LUMIQ will be logged here for accountability.') : `
          <div class="table-wrap"><table class="data-table">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Type</th><th>Details</th></tr></thead>
            <tbody>${audit.map(a => `<tr><td>${fmtDateTime(a.timestamp)}</td><td>${a.user_name || '—'}</td><td>${a.action}</td><td>${a.object_type || '—'}</td><td>${a.new_value || '—'}</td></tr>`).join('')}</tbody>
          </table></div>
        `}
      `;
      break;

    case 'activity':
      const activity = await api.activityLogs();
      container.innerHTML = `
        <h4>Activity Log</h4>
        ${activity.length === 0 ? emptyState('No activity recorded', 'Worker activity will be tracked here including logins, entries, and project access.') : `
          <div class="table-wrap"><table class="data-table">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>${activity.map(a => `<tr><td>${fmtDateTime(a.timestamp)}</td><td>${a.user_name || '—'}</td><td>${a.action}</td><td>${a.details || '—'}</td></tr>`).join('')}</tbody>
          </table></div>
        `}
      `;
      break;
  }
}

function showCreateWorkerModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Create Worker Account</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label>Worker Name *</label><input id="wk-name" placeholder="e.g., Ahmed Al Rashid" /></div>
        <div class="form-group"><label>Email</label><input id="wk-email" placeholder="ahmed@lumiq.ae" /></div>
        <div class="form-group"><label>Phone</label><input id="wk-phone" placeholder="+971 50 123 4567" /></div>
        <div class="worker-create-hint">A temporary password will be generated. The worker must change it on first login.</div>
      </div>
      <div class="modal-footer"><button class="btn-secondary modal-close-btn">Cancel</button><button class="btn-primary" id="save-worker">Create Worker</button></div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelector('#save-worker').addEventListener('click', async () => {
    const name = modal.querySelector('#wk-name').value;
    if (!name) return;
    const res = await api.createWorker({
      name, email: modal.querySelector('#wk-email').value, phone: modal.querySelector('#wk-phone').value,
    });
    close();
    showWorkerPasswordModal(res.tempPassword, 'Worker account created');
    // Refresh settings
    const data = await api.settings();
    const team = await api.team();
    renderSettingsTab('workers', data, team);
  });
}

function showWorkerPasswordModal(password, title) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>${title}</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div class="password-display">
          <div class="password-label">Temporary Password:</div>
          <div class="password-value">${password}</div>
          <div class="password-warning">⚠ Provide this password to the worker securely. They must change it on first login.</div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-primary modal-close-btn">Done</button></div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

// ==================== NOTIFICATIONS ====================

async function refreshNotifications() {
  try {
    state.notifications = await api.notifications();
    const unread = state.notifications.filter(n => !n.read_status);
    const badge = $('#notif-count');
    if (badge) {
      if (unread.length > 0) { badge.style.display = 'flex'; badge.textContent = unread.length; }
      else badge.style.display = 'none';
    }
    const list = $('#notif-list');
    if (list) {
      list.innerHTML = state.notifications.length === 0 ? '<div class="notif-empty">No notifications</div>' :
        state.notifications.slice(0, 20).map(n => `
          <div class="notif-item ${n.read_status ? 'read' : 'unread'}" data-id="${n.id}">
            <div class="notif-icon ${n.type}">${notifIcon(n.type)}</div>
            <div class="notif-content">
              <div class="notif-title">${n.title}</div>
              <div class="notif-message">${n.message}</div>
              <div class="notif-time">${fmtDateTime(n.created_at)}</div>
            </div>
          </div>
        `).join('');
      $$('.notif-item').forEach(item => {
        item.addEventListener('click', async () => {
          await api.markNotificationRead(item.dataset.id);
          await refreshNotifications();
        });
      });
    }
    // Update nav badges
    const chatBadge = $('#nav-chat-badge');
    if (chatBadge) {
      const chatNotifs = unread.filter(n => n.type === 'message' || n.type === 'permission');
      if (chatNotifs.length > 0) { chatBadge.style.display = 'flex'; chatBadge.textContent = chatNotifs.length; }
      else chatBadge.style.display = 'none';
    }
  } catch (e) { /* ignore */ }
}

function notifIcon(type) {
  const icons = {
    message: '💬', permission: '🔒', approval: '✓', payment: '💰',
    project: '📁', client: '👥', worker: '👤', expense: '🧾',
  };
  return icons[type] || '🔔';
}

function startNotificationPolling() {
  if (state.notificationRefreshInterval) clearInterval(state.notificationRefreshInterval);
  refreshNotifications();
  state.notificationRefreshInterval = setInterval(refreshNotifications, 15000);
}

function stopNotificationPolling() {
  if (state.notificationRefreshInterval) { clearInterval(state.notificationRefreshInterval); state.notificationRefreshInterval = null; }
  if (chatState.pollInterval) { clearInterval(chatState.pollInterval); chatState.pollInterval = null; }
}

// ==================== ROUTING ====================

window.addEventListener('hashchange', async () => {
  const hash = window.location.hash.replace('#/', '') || 'dashboard';
  const parts = hash.split('/');
  const page = parts[0];

  if (page === 'login' || !state.user) {
    stopNotificationPolling();
    renderLogin();
    return;
  }

  state.currentPage = page;
  renderShell();
  await loadPage(page);
});

// ==================== INIT ====================

if (!state.user) {
  renderLogin();
} else {
  initApp();
}
