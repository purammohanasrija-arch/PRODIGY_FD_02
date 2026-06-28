// ════════════════════════════════════════
//  MOCK BACKEND (localStorage)
//  Drop-in compatible with real Express API
// ════════════════════════════════════════
const API = {
  token: null,

  init() {
    this.token = localStorage.getItem('ems_token');
    // seed demo admin
    if (!localStorage.getItem('ems_admins')) {
      const admins = [{ username: 'admin', password: 'admin123', id: '1' }];
      localStorage.setItem('ems_admins', JSON.stringify(admins));
    }
    // seed demo employees
    if (!localStorage.getItem('ems_employees')) {
      const demos = [
        { _id: uid(), employeeId: 'EMP-001', name: 'Ravi Kumar',     email: 'ravi@company.com',    phone: '+91 98765 43210', department: 'Engineering', designation: 'Senior Developer',   salary: 95000, createdAt: new Date(Date.now()-30*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-002', name: 'Priya Sharma',   email: 'priya@company.com',   phone: '+91 87654 32109', department: 'Marketing',   designation: 'Marketing Manager',  salary: 72000, createdAt: new Date(Date.now()-25*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-003', name: 'Arjun Mehta',    email: 'arjun@company.com',   phone: '+91 76543 21098', department: 'Sales',       designation: 'Sales Executive',    salary: 58000, createdAt: new Date(Date.now()-20*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-004', name: 'Sneha Reddy',    email: 'sneha@company.com',   phone: '+91 65432 10987', department: 'HR',          designation: 'HR Manager',         salary: 68000, createdAt: new Date(Date.now()-18*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-005', name: 'Vikram Singh',   email: 'vikram@company.com',  phone: '+91 54321 09876', department: 'Finance',     designation: 'Financial Analyst',  salary: 82000, createdAt: new Date(Date.now()-15*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-006', name: 'Anjali Nair',    email: 'anjali@company.com',  phone: '+91 43210 98765', department: 'Design',      designation: 'UX Designer',        salary: 77000, createdAt: new Date(Date.now()-10*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-007', name: 'Rohit Gupta',    email: 'rohit@company.com',   phone: '+91 32109 87654', department: 'Engineering', designation: 'DevOps Engineer',    salary: 88000, createdAt: new Date(Date.now()-8*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-008', name: 'Kavitha Rao',    email: 'kavitha@company.com', phone: '+91 21098 76543', department: 'Operations',  designation: 'Operations Lead',    salary: 64000, createdAt: new Date(Date.now()-5*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-009', name: 'Siddharth Jain', email: 'sid@company.com',     phone: '+91 10987 65432', department: 'Engineering', designation: 'Frontend Dev',       salary: 71000, createdAt: new Date(Date.now()-3*86400000).toISOString() },
        { _id: uid(), employeeId: 'EMP-010', name: 'Meera Pillai',   email: 'meera@company.com',   phone: '+91 09876 54321', department: 'Marketing',   designation: 'Content Strategist', salary: 55000, createdAt: new Date(Date.now()-1*86400000).toISOString() },
      ];
      localStorage.setItem('ems_employees', JSON.stringify(demos));
    }
    // seed activity log
    if (!localStorage.getItem('ems_activity')) {
      const now = Date.now();
      localStorage.setItem('ems_activity', JSON.stringify([
        { id: uid(), type:'add',    message:'Added Meera Pillai (EMP-010) to Marketing',         at: new Date(now-86400000*1).toISOString() },
        { id: uid(), type:'add',    message:'Added Siddharth Jain (EMP-009) to Engineering',     at: new Date(now-86400000*3).toISOString() },
        { id: uid(), type:'edit',   message:'Updated Kavitha Rao (EMP-008)',                      at: new Date(now-86400000*5).toISOString() },
        { id: uid(), type:'add',    message:'Added Rohit Gupta (EMP-007) to Engineering',        at: new Date(now-86400000*8).toISOString() },
        { id: uid(), type:'delete', message:'Removed Kiran Bose (EMP-006-old)',                   at: new Date(now-86400000*10).toISOString() },
        { id: uid(), type:'login',  message:'admin signed in',                                   at: new Date(now-86400000*12).toISOString() },
      ]));
    }
  },

  getAdmins()             { return JSON.parse(localStorage.getItem('ems_admins') || '[]'); },
  getEmployees()          { return JSON.parse(localStorage.getItem('ems_employees') || '[]'); },
  saveEmployees(arr)      { localStorage.setItem('ems_employees', JSON.stringify(arr)); },

  // ── Activity log ──
  getActivity()           { return JSON.parse(localStorage.getItem('ems_activity') || '[]'); },
  logActivity(type, message) {
    const log = this.getActivity();
    log.unshift({ id: uid(), type, message, at: new Date().toISOString() });
    if (log.length > 50) log.length = 50; // cap history
    localStorage.setItem('ems_activity', JSON.stringify(log));
  },

  login(username, password) {
    const admin = this.getAdmins().find(a => a.username === username && a.password === password);
    if (!admin) return { error: 'Invalid credentials' };
    const token = btoa(JSON.stringify({ id: admin.id, username: admin.username, exp: Date.now() + 86400000 }));
    this.token = token;
    localStorage.setItem('ems_token', token);
    localStorage.setItem('ems_username', admin.username);
    this.logActivity('login', `${admin.username} signed in`);
    return { token, username: admin.username };
  },

  register(username, password) {
    const admins = this.getAdmins();
    if (admins.find(a => a.username === username)) return { error: 'Admin already exists' };
    admins.push({ username, password, id: uid() });
    localStorage.setItem('ems_admins', JSON.stringify(admins));
    return { message: 'Admin registered' };
  },

  getEmployeeList({ search='', department='', page=1, limit=10, sort='newest', minSalary=null, maxSalary=null }={}) {
    let emps = this.getEmployees();
    if (search) {
      const s = search.toLowerCase();
      emps = emps.filter(e => e.name.toLowerCase().includes(s) || e.employeeId.toLowerCase().includes(s) || e.email.toLowerCase().includes(s));
    }
    if (department) emps = emps.filter(e => e.department === department);
    if (minSalary != null) emps = emps.filter(e => e.salary >= minSalary);
    if (maxSalary != null) emps = emps.filter(e => e.salary <= maxSalary);
    if (sort === 'newest')      emps.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
    else if (sort === 'oldest') emps.sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
    else if (sort === 'name')   emps.sort((a,b) => a.name.localeCompare(b.name));
    else if (sort === 'salary-high') emps.sort((a,b) => b.salary-a.salary);
    else if (sort === 'salary-low')  emps.sort((a,b) => a.salary-b.salary);
    const total = emps.length;
    const start = (page-1)*limit;
    return { employees: emps.slice(start, start+limit), total, pages: Math.ceil(total/limit) };
  },

  addEmployee(data) {
    const emps = this.getEmployees();
    if (emps.find(e => e.employeeId === data.employeeId)) return { error: 'Employee ID already exists' };
    const emp = { ...data, _id: uid(), createdAt: new Date().toISOString() };
    emps.unshift(emp);
    this.saveEmployees(emps);
    this.logActivity('add', `Added ${emp.name} (${emp.employeeId}) to ${emp.department}`);
    return emp;
  },

  updateEmployee(id, data) {
    const emps = this.getEmployees();
    const idx = emps.findIndex(e => e._id === id);
    if (idx < 0) return { error: 'Not found' };
    const other = emps.find((e,i) => e.employeeId === data.employeeId && i !== idx);
    if (other) return { error: 'Employee ID already exists' };
    emps[idx] = { ...emps[idx], ...data };
    this.saveEmployees(emps);
    this.logActivity('edit', `Updated ${emps[idx].name} (${emps[idx].employeeId})`);
    return emps[idx];
  },

  deleteEmployee(id) {
    const emps = this.getEmployees();
    const target = emps.find(e => e._id === id);
    const remaining = emps.filter(e => e._id !== id);
    this.saveEmployees(remaining);
    if (target) this.logActivity('delete', `Removed ${target.name} (${target.employeeId})`);
    return { message: 'Deleted' };
  },

  bulkDeleteEmployees(ids) {
    const emps = this.getEmployees();
    const idSet = new Set(ids);
    const removed = emps.filter(e => idSet.has(e._id));
    const remaining = emps.filter(e => !idSet.has(e._id));
    this.saveEmployees(remaining);
    this.logActivity('delete', `Bulk removed ${removed.length} employee${removed.length!==1?'s':''}`);
    return { count: removed.length };
  },

  getStats() {
    const emps = this.getEmployees();
    const total = emps.length;
    const deptMap = {};
    emps.forEach(e => { deptMap[e.department] = (deptMap[e.department]||0)+1; });
    const byDept = Object.entries(deptMap).map(([_id,count]) => ({ _id, count }));
    const avgSalary = total ? emps.reduce((s,e)=>s+e.salary,0)/total : 0;
    const minSalary = total ? Math.min(...emps.map(e=>e.salary)) : 0;
    const maxSalary = total ? Math.max(...emps.map(e=>e.salary)) : 100000;
    const now = new Date();
    const thisMonth = emps.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    }).length;
    return { total, byDept, avgSalary, thisMonth, minSalary, maxSalary };
  }
};

function uid() { return Math.random().toString(36).slice(2)+Date.now().toString(36); }
function formatNum(n) { return n>=100000 ? (n/100000).toFixed(1)+'L' : n.toLocaleString('en-IN'); }

// ════════ CSV EXPORT ════════
function exportEmployeesCSV(employees, filename='employees.csv') {
  if (!employees.length) { showToast('No employees to export', 'error'); return; }
  const headers = ['Employee ID','Name','Email','Phone','Department','Designation','Salary','Joined'];
  const rows = employees.map(e => [
    e.employeeId, e.name, e.email, e.phone, e.department, e.designation, e.salary,
    new Date(e.createdAt).toLocaleDateString('en-IN')
  ]);
  const escape = v => `"${String(v).replace(/"/g,'""')}"`;
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${employees.length} employee${employees.length!==1?'s':''} to CSV`, 'success');
}

// ════════ ACTIVITY FEED ════════
const ACTIVITY_ICONS = {
  add:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  delete: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
  login:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>`
};
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff/60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins/60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs/24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { month:'short', day:'numeric' });
}
function renderActivityFeed(elId, limit=8) {
  const el = document.getElementById(elId);
  if (!el) return;
  const log = API.getActivity().slice(0, limit);
  if (!log.length) {
    el.innerHTML = `<div class="activity-empty">No activity yet</div>`;
    return;
  }
  el.innerHTML = log.map(item => `
    <div class="activity-row">
      <div class="activity-icon activity-${item.type}">${ACTIVITY_ICONS[item.type]||ACTIVITY_ICONS.edit}</div>
      <div class="activity-text">
        <div class="activity-msg">${item.message}</div>
        <div class="activity-time">${timeAgo(item.at)}</div>
      </div>
    </div>`).join('');
}

