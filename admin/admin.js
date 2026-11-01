/* ============================================
   V3 CLASSES — Admin Dashboard SPA Logic
   ============================================ */

(function () {
  'use strict';

  const API_BASE = window.V3_API_BASE || 'http://localhost:5000/api';

  // ── STATE ──
  let token = localStorage.getItem('v3admin_token');
  let adminData = JSON.parse(localStorage.getItem('v3admin_data') || 'null');
  let currentPage = 'dashboard';

  // ── DOM REFS ──
  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const pageContent = document.getElementById('pageContent');
  const pageTitle = document.getElementById('pageTitle');
  const adminName = document.getElementById('adminName');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const logoutBtn = document.getElementById('logoutBtn');

  // ── INIT ──
  function init() {
    if (token && adminData) {
      showDashboard();
    } else {
      showLogin();
    }
    bindEvents();
  }

  // ── AUTH ──
  function showLogin() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }

  function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    adminName.textContent = adminData?.name || 'Admin';
    navigateTo('dashboard');
  }

  function logout() {
    token = null; adminData = null;
    localStorage.removeItem('v3admin_token');
    localStorage.removeItem('v3admin_data');
    showLogin();
  }

  // ── API HELPER ──
  async function api(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
    const data = await res.json().catch(() => ({}));

    const isLoginEndpoint = endpoint === '/admin/login' || endpoint.endsWith('/admin/login');

    if (res.status === 401 && !isLoginEndpoint) {
      logout();
      throw new Error('Session expired');
    }
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  // ── TOAST ──
  function toast(msg, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  // ── EVENTS ──
  function bindEvents() {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.textContent = '';
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const btn = document.getElementById('loginBtn');
      btn.disabled = true; btn.textContent = 'Signing in...';
      try {
        const res = await api('/admin/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        token = res.data.token; adminData = res.data.admin;
        localStorage.setItem('v3admin_token', token);
        localStorage.setItem('v3admin_data', JSON.stringify(adminData));
        showDashboard();
      } catch (err) {
        loginError.textContent = err.message;
      } finally {
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    });

    document.querySelectorAll('.sidebar__link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
        sidebar.classList.remove('open');
      });
    });

    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // ── NAVIGATION ──
  function navigateTo(page) {
    currentPage = page;
    pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar__link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    const renderers = {
      dashboard: renderDashboard,
      enquiries: renderEnquiries,
      students: renderStudents,
      courses: renderCourses,
      faculty: renderFaculty,
      results: renderResults,
      gallery: renderGallery,
      faqs: renderFaqs,
      settings: renderSettings,
    };

    pageContent.innerHTML = '<div class="loading">Loading...</div>';
    (renderers[page] || renderDashboard)();
  }

  // ── HELPERS ──
  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  }
  function statusBadge(s) {
    const cls = { NEW:'new', CONTACTED:'contacted', FOLLOW_UP:'follow-up', CONVERTED:'converted', CLOSED:'closed' };
    return `<span class="badge badge--${cls[s] || 'new'}">${s.replace('_',' ')}</span>`;
  }
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ═══════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════
  async function renderDashboard() {
    try {
      const res = await api('/admin/dashboard');
      const d = res.data;
      pageContent.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card stat-card--primary"><div class="stat-card__label">Total Enquiries</div><div class="stat-card__value">${d.stats.totalEnquiries}</div></div>
          <div class="stat-card stat-card--warning"><div class="stat-card__label">New Enquiries</div><div class="stat-card__value">${d.stats.newEnquiries}</div></div>
          <div class="stat-card stat-card--info"><div class="stat-card__label">Contacted</div><div class="stat-card__value">${d.stats.contactedEnquiries}</div></div>
          <div class="stat-card stat-card--success"><div class="stat-card__label">Converted</div><div class="stat-card__value">${d.stats.convertedEnquiries}</div></div>
          <div class="stat-card"><div class="stat-card__label">Total Students</div><div class="stat-card__value">${d.stats.totalStudents}</div></div>
          <div class="stat-card"><div class="stat-card__label">Active Courses</div><div class="stat-card__value">${d.stats.totalCourses}</div></div>
          <div class="stat-card"><div class="stat-card__label">Faculty</div><div class="stat-card__value">${d.stats.totalFaculty}</div></div>
          <div class="stat-card stat-card--info"><div class="stat-card__label">This Month</div><div class="stat-card__value">${d.stats.enquiriesThisMonth}</div></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:1rem">
          <div class="data-section">
            <div class="data-section__header"><div class="data-section__title">Recent Enquiries</div></div>
            <table class="data-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Course</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                ${d.recentEnquiries.length ? d.recentEnquiries.map(e => `
                  <tr><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.phone)}</td><td>${escapeHtml(e.course||'-')}</td><td>${statusBadge(e.status)}</td><td>${formatDate(e.createdAt)}</td></tr>
                `).join('') : '<tr><td colspan="5"><div class="empty-state"><div class="empty-state__text">No enquiries yet</div></div></td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="data-section">
            <div class="data-section__header"><div class="data-section__title">Recent Students</div></div>
            <table class="data-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Course</th><th>Date</th></tr></thead>
              <tbody>
                ${d.recentStudents.length ? d.recentStudents.map(s => `
                  <tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.phone)}</td><td>${escapeHtml(s.course||'-')}</td><td>${formatDate(s.createdAt)}</td></tr>
                `).join('') : '<tr><td colspan="4"><div class="empty-state"><div class="empty-state__text">No students yet</div></div></td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) { pageContent.innerHTML = `<div class="empty-state"><div class="empty-state__text">Error: ${err.message}</div></div>`; }
  }

  // ═══════════════════════════════════════
  // ENQUIRIES & CHAT ENQUIRIES
  // ═══════════════════════════════════════
  async function renderEnquiries(page = 1, search = '', status = '', source = '') {
    try {
      let url = `/admin/enquiries?page=${page}&limit=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;
      if (source) url += `&source=${source}`;
      const res = await api(url);
      const { data: enquiries, pagination: pg } = res;

      pageContent.innerHTML = `
        <div class="data-section">
          <div class="data-section__header">
            <div class="data-section__title">All Enquiries (${pg.total})</div>
            <div class="data-section__actions">
              <select id="enquirySourceFilter" class="data-section__search" style="min-width:130px">
                <option value="">All Sources</option>
                <option value="CHATBOT" ${source==='CHATBOT'?'selected':''}>🤖 Chatbot</option>
                <option value="WEBSITE" ${source==='WEBSITE'?'selected':''}>🌐 Website</option>
                <option value="CONTACT_FORM" ${source==='CONTACT_FORM'?'selected':''}>✉️ Contact Form</option>
              </select>
              <select id="enquiryStatusFilter" class="data-section__search" style="min-width:130px">
                <option value="">All Status</option>
                <option value="NEW" ${status==='NEW'?'selected':''}>New</option>
                <option value="CONTACTED" ${status==='CONTACTED'?'selected':''}>Contacted</option>
                <option value="FOLLOW_UP" ${status==='FOLLOW_UP'?'selected':''}>Follow Up</option>
                <option value="CONVERTED" ${status==='CONVERTED'?'selected':''}>Converted</option>
                <option value="CLOSED" ${status==='CLOSED'?'selected':''}>Closed</option>
              </select>
              <input type="text" class="data-section__search" id="enquirySearch" placeholder="Search name/phone..." value="${escapeHtml(search)}">
            </div>
          </div>
          <table class="data-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Course</th><th>Source</th><th>Status</th><th>Date</th><th>Conversation</th><th>Actions</th></tr></thead>
            <tbody>
              ${enquiries.length ? enquiries.map(e => `
                <tr>
                  <td><strong>${escapeHtml(e.name)}</strong></td>
                  <td><a href="tel:${e.phone}">${escapeHtml(e.phone)}</a></td>
                  <td>${escapeHtml(e.course||'-')}</td>
                  <td>
                    <span class="badge ${e.source==='CHATBOT'?'badge--converted':'badge--new'}">
                      ${e.source==='CHATBOT' ? '🤖 Chatbot' : e.source}
                    </span>
                  </td>
                  <td>
                    <select class="enquiry-status-select" data-id="${e.id}" style="padding:0.3rem;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:4px;color:var(--admin-text);font-size:0.8rem">
                      <option value="NEW" ${e.status==='NEW'?'selected':''}>New</option>
                      <option value="CONTACTED" ${e.status==='CONTACTED'?'selected':''}>Contacted</option>
                      <option value="FOLLOW_UP" ${e.status==='FOLLOW_UP'?'selected':''}>Follow Up</option>
                      <option value="CONVERTED" ${e.status==='CONVERTED'?'selected':''}>Converted</option>
                      <option value="CLOSED" ${e.status==='CLOSED'?'selected':''}>Closed</option>
                    </select>
                  </td>
                  <td>${formatDate(e.createdAt)}</td>
                  <td>
                    ${e.sessionId ? `
                      <button class="btn btn--primary btn--sm view-chat-btn" data-session="${e.sessionId}" data-name="${escapeHtml(e.name)}">
                        💬 View Chat
                      </button>
                    ` : (e.message ? `<span style="font-size:0.8rem;color:var(--admin-text-muted)">${escapeHtml(e.message).substring(0,30)}...</span>` : '-')}
                  </td>
                  <td>
                    ${e.message ? `<button class="btn btn--ghost btn--sm view-note-btn" data-msg="${escapeHtml(e.message)}">Notes</button>` : '-'}
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="8"><div class="empty-state"><div class="empty-state__text">No enquiries found</div></div></td></tr>'}
            </tbody>
          </table>
          ${pg.pages > 1 ? `<div class="pagination">${renderPagination(pg, 'enquiriesPage')}</div>` : ''}
        </div>
      `;

      // Bind status change
      document.querySelectorAll('.enquiry-status-select').forEach(select => {
        select.addEventListener('change', async (ev) => {
          try {
            await api(`/admin/enquiries/${ev.target.dataset.id}`, {
              method: 'PATCH', body: JSON.stringify({ status: ev.target.value })
            });
            toast('Status updated');
          } catch (err) { toast(err.message, 'error'); }
        });
      });

      // Bind View Chat buttons
      document.querySelectorAll('.view-chat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          showChatTranscriptModal(btn.dataset.session, btn.dataset.name);
        });
      });

      // Bind View Note buttons
      document.querySelectorAll('.view-note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          alert('Enquiry Message:\n\n' + btn.dataset.msg);
        });
      });

      // Bind search & filters
      const searchInput = document.getElementById('enquirySearch');
      let searchTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          renderEnquiries(1, searchInput.value, document.getElementById('enquiryStatusFilter').value, document.getElementById('enquirySourceFilter').value);
        }, 400);
      });

      document.getElementById('enquiryStatusFilter').addEventListener('change', (e) => {
        renderEnquiries(1, searchInput.value, e.target.value, document.getElementById('enquirySourceFilter').value);
      });

      document.getElementById('enquirySourceFilter').addEventListener('change', (e) => {
        renderEnquiries(1, searchInput.value, document.getElementById('enquiryStatusFilter').value, e.target.value);
      });

      // Bind pagination
      bindPagination('enquiriesPage', (p) => renderEnquiries(p, search, status, source));
    } catch (err) { pageContent.innerHTML = `<div class="empty-state"><div class="empty-state__text">Error: ${err.message}</div></div>`; }
  }

  // ── CHAT TRANSCRIPT MODAL ──
  async function showChatTranscriptModal(sessionId, visitorName) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:600px">
        <div class="modal__header">
          <div class="modal__title">💬 Chat Transcript — ${visitorName || 'Visitor'}</div>
          <button class="modal__close" id="chatModalClose">&times;</button>
        </div>
        <div class="modal__body" id="chatTranscriptBody" style="max-height:450px;overflow-y:auto;background:var(--admin-bg);padding:1rem;border-radius:8px">
          <div class="loading">Loading chat history...</div>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" id="chatModalDone">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    overlay.querySelector('#chatModalClose').addEventListener('click', closeModal);
    overlay.querySelector('#chatModalDone').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    try {
      const res = await api(`/admin/chat/${sessionId}`);
      const messages = res.data?.messages || [];
      const bodyEl = overlay.querySelector('#chatTranscriptBody');

      if (!messages.length) {
        bodyEl.innerHTML = '<div class="empty-state"><div class="empty-state__text">No messages recorded for this session</div></div>';
        return;
      }

      bodyEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px">
          ${messages.map(m => `
            <div style="display:flex;flex-direction:column;align-self:${m.sender==='USER'?'flex-end':'flex-start'};max-width:85%">
              <div style="font-size:0.7rem;color:var(--admin-text-muted);margin-bottom:2px;${m.sender==='USER'?'text-align:right':''}">
                ${m.sender==='USER'?'👤 '+ (visitorName||'User'):'🤖 Bot'} · ${new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
              </div>
              <div style="padding:8px 12px;border-radius:10px;font-size:0.88rem;line-height:1.4;white-space:pre-line;background:${m.sender==='USER'?'var(--admin-primary)':'var(--admin-surface-2)'};color:#fff">
                ${escapeHtml(m.message)}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      overlay.querySelector('#chatTranscriptBody').innerHTML = `<div class="empty-state"><div class="empty-state__text">Error: ${err.message}</div></div>`;
    }
  }

  // ═══════════════════════════════════════
  // GENERIC CRUD RENDERER
  // ═══════════════════════════════════════
  async function renderCrudPage({ title, apiPath, columns, formFields, nameField = 'name' }) {
    try {
      let res;
      const targetAdminPath = apiPath.startsWith('/admin') ? apiPath : `/admin${apiPath}`;
      try {
        res = await api(targetAdminPath);
      } catch (err) {
        if (!apiPath.startsWith('/admin')) {
          res = await api(apiPath);
        } else {
          throw err;
        }
      }
      const items = res?.data || [];

      pageContent.innerHTML = `
        <div class="data-section">
          <div class="data-section__header">
            <div class="data-section__title">${title} (${items.length})</div>
            <div class="data-section__actions">
              <button class="btn btn--primary btn--sm" id="addNewBtn">+ Add New</button>
            </div>
          </div>
          <table class="data-table">
            <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}<th>Actions</th></tr></thead>
            <tbody>
              ${items.length ? items.map(item => `
                <tr>
                  ${columns.map(c => `<td>${c.render ? c.render(item) : escapeHtml(String(item[c.key]||'-'))}</td>`).join('')}
                  <td>
                    <button class="btn btn--ghost btn--sm edit-btn" data-id="${item.id}" data-item='${JSON.stringify(item).replace(/'/g,"&#39;")}'>Edit</button>
                    <button class="btn btn--danger btn--sm delete-btn" data-id="${item.id}">Delete</button>
                  </td>
                </tr>
              `).join('') : `<tr><td colspan="${columns.length+1}"><div class="empty-state"><div class="empty-state__text">No ${title.toLowerCase()} yet</div></div></td></tr>`}
            </tbody>
          </table>
        </div>
      `;

      // Add button
      document.getElementById('addNewBtn').addEventListener('click', () => {
        showFormModal(title, formFields, null, async (data) => {
          await api(apiPath.startsWith('/admin') ? apiPath : `/admin${apiPath}`, { method: 'POST', body: JSON.stringify(data) });
          toast(`${title.slice(0,-1)} created`);
          renderCrudPage({ title, apiPath, columns, formFields, nameField });
        });
      });

      // Edit buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = JSON.parse(btn.dataset.item.replace(/&#39;/g, "'"));
          showFormModal(`Edit ${title.slice(0,-1)}`, formFields, item, async (data) => {
            const path = apiPath.startsWith('/admin') ? apiPath : `/admin${apiPath}`;
            await api(`${path}/${item.id}`, { method: 'PATCH', body: JSON.stringify(data) });
            toast(`${title.slice(0,-1)} updated`);
            renderCrudPage({ title, apiPath, columns, formFields, nameField });
          });
        });
      });

      // Delete buttons
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to delete this item?')) return;
          try {
            const path = apiPath.startsWith('/admin') ? apiPath : `/admin${apiPath}`;
            await api(`${path}/${btn.dataset.id}`, { method: 'DELETE' });
            toast('Deleted successfully');
            renderCrudPage({ title, apiPath, columns, formFields, nameField });
          } catch (err) { toast(err.message, 'error'); }
        });
      });
    } catch (err) { pageContent.innerHTML = `<div class="empty-state"><div class="empty-state__text">Error: ${err.message}</div></div>`; }
  }

  // ── MODAL ──
  function showFormModal(title, fields, existingData, onSubmit) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <div class="modal__title">${title}</div>
          <button class="modal__close" id="modalClose">&times;</button>
        </div>
        <div class="modal__body">
          <form id="modalForm">
            ${fields.map(f => {
              const val = existingData ? (existingData[f.key] || '') : (f.default || '');
              if (f.type === 'textarea') {
                return `<div class="form-group"><label>${f.label}</label><textarea name="${f.key}" ${f.required?'required':''}>${escapeHtml(String(val))}</textarea></div>`;
              }
              if (f.type === 'select') {
                return `<div class="form-group"><label>${f.label}</label><select name="${f.key}" ${f.required?'required':''}>${f.options.map(o => `<option value="${o.value}" ${String(val)===String(o.value)?'selected':''}>${o.label}</option>`).join('')}</select></div>`;
              }
              if (f.type === 'checkbox') {
                return `<div class="form-group" style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" name="${f.key}" ${val?'checked':''}><label style="margin:0">${f.label}</label></div>`;
              }
              return `<div class="form-group"><label>${f.label}</label><input type="${f.type||'text'}" name="${f.key}" value="${escapeHtml(String(val))}" ${f.required?'required':''}></div>`;
            }).join('')}
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" id="modalCancel">Cancel</button>
          <button class="btn btn--primary" id="modalSubmit">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    overlay.querySelector('#modalClose').addEventListener('click', closeModal);
    overlay.querySelector('#modalCancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    overlay.querySelector('#modalSubmit').addEventListener('click', async () => {
      const form = document.getElementById('modalForm');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const formData = new FormData(form);
      const data = {};
      fields.forEach(f => {
        if (f.type === 'checkbox') {
          data[f.key] = form.querySelector(`[name="${f.key}"]`).checked;
        } else {
          const v = formData.get(f.key);
          if (v !== null && v !== '') data[f.key] = v;
        }
      });
      try {
        await onSubmit(data);
        closeModal();
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  // ── PAGINATION HELPERS ──
  function renderPagination(pg, id) {
    let html = '';
    html += `<button ${pg.page <= 1 ? 'disabled' : ''} data-page="${pg.page - 1}" class="pag-btn" data-pag="${id}">Prev</button>`;
    for (let i = 1; i <= pg.pages; i++) {
      html += `<button class="pag-btn ${i === pg.page ? 'active' : ''}" data-page="${i}" data-pag="${id}">${i}</button>`;
    }
    html += `<button ${pg.page >= pg.pages ? 'disabled' : ''} data-page="${pg.page + 1}" class="pag-btn" data-pag="${id}">Next</button>`;
    return html;
  }
  function bindPagination(id, callback) {
    document.querySelectorAll(`.pag-btn[data-pag="${id}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) callback(parseInt(btn.dataset.page));
      });
    });
  }

  // ═══════════════════════════════════════
  // PAGE RENDERERS
  // ═══════════════════════════════════════

  function renderStudents() {
    renderCrudPage({
      title: 'Students', apiPath: '/admin/students',
      columns: [
        { label:'Name', key:'name' },
        { label:'Phone', key:'phone' },
        { label:'Email', key:'email' },
        { label:'Class', key:'class' },
        { label:'Course', key:'course' },
        { label:'Date', key:'createdAt', render: i => formatDate(i.createdAt) },
      ],
      formFields: [
        { key:'name', label:'Full Name', required:true },
        { key:'phone', label:'Phone Number', required:true },
        { key:'email', label:'Email', type:'email' },
        { key:'class', label:'Class' },
        { key:'course', label:'Course' },
        { key:'school', label:'School' },
      ],
    });
  }

  function renderCourses() {
    renderCrudPage({
      title: 'Courses', apiPath: '/courses',
      columns: [
        { label:'Name', key:'name' },
        { label:'Level', key:'level' },
        { label:'Duration', key:'duration' },
        { label:'Active', key:'isActive', render: i => i.isActive ? '✅' : '❌' },
      ],
      formFields: [
        { key:'name', label:'Course Name', required:true },
        { key:'description', label:'Description', type:'textarea' },
        { key:'level', label:'Level', type:'select', options:[{value:'Foundation',label:'Foundation'},{value:'Intermediate',label:'Intermediate'},{value:'Competitive',label:'Competitive'}] },
        { key:'duration', label:'Duration' },
        { key:'fee', label:'Fee' },
        { key:'isActive', label:'Active', type:'checkbox', default:true },
      ],
    });
  }

  function renderFaculty() {
    renderCrudPage({
      title: 'Faculty', apiPath: '/faculty',
      columns: [
        { label:'Name', key:'name' },
        { label:'Subject', key:'subject' },
        { label:'Qualification', key:'qualification' },
        { label:'Experience', key:'experience' },
        { label:'Active', key:'isActive', render: i => i.isActive ? '✅' : '❌' },
      ],
      formFields: [
        { key:'name', label:'Name', required:true },
        { key:'subject', label:'Subject', required:true },
        { key:'qualification', label:'Qualification' },
        { key:'experience', label:'Experience' },
        { key:'description', label:'Description', type:'textarea' },
        { key:'photo', label:'Photo URL' },
        { key:'isActive', label:'Active', type:'checkbox', default:true },
      ],
    });
  }

  function renderResults() {
    renderCrudPage({
      title: 'Results', apiPath: '/results',
      columns: [
        { label:'Student', key:'studentName' },
        { label:'Exam', key:'exam' },
        { label:'Score', key:'score' },
        { label:'Year', key:'year' },
        { label:'Category', key:'category' },
        { label:'Featured', key:'isFeatured', render: i => i.isFeatured ? '⭐' : '-' },
      ],
      formFields: [
        { key:'studentName', label:'Student Name', required:true },
        { key:'exam', label:'Exam' },
        { key:'class', label:'Class' },
        { key:'score', label:'Score' },
        { key:'rank', label:'Rank' },
        { key:'year', label:'Year' },
        { key:'category', label:'Category', type:'select', options:[{value:'board',label:'Board'},{value:'competitive',label:'Competitive'}] },
        { key:'isFeatured', label:'Featured', type:'checkbox' },
      ],
    });
  }

  function renderGallery() {
    renderCrudPage({
      title: 'Gallery', apiPath: '/gallery',
      columns: [
        { label:'Title', key:'title' },
        { label:'Category', key:'category' },
        { label:'Image', key:'imageUrl', render: i => i.imageUrl ? `<img src="${i.imageUrl.startsWith('http')?i.imageUrl:'../'+i.imageUrl}" style="height:40px;border-radius:4px" alt="">` : '-' },
        { label:'Date', key:'createdAt', render: i => formatDate(i.createdAt) },
      ],
      formFields: [
        { key:'title', label:'Title' },
        { key:'imageUrl', label:'Image URL', required:true },
        { key:'category', label:'Category', type:'select', options:[{value:'events',label:'Events'},{value:'classroom',label:'Classroom'},{value:'achievements',label:'Achievements'}] },
        { key:'description', label:'Description', type:'textarea' },
      ],
    });
  }

  function renderFaqs() {
    renderCrudPage({
      title: 'FAQs', apiPath: '/faqs',
      columns: [
        { label:'Question', key:'question', render: i => escapeHtml((i.question||'').substring(0,60)) + (i.question?.length>60?'...':'') },
        { label:'Category', key:'category' },
        { label:'Active', key:'isActive', render: i => i.isActive ? '✅' : '❌' },
      ],
      formFields: [
        { key:'question', label:'Question', required:true },
        { key:'answer', label:'Answer', type:'textarea', required:true },
        { key:'category', label:'Category', type:'select', options:[
          {value:'general',label:'General'},{value:'courses',label:'Courses'},{value:'admission',label:'Admission'},
          {value:'fees',label:'Fees'},{value:'contact',label:'Contact'},{value:'results',label:'Results'}
        ]},
        { key:'isActive', label:'Active', type:'checkbox', default:true },
      ],
    });
  }

  // ═══════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════
  async function renderSettings() {
    try {
      const res = await api('/settings');
      const s = res.data;
      pageContent.innerHTML = `
        <div class="data-section">
          <div class="data-section__header">
            <div class="data-section__title">Website Settings</div>
          </div>
          <div style="padding:1.5rem">
            <form id="settingsForm">
              <div class="form-row">
                <div class="form-group"><label>Institute Name</label><input name="instituteName" value="${escapeHtml(s.instituteName||'')}"></div>
                <div class="form-group"><label>Tagline</label><input name="tagline" value="${escapeHtml(s.tagline||'')}"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Phone</label><input name="phone" value="${escapeHtml(s.phone||'')}"></div>
                <div class="form-group"><label>Email</label><input name="email" value="${escapeHtml(s.email||'')}"></div>
              </div>
              <div class="form-group"><label>Address</label><textarea name="address">${escapeHtml(s.address||'')}</textarea></div>
              <div class="form-row">
                <div class="form-group"><label>WhatsApp</label><input name="whatsapp" value="${escapeHtml(s.whatsapp||'')}"></div>
                <div class="form-group"><label>Working Hours</label><input name="workingHours" value="${escapeHtml(s.workingHours||'')}"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Instagram URL</label><input name="instagram" value="${escapeHtml(s.instagram||'')}"></div>
                <div class="form-group"><label>YouTube URL</label><input name="youtube" value="${escapeHtml(s.youtube||'')}"></div>
              </div>
              <div class="form-group"><label>Facebook URL</label><input name="facebook" value="${escapeHtml(s.facebook||'')}"></div>
              <button type="submit" class="btn btn--primary" style="margin-top:1rem">Save Settings</button>
            </form>
          </div>
        </div>
      `;

      document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        try {
          await api('/admin/settings', { method:'PATCH', body:JSON.stringify(data) });
          toast('Settings saved successfully');
        } catch (err) { toast(err.message, 'error'); }
      });
    } catch (err) { pageContent.innerHTML = `<div class="empty-state"><div class="empty-state__text">Error: ${err.message}</div></div>`; }
  }

  // ── START ──
  init();
})();