// ════════ AVATAR PHOTO (base64, localStorage) ════════
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function avatarMarkup(emp, sizeClass='emp-avatar') {
  const deptClass = `dept-${emp.department}`;
  const initials = emp.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  if (emp.photo) {
    return `<img src="${emp.photo}" class="${sizeClass} ${sizeClass}-photo" alt="${emp.name}"/>`;
  }
  return `<div class="${sizeClass} ${deptClass}">${initials}</div>`;
}

// ════════ THEME TOGGLE ════════
function initTheme() {
  const saved = localStorage.getItem('ems_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  // briefly suspend transitions site-wide so the CSS custom-property swap
  // (which drives background/color via var(--bg)/var(--text)) repaints
  // immediately instead of getting stuck on a stale computed value
  document.documentElement.classList.add('theme-switching');
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ems_theme', next);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-switching');
    });
  });
}
initTheme();

// ════════ DONUT CHART ════════
const DEPT_COLORS = {
  Engineering:'#2f6fed', Marketing:'#d4a23a', Sales:'#1fa97e', HR:'#6366f1',
  Finance:'#0ea5b8', Operations:'#64748b', Design:'#c2459a'
};
function renderDonut(svgId, legendId, byDept, total) {
  const svg = document.getElementById(svgId);
  const legend = document.getElementById(legendId);
  if (!svg) return;
  const r = 70, cx = 90, cy = 90, circumference = 2*Math.PI*r;
  let offset = 0;
  const sorted = [...byDept].sort((a,b)=>b.count-a.count);
  const segs = sorted.map((d) => {
    const color = DEPT_COLORS[d._id] || '#8590a8';
    const frac = total ? d.count/total : 0;
    const len = frac * circumference;
    const seg = `<circle class="donut-seg" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}"
      stroke-width="22" stroke-dasharray="${len} ${circumference-len}"
      stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})">
      <title>${d._id}: ${d.count} (${(frac*100).toFixed(0)}%)</title>
    </circle>`;
    offset += len;
    return seg;
  }).join('');
  svg.innerHTML = `
    ${segs}
    <text x="${cx}" y="${cy-4}" text-anchor="middle" class="donut-center-value">${total}</text>
    <text x="${cx}" y="${cy+16}" text-anchor="middle" class="donut-center-label">EMPLOYEES</text>`;
  // animate in: start collapsed, then expand
  svg.querySelectorAll('.donut-seg').forEach(el => {
    const full = el.getAttribute('stroke-dasharray');
    el.setAttribute('stroke-dasharray', `0 ${circumference}`);
    requestAnimationFrame(() => {
      setTimeout(() => { el.setAttribute('stroke-dasharray', full); }, 60);
    });
  });
  if (legend) {
    legend.innerHTML = sorted.map((d,i) => {
      const color = DEPT_COLORS[d._id] || '#8590a8';
      return `<div class="donut-legend-item" data-idx="${i}">
        <span class="donut-legend-dot" style="background:${color}"></span>
        ${d._id}<span class="donut-legend-count">${d.count}</span>
      </div>`;
    }).join('');
    const segEls = svg.querySelectorAll('.donut-seg');
    legend.querySelectorAll('.donut-legend-item').forEach(item => {
      const idx = +item.dataset.idx;
      item.addEventListener('mouseenter', () => { if (segEls[idx]) segEls[idx].style.filter = 'brightness(1.25)'; });
      item.addEventListener('mouseleave', () => { if (segEls[idx]) segEls[idx].style.filter = ''; });
    });
  }
}

// ════════ TOAST ════════
function showToast(msg, type='success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = {
    success:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1fa97e" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>`,
    error:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e5484d" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    info:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5b8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };
  t.innerHTML = `<div class="toast-icon">${icons[type]||icons.info}</div><div class="toast-msg">${msg}</div>`;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('toast-out'); setTimeout(()=>t.remove(), 300); }, 3000);
}

// ════════ MODAL HELPERS ════════
function openModal(id)  { document.getElementById(id).classList.add('open');    document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow=''; }

// close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });
  document.addEventListener('keydown', e => {
    if (e.key==='Escape') document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));
  });

  // inject keyboard HUD
  const hud = document.createElement('div');
  hud.className = 'kbd-hud'; hud.id = 'kbdHud';
  hud.innerHTML = `
    <div class="kbd-hint"><span class="kbd-key">/</span> Focus search</div>
    <div class="kbd-hint"><span class="kbd-key">N</span> Add employee</div>
    <div class="kbd-hint"><span class="kbd-key">Esc</span> Close modal</div>
    <div class="kbd-hint"><span class="kbd-key">?</span> Show shortcuts</div>`;
  document.body.appendChild(hud);

  let hudTimer;
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName||'').toLowerCase();
    const typing = tag==='input'||tag==='select'||tag==='textarea';
    if (e.key==='?' && !typing) {
      hud.classList.add('show');
      clearTimeout(hudTimer);
      hudTimer = setTimeout(() => hud.classList.remove('show'), 2500);
    }
  });
});

// ════════ SHARED SIDEBAR/TOPBAR ════════
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}
function handleLogout() {
  API.token = null;
  localStorage.removeItem('ems_token');
  localStorage.removeItem('ems_username');
  window.location.href = 'index.html';
}

// ════════ SHARED EMPLOYEE MODAL ════════
let editingId = null;
let deleteTarget = null;
let pendingPhoto = null; // data URL staged for the currently-open form, or null

async function handlePhotoSelect(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 1.5 * 1024 * 1024) {
    showToast('Image too large — please use a file under 1.5MB', 'error');
    input.value = '';
    return;
  }
  try {
    const dataUrl = await readFileAsDataURL(file);
    pendingPhoto = dataUrl;
    renderPhotoPreview();
  } catch (e) {
    showToast('Could not read that image', 'error');
  }
}
function clearPhotoField() {
  pendingPhoto = '';
  document.getElementById('fPhotoInput').value = '';
  renderPhotoPreview();
}
function renderPhotoPreview() {
  const wrap = document.getElementById('fPhotoPreview');
  const removeBtn = document.getElementById('fPhotoRemoveBtn');
  if (pendingPhoto) {
    wrap.innerHTML = `<img src="${pendingPhoto}" alt="Preview"/>`;
    removeBtn.style.display = '';
  } else {
    wrap.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
    removeBtn.style.display = 'none';
  }
}

function openAddModal() {
  editingId = null;
  pendingPhoto = null;
  document.getElementById('modalTitle').textContent = 'Add Employee';
  clearForm();
  openModal('empModal');
}

function openEditModal(id) {
  const emp = API.getEmployees().find(e=>e._id===id);
  if (!emp) return;
  editingId = id;
  pendingPhoto = emp.photo || null;
  document.getElementById('modalTitle').textContent = 'Edit Employee';
  document.getElementById('fId').value    = emp.employeeId;
  document.getElementById('fName').value  = emp.name;
  document.getElementById('fEmail').value = emp.email;
  document.getElementById('fPhone').value = emp.phone;
  document.getElementById('fDept').value  = emp.department;
  document.getElementById('fDesig').value = emp.designation;
  document.getElementById('fSalary').value= emp.salary;
  renderPhotoPreview();
  clearErrors();
  openModal('empModal');
}

function viewProfile(id) {
  const emp = API.getEmployees().find(e=>e._id===id);
  if (!emp) return;
  document.getElementById('profileBody').innerHTML = `
    <div class="profile-header">
      ${avatarMarkup(emp, 'profile-avatar')}
      <div>
        <div class="profile-name">${emp.name}</div>
        <div class="profile-role">${emp.designation} · ${emp.department}</div>
      </div>
    </div>
    <div class="profile-grid">
      <div class="profile-field"><div class="profile-field-label">Employee ID</div><div class="profile-field-value">${emp.employeeId}</div></div>
      <div class="profile-field"><div class="profile-field-label">Email</div><div class="profile-field-value">${emp.email}</div></div>
      <div class="profile-field"><div class="profile-field-label">Phone</div><div class="profile-field-value">${emp.phone}</div></div>
      <div class="profile-field"><div class="profile-field-label">Salary</div><div class="profile-field-value">₹${formatNum(emp.salary)}/mo</div></div>
      <div class="profile-field"><div class="profile-field-label">Department</div><div class="profile-field-value">${emp.department}</div></div>
      <div class="profile-field"><div class="profile-field-label">Joined</div><div class="profile-field-value">${new Date(emp.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}</div></div>
    </div>`;
  document.getElementById('editFromProfile').onclick = () => { closeModal('profileModal'); openEditModal(id); };
  openModal('profileModal');
}

function openDeleteModal(id, name) {
  deleteTarget = id;
  document.getElementById('deleteDesc').textContent = `Are you sure you want to remove ${name}? This action cannot be undone.`;
  document.getElementById('confirmDeleteBtn').onclick = () => confirmDelete();
  openModal('deleteModal');
}

function confirmDelete() {
  if (!deleteTarget) return;
  API.deleteEmployee(deleteTarget);
  closeModal('deleteModal');
  if (typeof loadEmployees === 'function') loadEmployees();
  if (typeof loadDashboard === 'function') loadDashboard();
  showToast('Employee deleted', 'error');
}

function saveEmployee() {
  if (!validateForm()) return;
  const data = {
    employeeId:  document.getElementById('fId').value.trim(),
    name:        document.getElementById('fName').value.trim(),
    email:       document.getElementById('fEmail').value.trim(),
    phone:       document.getElementById('fPhone').value.trim(),
    department:  document.getElementById('fDept').value,
    designation: document.getElementById('fDesig').value.trim(),
    salary:      Number(document.getElementById('fSalary').value),
    photo:       pendingPhoto || '',
  };
  const res = editingId ? API.updateEmployee(editingId, data) : API.addEmployee(data);
  if (res.error) { showToast(res.error, 'error'); return; }
  closeModal('empModal');
  if (typeof loadEmployees === 'function') loadEmployees();
  if (typeof loadDashboard === 'function') loadDashboard();
  showToast(editingId ? 'Employee updated!' : 'Employee added!', 'success');
}

function validateForm() {
  clearErrors();
  let ok = true;
  const rules = [
    ['fId','fIdErr','Employee ID is required'],
    ['fName','fNameErr','Name is required'],
    ['fEmail','fEmailErr','Email is required'],
    ['fPhone','fPhoneErr','Phone is required'],
    ['fDept','fDeptErr','Department is required'],
    ['fDesig','fDesigErr','Designation is required'],
    ['fSalary','fSalaryErr','Salary is required'],
  ];
  rules.forEach(([fId,eId,msg]) => {
    const el = document.getElementById(fId);
    if (!el.value.trim()) {
      document.getElementById(eId).textContent = msg;
      el.classList.add('error'); ok = false;
    }
  });
  const email = document.getElementById('fEmail');
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    document.getElementById('fEmailErr').textContent = 'Invalid email address';
    email.classList.add('error'); ok = false;
  }
  return ok;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(e=>e.textContent='');
  document.querySelectorAll('#empModal input, #empModal select').forEach(e=>e.classList.remove('error'));
}

function clearForm() {
  ['fId','fName','fEmail','fPhone','fDesig','fSalary'].forEach(id => document.getElementById(id).value='');
  document.getElementById('fDept').value = '';
  pendingPhoto = null;
  renderPhotoPreview();
  clearErrors();
}

// ════════ SHARED SIDEBAR INIT ════════
function initSidebar(activePage) {
  const username = localStorage.getItem('ems_username') || 'Admin';
  document.getElementById('adminName').textContent = username;
  document.getElementById('adminAvatar').textContent = username.charAt(0).toUpperCase();
  // highlight active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === activePage) item.classList.add('active');
  });
  // nav badge
  const stats = API.getStats();
  const badge = document.getElementById('navBadge');
  if (badge) badge.textContent = stats.total;
}
