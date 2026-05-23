// Plan Forge — renderer logic.
// Single-page app with view switching, opinionated planning hierarchy:
//   Project → Business Requirement → Requirement
//                                    ↘
//                       Workstream → Epic → Story → Acceptance Criteria
//                                                  ↘
//                                              Decision Log
//
// State is held in memory and persisted on every change (debounced) to
// the JSON workspace file via the main process.

'use strict';

// ============================================================ Constants

const STATUS_VALUES = ['Not Started', 'In Progress', 'Blocked', 'Ready for Dev', 'In Dev', 'In Test', 'Done'];
const PRIORITY_VALUES = ['', 'P0', 'P1', 'P2', 'P3'];
const LAUNCH_VALUES = ['', 'Beta', 'Full Launch', 'Post-Launch', 'TBD'];
const DECISION_STATUSES = ['Open', 'Decided', 'Deferred', 'Escalated'];
const SEVERITY_VALUES = ['', 'Critical', 'High', 'Medium', 'Low'];

// ============================================================ State

const state = {
  workspace: null,        // full workspace document
  view: 'dashboard',      // current view name
  search: '',             // current search term
  selection: null,        // selected entity id within current view
  saveTimer: null,
};

// Helpers to fetch the active project & its entities
function project() {
  if (!state.workspace || !state.workspace.activeProjectId) return null;
  return state.workspace.projects.find(p => p.id === state.workspace.activeProjectId) || null;
}

// ============================================================ Persistence

async function loadWorkspace() {
  const ws = await window.api.loadWorkspace();
  // Ensure required structure
  if (!ws.projects) ws.projects = [];
  if (!ws.schemaVersion) ws.schemaVersion = 1;
  // Normalize each project
  for (const p of ws.projects) normalizeProject(p);
  state.workspace = ws;
  const wsPath = await window.api.workspacePath();
  const el = document.getElementById('workspacePath');
  if (el) { el.textContent = wsPath; el.title = wsPath; }
}

function normalizeProject(p) {
  p.businessRequirements ||= [];
  p.requirements ||= [];
  p.workstreams ||= [];
  p.epics ||= [];
  p.stories ||= [];
  p.decisions ||= [];
  // Migrate any stories missing acceptanceCriteria
  for (const s of p.stories) {
    s.acceptanceCriteria ||= [];
    s.requirementIds ||= [];
    for (const ac of s.acceptanceCriteria) {
      ac.given ||= '';
      ac.when ||= '';
      ac.then ||= '';
      ac.and ||= '';
    }
  }
  for (const r of p.requirements) r.businessRequirementId ||= null;
  for (const e of p.epics) e.workstreamId ||= null;
  for (const s of p.stories) {
    s.epicId ||= null;
    s.status ||= 'Not Started';
    s.priority ||= '';
    s.launchTiming ||= '';
    s.notes ||= '';
    s.requirementIds ||= [];
  }
  for (const d of p.decisions) {
    d.status ||= 'Open';
    d.affectedStoryIds ||= [];
    d.affectedRequirementIds ||= [];
  }
}

function persist() {
  if (state.saveTimer) clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(async () => {
    try {
      await window.api.saveWorkspace(state.workspace);
    } catch (e) {
      toast('Save failed: ' + e.message, 'error');
    }
  }, 200);
}

// ============================================================ Utilities

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nextCode(items, prefix) {
  // Find next sequence number for codes like ST-001, EP-001
  let max = 0;
  for (const it of items) {
    const m = (it.code || '').match(new RegExp(`^${prefix}-(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) node.setAttribute(k, v);
  }
  for (const c of (Array.isArray(children) ? children : [children])) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function matchesSearch(text, q) {
  if (!q) return true;
  const t = String(text || '').toLowerCase();
  return t.includes(q.toLowerCase());
}

// ============================================================ Toast

function toast(msg, kind = '') {
  const host = document.getElementById('toastHost');
  const node = el('div', { class: 'toast ' + kind }, msg);
  host.appendChild(node);
  requestAnimationFrame(() => node.classList.add('show'));
  setTimeout(() => {
    node.classList.remove('show');
    setTimeout(() => node.remove(), 250);
  }, 2200);
}

// ============================================================ Modal

function openModal(title, bodyNode, primaryLabel, onPrimary, opts = {}) {
  const host = document.getElementById('modalHost');
  host.innerHTML = '';
  const closeBtn = el('button', { class: 'btn btn-ghost', onclick: closeModal }, opts.cancelLabel || 'Cancel');
  const primaryBtn = el('button', { class: 'btn', onclick: async () => {
    try {
      const r = onPrimary?.();
      if (r instanceof Promise) await r;
      closeModal();
    } catch (e) {
      toast(e.message || String(e), 'error');
    }
  }}, primaryLabel || 'Save');
  const modal = el('div', { class: 'modal' }, [
    el('h2', {}, title),
    bodyNode,
    el('div', { class: 'modal-actions' }, [
      opts.hideCancel ? null : closeBtn,
      primaryBtn,
    ]),
  ]);
  host.appendChild(modal);
  host.classList.add('open');
  setTimeout(() => {
    const first = modal.querySelector('input, textarea, select, button');
    if (first) first.focus();
  }, 30);
}

function closeModal() {
  const host = document.getElementById('modalHost');
  host.classList.remove('open');
  host.innerHTML = '';
}

// ============================================================ Project picker

function renderProjectPicker() {
  const host = document.getElementById('projectPicker');
  host.innerHTML = '';
  const select = el('select');
  if (state.workspace.projects.length === 0) {
    select.appendChild(el('option', { value: '' }, '— no projects yet —'));
    select.disabled = true;
  } else {
    for (const p of state.workspace.projects) {
      const opt = el('option', { value: p.id }, p.name);
      if (p.id === state.workspace.activeProjectId) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', () => {
      state.workspace.activeProjectId = select.value;
      persist();
      render();
    });
  }
  host.appendChild(select);
}

// ============================================================ Navigation

function setView(name) {
  state.view = name;
  state.selection = null;
  state.search = '';
  render();
}

function renderNav() {
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === state.view);
    b.onclick = () => setView(b.dataset.view);
  });
  const p = project();
  setCount('br',    p ? p.businessRequirements.length : 0);
  setCount('req',   p ? p.requirements.length : 0);
  setCount('ws',    p ? p.workstreams.length : 0);
  setCount('epic',  p ? p.epics.length : 0);
  setCount('story', p ? p.stories.length : 0);
  setCount('dec',   p ? p.decisions.filter(d => d.status === 'Open').length : 0);
}

function setCount(key, n) {
  const el = document.getElementById('count-' + key);
  if (el) el.textContent = n > 0 ? String(n) : '';
}

// ============================================================ Render dispatch

function render() {
  renderProjectPicker();
  renderNav();
  const content = document.getElementById('content');
  content.innerHTML = '';

  if (state.workspace.projects.length === 0) {
    content.appendChild(renderWelcome());
    return;
  }

  if (!project()) {
    // No active project but projects exist: pick the first one
    state.workspace.activeProjectId = state.workspace.projects[0].id;
    persist();
  }

  const view = state.view;
  let node;
  switch (view) {
    case 'dashboard':            node = renderDashboard(); break;
    case 'businessRequirements': node = renderBusinessRequirements(); break;
    case 'requirements':         node = renderRequirements(); break;
    case 'workstreams':          node = renderWorkstreams(); break;
    case 'epics':                node = renderEpics(); break;
    case 'stories':              node = renderStoriesOrDetail(); break;
    case 'decisions':            node = renderDecisions(); break;
    case 'coverage':             node = renderCoverage(); break;
    default:                     node = renderDashboard();
  }
  content.appendChild(node);
}

// ============================================================ Welcome / first-run

function renderWelcome() {
  return el('div', { class: 'view' }, [
    el('div', { class: 'empty' }, [
      el('h2', {}, 'Welcome to Plan Forge'),
      el('p', {}, 'An opinionated workspace for breaking down planning work: Business Requirements → Requirements → Workstreams → Epics → Stories with Acceptance Criteria, plus a Decision Log and Coverage view.'),
      el('p', {}, 'Create your first project to get started.'),
      el('div', { class: 'row-end', style: 'justify-content:center; margin-top: 16px;' }, [
        el('button', { class: 'btn', onclick: () => promptNewProject() }, '+ New Project'),
        el('button', { class: 'btn btn-ghost', onclick: () => importXlsxAsProject() }, 'Import from Excel'),
      ]),
    ]),
  ]);
}

// ============================================================ Dashboard

function renderDashboard() {
  const p = project();
  const stories = p.stories;
  const completed = stories.filter(s => s.status === 'Done').length;
  const inProgress = stories.filter(s => s.status === 'In Progress' || s.status === 'In Dev' || s.status === 'In Test' || s.status === 'Ready for Dev').length;
  const blocked = stories.filter(s => s.status === 'Blocked').length;
  const openDec = p.decisions.filter(d => d.status === 'Open').length;
  const reqCovered = p.requirements.filter(r => stories.some(s => s.requirementIds.includes(r.id))).length;
  const reqCoverage = p.requirements.length === 0 ? 100 : Math.round(reqCovered / p.requirements.length * 100);
  const notReadyStories = stories.filter(s => !storyMeetsDoR(p, s));

  const view = el('div', { class: 'view' });
  view.appendChild(el('div', { class: 'view-header' }, [
    el('div', { class: 'view-title' }, [
      el('h1', {}, p.name),
      el('p', {}, p.description || 'No description yet.'),
    ]),
    el('div', { class: 'view-actions' }, [
      el('button', { class: 'btn btn-ghost btn-sm', onclick: () => promptEditProject(p) }, 'Edit project'),
      el('button', { class: 'btn btn-ghost btn-sm', onclick: () => deleteActiveProject() }, 'Delete project'),
    ]),
  ]));

  view.appendChild(el('div', { class: 'help-block' }, [
    el('div', {}, [
      el('strong', {}, 'Hierarchy: '),
      'Project → Business Requirement → Requirement → linked to → Story (inside an Epic, inside a Workstream) → Acceptance Criteria. Decisions live alongside and link to any of the above.',
    ]),
    el('div', { style: 'margin-top:6px;' }, [
      el('strong', {}, 'Definition of Ready: '),
      'A story can enter dev when (1) it has ≥2 ACs, (2) it links to ≥1 requirement, (3) it has no open decisions, and (4) it has an epic assigned.',
    ]),
  ]));

  const kpis = el('div', { class: 'kpi-grid' }, [
    kpi('Business Reqs', p.businessRequirements.length),
    kpi('Requirements',  p.requirements.length, `${reqCovered} covered by ≥1 story`),
    kpi('Workstreams',   p.workstreams.length),
    kpi('Epics',         p.epics.length),
    kpi('Stories',       stories.length, `${completed} done · ${inProgress} active · ${blocked} blocked`),
    kpi('Open Decisions', openDec, openDec === 0 ? 'No open decisions ✓' : 'Review weekly'),
    kpi('Coverage',      reqCoverage + '%', `${p.requirements.length - reqCovered} requirements with no story`),
    kpi('Not Ready',     notReadyStories.length, notReadyStories.length === 0 ? 'All stories meet DoR ✓' : 'Stories failing Definition of Ready'),
  ]);
  view.appendChild(kpis);

  // Drilldowns
  view.appendChild(el('h2', { style: 'margin: 18px 0 8px; font-size: 14px;' }, 'Stories failing Definition of Ready'));
  const dorPanel = el('div', { class: 'panel' });
  if (notReadyStories.length === 0) {
    dorPanel.appendChild(el('div', { class: 'empty', style: 'padding:30px;' }, 'All stories meet DoR. 🎯'));
  } else {
    const t = el('table', { class: 'table' });
    const head = el('thead', {}, el('tr', {}, [
      el('th', { style: 'width: 110px' }, 'Code'),
      el('th', {}, 'Story'),
      el('th', { style: 'width: 220px' }, 'Why not ready'),
      el('th', { style: 'width: 110px' }, 'Status'),
    ]));
    t.appendChild(head);
    const tb = el('tbody');
    for (const s of notReadyStories.slice(0, 20)) {
      tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: () => openStory(s.id) }, [
        el('td', { class: 'id-col' }, s.code || ''),
        el('td', {}, s.title),
        el('td', {}, dorReasons(p, s).join(' · ')),
        el('td', {}, el('span', { class: 'pill' }, s.status)),
      ]));
    }
    t.appendChild(tb);
    dorPanel.appendChild(t);
  }
  view.appendChild(dorPanel);

  // Recent decisions
  view.appendChild(el('h2', { style: 'margin: 18px 0 8px; font-size: 14px;' }, 'Open Decisions'));
  const decPanel = el('div', { class: 'panel' });
  const openDecisions = p.decisions.filter(d => d.status === 'Open');
  if (openDecisions.length === 0) {
    decPanel.appendChild(el('div', { class: 'empty', style: 'padding:30px;' }, 'No open decisions.'));
  } else {
    const t = el('table', { class: 'table' });
    t.appendChild(el('thead', {}, el('tr', {}, [
      el('th', { style: 'width: 100px' }, 'ID'),
      el('th', {}, 'Question'),
      el('th', { style: 'width: 150px' }, 'Owner'),
      el('th', { style: 'width: 110px' }, 'Due'),
    ])));
    const tb = el('tbody');
    for (const d of openDecisions.slice(0, 15)) {
      tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: () => { setView('decisions'); state.selection = d.id; render(); } }, [
        el('td', { class: 'id-col' }, d.code || ''),
        el('td', {}, d.question || ''),
        el('td', {}, d.owner || ''),
        el('td', {}, d.dueDate || ''),
      ]));
    }
    t.appendChild(tb);
    decPanel.appendChild(t);
  }
  view.appendChild(decPanel);

  return view;
}

function kpi(label, value, sub) {
  return el('div', { class: 'kpi' }, [
    el('div', { class: 'kpi-label' }, label),
    el('div', { class: 'kpi-value' }, String(value)),
    sub ? el('div', { class: 'kpi-sub' }, sub) : null,
  ]);
}

// ============================================================ Business Requirements

function renderBusinessRequirements() {
  const p = project();
  const view = el('div', { class: 'view' });
  view.appendChild(viewHeader('Business Requirements',
    'Top-level decisions / source documents that drive everything else. One row per source-doc topic or business decision.',
    [
      searchInput('Search…'),
      el('button', { class: 'btn', onclick: () => addBusinessRequirement() }, '+ Add'),
    ]));

  view.appendChild(el('div', { class: 'help-block' }, [
    el('strong', {}, 'Tip: '), 'Use the Code field (e.g., ',
    el('span', { class: 'mono' }, 'BR-CRED-1'),
    ') to match how your source docs ID things. Description should be a single tight sentence — full prose lives in the linked source.',
  ]));

  const filtered = p.businessRequirements.filter(b =>
    matchesSearch(b.code + ' ' + b.title + ' ' + b.description, state.search));

  const panel = el('div', { class: 'panel' });
  if (filtered.length === 0) {
    panel.appendChild(emptyState('No business requirements yet', 'Add one to get started.'));
  } else {
    const t = el('table', { class: 'table' });
    t.appendChild(el('thead', {}, el('tr', {}, [
      el('th', { style: 'width: 130px' }, 'Code'),
      el('th', { style: 'width: 26%' }, 'Title'),
      el('th', {}, 'Description'),
      el('th', { style: 'width: 140px' }, 'Source Doc'),
      el('th', { style: 'width: 80px' }, '# Reqs'),
      el('th', { class: 'col-actions', style: 'width: 80px' }, ''),
    ])));
    const tb = el('tbody');
    for (const b of filtered) {
      const reqCount = p.requirements.filter(r => r.businessRequirementId === b.id).length;
      tb.appendChild(el('tr', {}, [
        editableCell(b, 'code', { mono: true }),
        editableCell(b, 'title'),
        editableCell(b, 'description', { textarea: true }),
        editableCell(b, 'sourceDoc'),
        el('td', {}, String(reqCount)),
        el('td', { class: 'col-actions' }, [
          el('button', { class: 'btn btn-icon', title: 'Delete', onclick: () => deleteBusinessRequirement(b.id) }, '✕'),
        ]),
      ]));
    }
    t.appendChild(tb);
    panel.appendChild(t);
  }
  view.appendChild(panel);
  return view;
}

function addBusinessRequirement() {
  const p = project();
  p.businessRequirements.push({
    id: uid('br'),
    code: nextCode(p.businessRequirements, 'BR'),
    title: '',
    description: '',
    sourceDoc: '',
  });
  persist();
  render();
}

function deleteBusinessRequirement(id) {
  const p = project();
  p.businessRequirements = p.businessRequirements.filter(b => b.id !== id);
  // Unlink any requirements
  for (const r of p.requirements) if (r.businessRequirementId === id) r.businessRequirementId = null;
  persist();
  render();
}

// ============================================================ Requirements

function renderRequirements() {
  const p = project();
  const view = el('div', { class: 'view' });
  view.appendChild(viewHeader('Requirements',
    'Granular rules / requirements. Each one ties up to a Business Requirement and gets implemented by ≥1 Story.',
    [
      searchInput('Search…'),
      el('button', { class: 'btn', onclick: () => addRequirement() }, '+ Add'),
    ]));

  const brOptions = ['— unassigned —', ...p.businessRequirements.map(b => `${b.code} · ${b.title}`)];
  const brIds = ['', ...p.businessRequirements.map(b => b.id)];

  const filtered = p.requirements.filter(r =>
    matchesSearch(r.code + ' ' + r.title + ' ' + r.description, state.search));

  const panel = el('div', { class: 'panel' });
  if (filtered.length === 0) {
    panel.appendChild(emptyState('No requirements yet', 'Add one to get started.'));
  } else {
    const t = el('table', { class: 'table' });
    t.appendChild(el('thead', {}, el('tr', {}, [
      el('th', { style: 'width: 120px' }, 'Code'),
      el('th', { style: 'width: 24%' }, 'Title'),
      el('th', {}, 'Description'),
      el('th', { style: 'width: 180px' }, 'Business Requirement'),
      el('th', { style: 'width: 80px' }, '# Stories'),
      el('th', { class: 'col-actions', style: 'width: 80px' }, ''),
    ])));
    const tb = el('tbody');
    for (const r of filtered) {
      const storyCount = p.stories.filter(s => s.requirementIds.includes(r.id)).length;
      tb.appendChild(el('tr', {}, [
        editableCell(r, 'code', { mono: true }),
        editableCell(r, 'title'),
        editableCell(r, 'description', { textarea: true }),
        editableSelectCell(r, 'businessRequirementId', brIds, brOptions),
        el('td', {}, String(storyCount)),
        el('td', { class: 'col-actions' }, [
          el('button', { class: 'btn btn-icon', title: 'Delete', onclick: () => deleteRequirement(r.id) }, '✕'),
        ]),
      ]));
    }
    t.appendChild(tb);
    panel.appendChild(t);
  }
  view.appendChild(panel);
  return view;
}

function addRequirement() {
  const p = project();
  p.requirements.push({
    id: uid('rq'),
    code: nextCode(p.requirements, 'REQ'),
    title: '',
    description: '',
    businessRequirementId: null,
  });
  persist();
  render();
}

function deleteRequirement(id) {
  const p = project();
  p.requirements = p.requirements.filter(r => r.id !== id);
  for (const s of p.stories) s.requirementIds = (s.requirementIds || []).filter(rid => rid !== id);
  for (const d of p.decisions) d.affectedRequirementIds = (d.affectedRequirementIds || []).filter(rid => rid !== id);
  persist();
  render();
}

// ============================================================ Workstreams

function renderWorkstreams() {
  const p = project();
  const view = el('div', { class: 'view' });
  view.appendChild(viewHeader('Workstreams',
    'Engineering domains or teams that own delivery. Epics live inside Workstreams.',
    [
      searchInput('Search…'),
      el('button', { class: 'btn', onclick: () => addWorkstream() }, '+ Add'),
    ]));

  const filtered = p.workstreams.filter(w =>
    matchesSearch(w.code + ' ' + w.name + ' ' + w.description, state.search));

  const panel = el('div', { class: 'panel' });
  if (filtered.length === 0) {
    panel.appendChild(emptyState('No workstreams yet', 'Add one to start organising work.'));
  } else {
    const t = el('table', { class: 'table' });
    t.appendChild(el('thead', {}, el('tr', {}, [
      el('th', { style: 'width: 100px' }, 'Code'),
      el('th', { style: 'width: 22%' }, 'Name'),
      el('th', {}, 'Description'),
      el('th', { style: 'width: 70px' }, '# Epics'),
      el('th', { style: 'width: 70px' }, '# Stories'),
      el('th', { class: 'col-actions', style: 'width: 80px' }, ''),
    ])));
    const tb = el('tbody');
    for (const w of filtered) {
      const epicCount = p.epics.filter(e => e.workstreamId === w.id).length;
      const storyCount = p.stories.filter(s => {
        const epic = p.epics.find(e => e.id === s.epicId);
        return epic && epic.workstreamId === w.id;
      }).length;
      tb.appendChild(el('tr', {}, [
        editableCell(w, 'code', { mono: true }),
        editableCell(w, 'name'),
        editableCell(w, 'description', { textarea: true }),
        el('td', {}, String(epicCount)),
        el('td', {}, String(storyCount)),
        el('td', { class: 'col-actions' }, [
          el('button', { class: 'btn btn-icon', title: 'Delete', onclick: () => deleteWorkstream(w.id) }, '✕'),
        ]),
      ]));
    }
    t.appendChild(tb);
    panel.appendChild(t);
  }
  view.appendChild(panel);
  return view;
}

function addWorkstream() {
  const p = project();
  p.workstreams.push({
    id: uid('ws'),
    code: nextCode(p.workstreams, 'WS'),
    name: '',
    description: '',
  });
  persist();
  render();
}

function deleteWorkstream(id) {
  const p = project();
  p.workstreams = p.workstreams.filter(w => w.id !== id);
  // Orphan epics under it
  for (const e of p.epics) if (e.workstreamId === id) e.workstreamId = null;
  persist();
  render();
}

// ============================================================ Epics

function renderEpics() {
  const p = project();
  const view = el('div', { class: 'view' });
  view.appendChild(viewHeader('Epics',
    'Coherent capabilities inside a workstream. An epic groups related stories.',
    [
      searchInput('Search…'),
      el('button', { class: 'btn', onclick: () => addEpic() }, '+ Add'),
    ]));

  const wsOptions = ['— unassigned —', ...p.workstreams.map(w => `${w.code} · ${w.name}`)];
  const wsIds = ['', ...p.workstreams.map(w => w.id)];

  const filtered = p.epics.filter(e =>
    matchesSearch(e.code + ' ' + e.name + ' ' + e.description, state.search));

  const panel = el('div', { class: 'panel' });
  if (filtered.length === 0) {
    panel.appendChild(emptyState('No epics yet', 'Add one to start grouping stories.'));
  } else {
    const t = el('table', { class: 'table' });
    t.appendChild(el('thead', {}, el('tr', {}, [
      el('th', { style: 'width: 110px' }, 'Code'),
      el('th', { style: 'width: 22%' }, 'Name'),
      el('th', {}, 'Description'),
      el('th', { style: 'width: 180px' }, 'Workstream'),
      el('th', { style: 'width: 120px' }, 'Status'),
      el('th', { style: 'width: 70px' }, '# Stories'),
      el('th', { class: 'col-actions', style: 'width: 80px' }, ''),
    ])));
    const tb = el('tbody');
    for (const e of filtered) {
      const storyCount = p.stories.filter(s => s.epicId === e.id).length;
      tb.appendChild(el('tr', {}, [
        editableCell(e, 'code', { mono: true }),
        editableCell(e, 'name'),
        editableCell(e, 'description', { textarea: true }),
        editableSelectCell(e, 'workstreamId', wsIds, wsOptions),
        editableSelectCell(e, 'status', STATUS_VALUES, STATUS_VALUES),
        el('td', {}, String(storyCount)),
        el('td', { class: 'col-actions' }, [
          el('button', { class: 'btn btn-icon', title: 'Delete', onclick: () => deleteEpic(e.id) }, '✕'),
        ]),
      ]));
    }
    t.appendChild(tb);
    panel.appendChild(t);
  }
  view.appendChild(panel);
  return view;
}

function addEpic() {
  const p = project();
  p.epics.push({
    id: uid('ep'),
    code: nextCode(p.epics, 'EP'),
    name: '',
    description: '',
    workstreamId: null,
    status: 'Not Started',
  });
  persist();
  render();
}

function deleteEpic(id) {
  const p = project();
  p.epics = p.epics.filter(e => e.id !== id);
  for (const s of p.stories) if (s.epicId === id) s.epicId = null;
  persist();
  render();
}

// ============================================================ Stories (list + detail)

function renderStoriesOrDetail() {
  if (state.selection) {
    const p = project();
    const story = p.stories.find(s => s.id === state.selection);
    if (story) return renderStoryDetail(story);
    state.selection = null;
  }
  return renderStoriesList();
}

function renderStoriesList() {
  const p = project();
  const view = el('div', { class: 'view' });
  view.appendChild(viewHeader('Stories',
    'The unit of work. Each story belongs to an Epic, satisfies ≥1 Requirement, and ships with Acceptance Criteria. Click any row to open the detail editor.',
    [
      searchInput('Search title, code, status…'),
      el('button', { class: 'btn', onclick: () => addStory() }, '+ Add'),
    ]));

  const filtered = p.stories.filter(s =>
    matchesSearch(s.code + ' ' + s.title + ' ' + s.status + ' ' + s.priority, state.search));

  const panel = el('div', { class: 'panel' });
  if (filtered.length === 0) {
    panel.appendChild(emptyState('No stories yet', 'Add one and start writing acceptance criteria.'));
  } else {
    const t = el('table', { class: 'table' });
    t.appendChild(el('thead', {}, el('tr', {}, [
      el('th', { style: 'width: 50px' }, 'DoR'),
      el('th', { style: 'width: 100px' }, 'Code'),
      el('th', {}, 'Title'),
      el('th', { style: 'width: 170px' }, 'Epic'),
      el('th', { style: 'width: 120px' }, 'Status'),
      el('th', { style: 'width: 70px' }, 'Pri'),
      el('th', { style: 'width: 60px' }, 'AC'),
      el('th', { style: 'width: 60px' }, 'Reqs'),
      el('th', { class: 'col-actions', style: 'width: 60px' }, ''),
    ])));
    const tb = el('tbody');
    for (const s of filtered) {
      const epic = p.epics.find(e => e.id === s.epicId);
      const dor = storyMeetsDoR(p, s);
      tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: (ev) => {
        if (ev.target.closest('button')) return;
        openStory(s.id);
      } }, [
        el('td', {}, dor ? el('span', { class: 'dor-good', title: 'Meets Definition of Ready' }, '●') : el('span', { class: 'dor-warn', title: dorReasons(p, s).join(' · ') }, '◐')),
        el('td', { class: 'id-col' }, s.code || ''),
        el('td', {}, s.title || el('span', { class: 'muted' }, '(untitled)')),
        el('td', {}, epic ? `${epic.code} · ${epic.name}` : el('span', { class: 'muted' }, '— unassigned —')),
        el('td', {}, el('span', { class: 'pill ' + statusPillClass(s.status) }, s.status)),
        el('td', {}, s.priority || ''),
        el('td', {}, String(s.acceptanceCriteria.length)),
        el('td', {}, String(s.requirementIds.length)),
        el('td', { class: 'col-actions' }, [
          el('button', { class: 'btn btn-icon', title: 'Delete story', onclick: () => deleteStory(s.id) }, '✕'),
        ]),
      ]));
    }
    t.appendChild(tb);
    panel.appendChild(t);
  }
  view.appendChild(panel);
  return view;
}

function statusPillClass(s) {
  if (s === 'Done') return 'good';
  if (s === 'Blocked') return 'bad';
  if (s === 'In Progress' || s === 'Ready for Dev' || s === 'In Dev' || s === 'In Test') return 'info';
  return '';
}

function renderStoryDetail(story) {
  const p = project();
  const view = el('div', { class: 'view' });

  // Header with breadcrumb
  view.appendChild(el('div', { class: 'view-header' }, [
    el('div', { class: 'view-title' }, [
      el('div', { class: 'muted', style: 'font-size:12px; margin-bottom:4px;' }, [
        el('a', { href: '#', style: 'color: inherit; text-decoration: underline;', onclick: (ev) => { ev.preventDefault(); state.selection = null; render(); } }, '← Stories'),
      ]),
      el('h1', {}, `${story.code || ''}  ${story.title || '(untitled story)'}`),
    ]),
    el('div', { class: 'view-actions' }, [
      el('button', { class: 'btn btn-ghost btn-sm', onclick: () => { state.selection = null; render(); } }, 'Close'),
    ]),
  ]));

  const dor = storyMeetsDoR(p, story);
  view.appendChild(el('div', { class: 'dor-banner ' + (dor ? 'good' : 'warn') },
    dor
      ? '● Definition of Ready met — this story can enter a sprint.'
      : '◐ Definition of Ready not met: ' + dorReasons(p, story).join(' · ')));

  const layout = el('div', { class: 'detail' });

  // ---- Main column
  const main = el('div', { class: 'main' });

  // Title / description / notes
  const formPanel = el('div', { class: 'panel', style: 'padding: 16px;' });
  formPanel.appendChild(field('Code', textInput(story, 'code')));
  formPanel.appendChild(field('Title', textInput(story, 'title')));
  formPanel.appendChild(field('Description', textarea(story, 'description', 3)));
  formPanel.appendChild(field('Notes / Open Questions', textarea(story, 'notes', 2)));
  main.appendChild(formPanel);

  // Acceptance Criteria
  const acPanel = el('div', { class: 'panel', style: 'padding: 16px;' });
  acPanel.appendChild(el('div', { class: 'row', style: 'margin-bottom: 12px;' }, [
    el('div', { style: 'font-weight: 600;' }, 'Acceptance Criteria'),
    el('div', { class: 'muted', style: 'font-size: 12px;' }, '(Given / When / Then. Each AC is one testable assertion.)'),
    el('div', { class: 'spacer' }),
    el('button', { class: 'btn btn-sm', onclick: () => addAC(story) }, '+ Add AC'),
  ]));

  const acList = el('div', { class: 'ac-list' });
  if (story.acceptanceCriteria.length === 0) {
    acList.appendChild(el('div', { class: 'muted', style: 'padding: 8px;' }, 'No ACs yet. Add at least 2 to meet Definition of Ready.'));
  } else {
    story.acceptanceCriteria.forEach((ac, i) => acList.appendChild(renderACCard(story, ac, i)));
  }
  acPanel.appendChild(acList);
  main.appendChild(acPanel);

  layout.appendChild(main);

  // ---- Side column
  const side = el('div', { class: 'side' });

  const meta = el('div', { class: 'panel' });
  meta.appendChild(field('Epic', selectInput(story, 'epicId',
    ['', ...p.epics.map(e => e.id)],
    ['— unassigned —', ...p.epics.map(e => `${e.code} · ${e.name}`)])));
  meta.appendChild(field('Status', selectInput(story, 'status', STATUS_VALUES, STATUS_VALUES)));
  meta.appendChild(field('Priority', selectInput(story, 'priority', PRIORITY_VALUES, PRIORITY_VALUES.map(v => v || '— none —'))));
  meta.appendChild(field('Launch Timing', selectInput(story, 'launchTiming', LAUNCH_VALUES, LAUNCH_VALUES.map(v => v || '— none —'))));
  side.appendChild(meta);

  // Linked requirements
  const reqPanel = el('div', { class: 'panel' });
  reqPanel.appendChild(el('div', { style: 'font-weight: 600; margin-bottom: 8px;' }, 'Linked Requirements'));
  reqPanel.appendChild(renderLinkedRequirements(story));
  side.appendChild(reqPanel);

  // Linked decisions
  const decPanel = el('div', { class: 'panel' });
  decPanel.appendChild(el('div', { style: 'font-weight: 600; margin-bottom: 8px;' }, 'Linked Decisions'));
  decPanel.appendChild(renderLinkedDecisions(story));
  side.appendChild(decPanel);

  layout.appendChild(side);

  view.appendChild(layout);
  return view;
}

function renderACCard(story, ac, idx) {
  const card = el('div', { class: 'ac-card' });
  card.appendChild(el('div', { class: 'ac-card-head' }, [
    el('strong', {}, 'AC-' + String(idx + 1)),
    el('div', { class: 'row' }, [
      el('button', { class: 'btn btn-icon', title: 'Move up', onclick: () => moveAC(story, idx, -1) }, '↑'),
      el('button', { class: 'btn btn-icon', title: 'Move down', onclick: () => moveAC(story, idx, 1) }, '↓'),
      el('button', { class: 'btn btn-icon', title: 'Delete', onclick: () => removeAC(story, idx) }, '✕'),
    ]),
  ]));
  card.appendChild(acRow('GIVEN',  ac, 'given'));
  card.appendChild(acRow('WHEN',   ac, 'when'));
  card.appendChild(acRow('THEN',   ac, 'then'));
  card.appendChild(acRow('AND',    ac, 'and'));
  return card;
}

function acRow(label, ac, key) {
  return el('div', { class: 'ac-row' }, [
    el('label', {}, label),
    el('textarea', {
      placeholder: label === 'GIVEN' ? 'a precondition…'
                  : label === 'WHEN' ? 'a trigger or action…'
                  : label === 'THEN' ? 'an observable outcome…'
                  : 'optional additional observable…',
      rows: label === 'AND' ? 1 : 2,
      oninput: (ev) => { ac[key] = ev.target.value; persist(); },
    }, ac[key] || ''),
  ]);
}

function addAC(story) {
  story.acceptanceCriteria.push({ given: '', when: '', then: '', and: '' });
  persist();
  render();
}

function removeAC(story, idx) {
  story.acceptanceCriteria.splice(idx, 1);
  persist();
  render();
}

function moveAC(story, idx, delta) {
  const j = idx + delta;
  if (j < 0 || j >= story.acceptanceCriteria.length) return;
  const [item] = story.acceptanceCriteria.splice(idx, 1);
  story.acceptanceCriteria.splice(j, 0, item);
  persist();
  render();
}

function renderLinkedRequirements(story) {
  const p = project();
  const wrap = el('div');
  const list = el('div', { class: 'tag-list', style: 'margin-bottom: 8px;' });
  if (story.requirementIds.length === 0) {
    list.appendChild(el('div', { class: 'muted' }, 'No requirements linked yet.'));
  } else {
    for (const rid of story.requirementIds) {
      const r = p.requirements.find(x => x.id === rid);
      const label = r ? `${r.code} · ${r.title || ''}` : '(missing)';
      list.appendChild(el('span', { class: 'tag', title: r?.description || '', onclick: () => {
        story.requirementIds = story.requirementIds.filter(x => x !== rid);
        persist(); render();
      } }, label + '  ✕'));
    }
  }
  wrap.appendChild(list);

  // Picker
  const sel = el('select');
  sel.appendChild(el('option', { value: '' }, '+ link a requirement…'));
  for (const r of p.requirements) {
    if (story.requirementIds.includes(r.id)) continue;
    sel.appendChild(el('option', { value: r.id }, `${r.code} · ${r.title || ''}`));
  }
  sel.addEventListener('change', () => {
    if (!sel.value) return;
    story.requirementIds.push(sel.value);
    persist(); render();
  });
  wrap.appendChild(sel);
  return wrap;
}

function renderLinkedDecisions(story) {
  const p = project();
  const wrap = el('div');
  const linked = p.decisions.filter(d => d.affectedStoryIds.includes(story.id));
  if (linked.length === 0) {
    wrap.appendChild(el('div', { class: 'muted', style: 'margin-bottom:8px;' }, 'No decisions linked yet.'));
  } else {
    const list = el('div', { class: 'tag-list', style: 'margin-bottom: 8px;' });
    for (const d of linked) {
      const cls = d.status === 'Open' ? 'tag' : 'tag';
      list.appendChild(el('span', {
        class: cls,
        title: d.question + (d.decisionText ? ` — ${d.decisionText}` : ''),
        style: 'cursor:pointer; ' + (d.status === 'Open' ? 'background: var(--warn-soft); color: var(--warn);' : ''),
        onclick: () => { setView('decisions'); state.selection = d.id; render(); }
      }, `${d.code} · ${d.status}`));
    }
    wrap.appendChild(list);
  }

  // Quick add
  const btn = el('button', { class: 'btn btn-ghost btn-sm', onclick: () => quickAddDecisionForStory(story) }, '+ New decision');
  wrap.appendChild(btn);
  return wrap;
}

function quickAddDecisionForStory(story) {
  const p = project();
  const wrap = el('div');
  const qInput = el('textarea', { rows: 3, style: 'width:100%; padding:8px; border:1px solid var(--line); border-radius:6px;' });
  const ownerInput = el('input', { type: 'text', placeholder: 'Owner (e.g. Mark H.)', style: 'width:100%; padding:8px; border:1px solid var(--line); border-radius:6px; margin-top:8px;' });
  const dueInput = el('input', { type: 'date', style: 'width:100%; padding:8px; border:1px solid var(--line); border-radius:6px; margin-top:8px;' });
  wrap.appendChild(el('p', {}, 'Capture the unresolved question. It will be linked to this story.'));
  wrap.appendChild(qInput);
  wrap.appendChild(ownerInput);
  wrap.appendChild(dueInput);
  openModal('New decision for ' + (story.code || 'story'), wrap, 'Create decision', () => {
    if (!qInput.value.trim()) throw new Error('Question is required.');
    p.decisions.push({
      id: uid('dc'),
      code: nextCode(p.decisions, 'DEC'),
      question: qInput.value.trim(),
      owner: ownerInput.value.trim(),
      raisedDate: new Date().toISOString().slice(0, 10),
      dueDate: dueInput.value || '',
      status: 'Open',
      decisionText: '',
      affectedStoryIds: [story.id],
      affectedRequirementIds: [],
    });
    persist();
    render();
    toast('Decision logged', 'good');
  });
}

function addStory() {
  const p = project();
  const story = {
    id: uid('st'),
    code: nextCode(p.stories, 'ST'),
    title: '',
    description: '',
    notes: '',
    status: 'Not Started',
    priority: '',
    launchTiming: '',
    epicId: null,
    requirementIds: [],
    acceptanceCriteria: [],
  };
  p.stories.push(story);
  persist();
  state.selection = story.id;
  state.view = 'stories';
  render();
}

function deleteStory(id) {
  const p = project();
  p.stories = p.stories.filter(s => s.id !== id);
  for (const d of p.decisions) d.affectedStoryIds = (d.affectedStoryIds || []).filter(x => x !== id);
  persist();
  if (state.selection === id) state.selection = null;
  render();
}

function openStory(id) {
  state.view = 'stories';
  state.selection = id;
  render();
}

function storyMeetsDoR(p, s) {
  if ((s.acceptanceCriteria || []).length < 2) return false;
  if ((s.requirementIds || []).length === 0) return false;
  if (!s.epicId) return false;
  const openDecisions = p.decisions.filter(d =>
    d.status === 'Open' && (d.affectedStoryIds || []).includes(s.id));
  if (openDecisions.length > 0) return false;
  return true;
}

function dorReasons(p, s) {
  const r = [];
  if ((s.acceptanceCriteria || []).length < 2) r.push(`${(s.acceptanceCriteria || []).length}/2 ACs`);
  if ((s.requirementIds || []).length === 0) r.push('no requirement linked');
  if (!s.epicId) r.push('no epic');
  const openDecisions = p.decisions.filter(d =>
    d.status === 'Open' && (d.affectedStoryIds || []).includes(s.id));
  if (openDecisions.length > 0) r.push(`${openDecisions.length} open decision${openDecisions.length === 1 ? '' : 's'}`);
  return r;
}

// ============================================================ Decisions

function renderDecisions() {
  const p = project();
  const view = el('div', { class: 'view' });
  view.appendChild(viewHeader('Decision Log',
    'Every open question or pending decision lives here, with an owner and a due date. No conversation ends without logging items here.',
    [
      searchInput('Search…'),
      el('button', { class: 'btn', onclick: () => addDecision() }, '+ Add'),
    ]));

  view.appendChild(el('div', { class: 'help-block' }, [
    el('strong', {}, 'Weekly cadence: '),
    'Walk every Open row in the standing decision review. Decide, reassign owner+date, or escalate. Never leave a question to die in chat.',
  ]));

  const filtered = p.decisions.filter(d =>
    matchesSearch(d.code + ' ' + d.question + ' ' + d.owner + ' ' + d.decisionText + ' ' + d.status, state.search));

  const panel = el('div', { class: 'panel' });
  if (filtered.length === 0) {
    panel.appendChild(emptyState('No decisions logged yet', 'Add one to start tracking open questions.'));
  } else {
    const t = el('table', { class: 'table' });
    t.appendChild(el('thead', {}, el('tr', {}, [
      el('th', { style: 'width: 80px' }, 'ID'),
      el('th', {}, 'Question'),
      el('th', { style: 'width: 150px' }, 'Owner'),
      el('th', { style: 'width: 120px' }, 'Raised'),
      el('th', { style: 'width: 120px' }, 'Due'),
      el('th', { style: 'width: 110px' }, 'Status'),
      el('th', { style: 'width: 22%' }, 'Decision'),
      el('th', { style: 'width: 130px' }, 'Linked Stories'),
      el('th', { class: 'col-actions', style: 'width: 60px' }, ''),
    ])));
    const tb = el('tbody');
    for (const d of filtered) {
      const linkedStoryCount = (d.affectedStoryIds || []).length;
      const dueOverdue = d.dueDate && d.status === 'Open' && d.dueDate < new Date().toISOString().slice(0, 10);
      tb.appendChild(el('tr', {}, [
        editableCell(d, 'code', { mono: true }),
        editableCell(d, 'question', { textarea: true }),
        editableCell(d, 'owner'),
        editableCell(d, 'raisedDate', { type: 'date' }),
        editableCell(d, 'dueDate', { type: 'date', cellClass: dueOverdue ? 'pill bad' : '' }),
        editableSelectCell(d, 'status', DECISION_STATUSES, DECISION_STATUSES),
        editableCell(d, 'decisionText', { textarea: true }),
        el('td', {}, el('button', { class: 'btn btn-ghost btn-sm', onclick: () => linkDecisionToStories(d) },
          linkedStoryCount === 0 ? 'Link…' : `${linkedStoryCount} linked`)),
        el('td', { class: 'col-actions' }, [
          el('button', { class: 'btn btn-icon', title: 'Delete', onclick: () => deleteDecision(d.id) }, '✕'),
        ]),
      ]));
    }
    t.appendChild(tb);
    panel.appendChild(t);
  }
  view.appendChild(panel);
  return view;
}

function addDecision() {
  const p = project();
  p.decisions.push({
    id: uid('dc'),
    code: nextCode(p.decisions, 'DEC'),
    question: '',
    owner: '',
    raisedDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    status: 'Open',
    decisionText: '',
    affectedStoryIds: [],
    affectedRequirementIds: [],
  });
  persist();
  render();
}

function deleteDecision(id) {
  const p = project();
  p.decisions = p.decisions.filter(d => d.id !== id);
  persist();
  render();
}

function linkDecisionToStories(decision) {
  const p = project();
  const body = el('div');
  body.appendChild(el('p', {}, 'Pick the stories affected by this decision. Open decisions on a story block that story from meeting Definition of Ready.'));
  const listWrap = el('div', { style: 'max-height: 360px; overflow:auto; border:1px solid var(--line); border-radius:6px;' });
  for (const s of p.stories) {
    const checked = (decision.affectedStoryIds || []).includes(s.id);
    const row = el('label', { style: 'display:flex; gap:8px; padding:6px 10px; border-bottom:1px solid var(--line); cursor:pointer; align-items:center;' }, [
      el('input', { type: 'checkbox', checked: checked ? 'checked' : null, 'data-sid': s.id }),
      el('span', { class: 'mono', style: 'min-width:80px;' }, s.code || ''),
      el('span', {}, s.title || el('span', { class: 'muted' }, '(untitled)')),
    ]);
    listWrap.appendChild(row);
  }
  body.appendChild(listWrap);
  openModal('Link decision to stories', body, 'Save links', () => {
    const ids = [];
    body.querySelectorAll('input[type=checkbox]').forEach(cb => {
      if (cb.checked) ids.push(cb.dataset.sid);
    });
    decision.affectedStoryIds = ids;
    persist();
    render();
  });
}

// ============================================================ Coverage

function renderCoverage() {
  const p = project();
  const view = el('div', { class: 'view' });
  view.appendChild(viewHeader('Coverage Matrix',
    'Which requirements are covered by which stories. Green = at least one story covers it. Red = uncovered.',
    [
      el('button', { class: 'btn btn-ghost btn-sm', onclick: () => exportCoverage() }, 'Export…'),
    ]));

  if (p.requirements.length === 0 || p.stories.length === 0) {
    view.appendChild(el('div', { class: 'empty' }, [
      el('h2', {}, 'Nothing to show yet'),
      el('p', {}, 'Add at least one requirement and one story to see coverage.'),
    ]));
    return view;
  }

  const panel = el('div', { class: 'panel coverage-wrap', style: 'padding: 12px;' });
  const t = el('table', { class: 'coverage-table' });
  const thead = el('thead');
  const trH = el('tr');
  trH.appendChild(el('th', {}, 'Requirement \\ Story'));
  for (const s of p.stories) {
    trH.appendChild(el('th', { title: s.title || '' }, s.code || '?'));
  }
  thead.appendChild(trH);
  t.appendChild(thead);

  const tbody = el('tbody');
  for (const r of p.requirements) {
    const tr = el('tr');
    tr.appendChild(el('td', { class: 'label', title: r.title || '' }, `${r.code || '?'} · ${r.title || ''}`.slice(0, 60)));
    for (const s of p.stories) {
      const covered = s.requirementIds.includes(r.id);
      tr.appendChild(el('td', { class: covered ? 'cov-1' : 'cov-0', title: covered ? 'covered' : 'not covered' }, covered ? '✓' : ''));
    }
    tbody.appendChild(tr);
  }
  t.appendChild(tbody);
  panel.appendChild(t);
  view.appendChild(panel);
  return view;
}

// ============================================================ Cell editors (shared)

function editableCell(obj, key, opts = {}) {
  const td = el('td', { class: opts.cellClass || '' });
  const tag = opts.textarea ? 'textarea' : 'input';
  const input = document.createElement(tag);
  if (!opts.textarea) input.type = opts.type || 'text';
  input.value = obj[key] != null ? obj[key] : '';
  if (opts.mono) input.classList.add('mono');
  input.addEventListener('input', () => { obj[key] = input.value; persist(); });
  if (opts.textarea) input.rows = 2;
  td.appendChild(input);
  return td;
}

function editableSelectCell(obj, key, values, labels) {
  const td = el('td');
  const sel = el('select');
  values.forEach((v, i) => {
    const opt = el('option', { value: v }, labels[i] != null ? labels[i] : v);
    if (obj[key] == null && v === '') opt.selected = true;
    if (obj[key] === v) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    obj[key] = sel.value === '' ? null : sel.value;
    persist();
    render();
  });
  td.appendChild(sel);
  return td;
}

function textInput(obj, key) {
  const i = el('input', { type: 'text' });
  i.value = obj[key] || '';
  i.addEventListener('input', () => { obj[key] = i.value; persist(); });
  return i;
}

function textarea(obj, key, rows) {
  const t = el('textarea', { rows: rows || 2 });
  t.value = obj[key] || '';
  t.addEventListener('input', () => { obj[key] = t.value; persist(); });
  return t;
}

function selectInput(obj, key, values, labels) {
  const sel = el('select');
  values.forEach((v, i) => {
    const opt = el('option', { value: v }, labels[i] != null ? labels[i] : v);
    if (obj[key] == null && v === '') opt.selected = true;
    if (obj[key] === v) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    obj[key] = sel.value === '' ? null : sel.value;
    persist();
    render();
  });
  return sel;
}

function field(label, inputNode) {
  return el('div', { class: 'field' }, [el('label', {}, label), inputNode]);
}

// ============================================================ View helpers

function viewHeader(title, subtitle, actions) {
  return el('div', { class: 'view-header' }, [
    el('div', { class: 'view-title' }, [
      el('h1', {}, title),
      subtitle ? el('p', {}, subtitle) : null,
    ]),
    el('div', { class: 'view-actions' }, actions),
  ]);
}

function searchInput(placeholder) {
  const i = el('input', { class: 'search', type: 'search', placeholder: placeholder || 'Search…' });
  i.value = state.search;
  i.addEventListener('input', () => { state.search = i.value; render(); });
  // Don't auto-focus on every render — only when freshly created
  return i;
}

function emptyState(title, sub) {
  return el('div', { class: 'empty' }, [
    el('h2', {}, title),
    sub ? el('p', {}, sub) : null,
  ]);
}

// ============================================================ Project CRUD

function promptNewProject() {
  const body = el('div');
  const nameInput = el('input', { type: 'text', placeholder: 'e.g. SOX ITGC Compliance 2026', style: 'width:100%; padding:8px; border:1px solid var(--line); border-radius:6px;' });
  const descInput = el('textarea', { rows: 3, placeholder: 'What this project is about (one sentence)…', style: 'width:100%; padding:8px; border:1px solid var(--line); border-radius:6px; margin-top:8px;' });
  body.appendChild(el('p', {}, 'Each project has its own Business Reqs, Reqs, Workstreams, Epics, Stories, and Decisions.'));
  body.appendChild(nameInput);
  body.appendChild(descInput);
  openModal('New project', body, 'Create', () => {
    if (!nameInput.value.trim()) throw new Error('Name is required.');
    const id = uid('pr');
    state.workspace.projects.push({
      id,
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      createdAt: new Date().toISOString(),
      businessRequirements: [],
      requirements: [],
      workstreams: [],
      epics: [],
      stories: [],
      decisions: [],
    });
    state.workspace.activeProjectId = id;
    persist();
    setView('dashboard');
  });
}

function promptEditProject(p) {
  const body = el('div');
  const nameInput = el('input', { type: 'text', style: 'width:100%; padding:8px; border:1px solid var(--line); border-radius:6px;' });
  nameInput.value = p.name;
  const descInput = el('textarea', { rows: 3, style: 'width:100%; padding:8px; border:1px solid var(--line); border-radius:6px; margin-top:8px;' });
  descInput.value = p.description || '';
  body.appendChild(nameInput);
  body.appendChild(descInput);
  openModal('Edit project', body, 'Save', () => {
    if (!nameInput.value.trim()) throw new Error('Name is required.');
    p.name = nameInput.value.trim();
    p.description = descInput.value.trim();
    persist();
    render();
  });
}

async function deleteActiveProject() {
  const p = project();
  if (!p) return;
  const r = await window.api.confirm({
    title: 'Delete project?',
    message: `Delete "${p.name}"?`,
    detail: 'All Business Reqs, Reqs, Workstreams, Epics, Stories, ACs, and Decisions for this project will be deleted. This cannot be undone.',
    buttons: ['Cancel', 'Delete'],
  });
  if (r !== 1) return;
  state.workspace.projects = state.workspace.projects.filter(x => x.id !== p.id);
  state.workspace.activeProjectId = state.workspace.projects[0]?.id || null;
  persist();
  render();
}

// ============================================================ Excel import

async function importXlsxAsProject() {
  const result = await window.api.importXlsx();
  if (result.canceled) return;
  if (!result.ok) { toast('Import failed: ' + result.error, 'error'); return; }

  // Heuristic: build a project from common Plan-Forge / Plan-Loyalty-style sheets.
  // We support sheets named: Business Requirements, Requirements, Workstreams,
  // Epics, Stories (or 'Use Cases' / 'Gap & Edge Cases'), Decision Log,
  // Acceptance Criteria. Column matching is fuzzy / case-insensitive.
  const sheets = result.sheets;
  const fileName = result.filePath.split('/').pop();

  const projectName = fileName.replace(/\.[^.]+$/, '');
  const newProj = {
    id: uid('pr'),
    name: projectName,
    description: 'Imported from ' + fileName,
    createdAt: new Date().toISOString(),
    businessRequirements: [],
    requirements: [],
    workstreams: [],
    epics: [],
    stories: [],
    decisions: [],
  };

  const find = (names) => {
    for (const n of names) {
      for (const sname of Object.keys(sheets)) {
        if (sname.toLowerCase() === n.toLowerCase()) return sheets[sname];
      }
    }
    return null;
  };
  const get = (row, ...keys) => {
    for (const k of keys) {
      for (const rk of Object.keys(row)) {
        if (rk.toLowerCase() === k.toLowerCase()) return row[rk];
      }
    }
    return '';
  };

  // Workstreams
  const wsRows = find(['Workstreams', 'workstream']);
  if (wsRows) {
    for (const row of wsRows) {
      const code = String(get(row, 'Code', 'ID', 'Workstream Code') || '').trim();
      const name = String(get(row, 'Name', 'Workstream', 'Title') || '').trim();
      if (!code && !name) continue;
      newProj.workstreams.push({
        id: uid('ws'), code: code || nextCode(newProj.workstreams, 'WS'),
        name, description: String(get(row, 'Description') || '').trim(),
      });
    }
  }

  // Business Requirements
  const brRows = find(['Business Requirements', 'business requirements']);
  if (brRows) {
    for (const row of brRows) {
      const code = String(get(row, 'Code', 'ID') || '').trim();
      const title = String(get(row, 'Title', 'Name') || '').trim();
      if (!code && !title) continue;
      newProj.businessRequirements.push({
        id: uid('br'),
        code: code || nextCode(newProj.businessRequirements, 'BR'),
        title,
        description: String(get(row, 'Description') || '').trim(),
        sourceDoc: String(get(row, 'Source Doc', 'Source Document', 'Source') || '').trim(),
      });
    }
  }

  // Requirements
  const reqRows = find(['Requirements', 'requirement', 'Requirements Map']);
  if (reqRows) {
    for (const row of reqRows) {
      const code = String(get(row, 'Code', 'ID', 'Requirement ID') || '').trim();
      const title = String(get(row, 'Title', 'Question / Topic', 'Question/Topic', 'Topic') || '').trim();
      if (!code && !title) continue;
      newProj.requirements.push({
        id: uid('rq'),
        code: code || nextCode(newProj.requirements, 'REQ'),
        title,
        description: String(get(row, 'Description', 'Response / Conclusion', 'Response') || '').trim(),
        businessRequirementId: null,
      });
    }
  }

  // Epics
  const epicRows = find(['Epics', 'epic']);
  if (epicRows) {
    for (const row of epicRows) {
      const code = String(get(row, 'Epic ID', 'Code', 'ID') || '').trim();
      const name = String(get(row, 'Name', 'Epic Name', 'Title') || '').trim();
      if (!code && !name) continue;
      const wsCode = String(get(row, 'Workstream') || '').split(' — ')[0].trim();
      const ws = newProj.workstreams.find(w => w.code === wsCode);
      newProj.epics.push({
        id: uid('ep'),
        code: code || nextCode(newProj.epics, 'EP'),
        name,
        description: String(get(row, 'Description') || '').trim(),
        workstreamId: ws?.id || null,
        status: String(get(row, 'Status') || 'Not Started').trim(),
      });
    }
  }

  // Stories (from 'Stories' or 'Use Cases' / 'Gap & Edge Cases' format)
  for (const sheetName of ['Stories', 'Use Cases', 'Gap & Edge Cases']) {
    const stRows = find([sheetName]);
    if (!stRows) continue;
    for (const row of stRows) {
      const code = String(get(row, 'Code', 'ID') || '').trim();
      const title = String(get(row, 'Title', 'Use Case', 'Story', 'Name') || '').trim();
      if (!code && !title) continue;
      const epicCode = String(get(row, 'Epic') || '').split(' ')[0].trim();
      const epic = newProj.epics.find(e => e.code === epicCode);
      newProj.stories.push({
        id: uid('st'),
        code: code || nextCode(newProj.stories, 'ST'),
        title,
        description: String(get(row, 'Description') || '').trim(),
        notes: String(get(row, 'Notes / Open Questions', 'Notes') || '').trim(),
        status: String(get(row, 'Status') || 'Not Started').trim(),
        priority: String(get(row, 'Priority') || '').trim(),
        launchTiming: String(get(row, 'Launch Timing', 'Launch') || '').trim(),
        epicId: epic?.id || null,
        requirementIds: [],
        acceptanceCriteria: parseACText(get(row, 'Acceptance Criteria', 'AC') || ''),
      });
    }
  }

  // Decision Log
  const decRows = find(['Decision Log', 'decisions']);
  if (decRows) {
    for (const row of decRows) {
      const code = String(get(row, 'ID', 'Code') || '').trim();
      const q = String(get(row, 'Question / Decision Needed', 'Question', 'Topic') || '').trim();
      if (!code && !q) continue;
      newProj.decisions.push({
        id: uid('dc'),
        code: code || nextCode(newProj.decisions, 'DEC'),
        question: q,
        owner: String(get(row, 'Owner') || '').trim(),
        raisedDate: String(get(row, 'Raised', 'Raised Date') || '').slice(0, 10),
        dueDate: String(get(row, 'Due', 'Due Date') || '').slice(0, 10),
        status: String(get(row, 'Status') || 'Open').trim(),
        decisionText: String(get(row, 'Decision (when resolved)', 'Decision') || '').trim(),
        affectedStoryIds: [],
        affectedRequirementIds: [],
      });
    }
  }

  state.workspace.projects.push(newProj);
  state.workspace.activeProjectId = newProj.id;
  persist();
  setView('dashboard');
  toast(`Imported ${newProj.stories.length} stories, ${newProj.requirements.length} reqs, ${newProj.decisions.length} decisions`, 'good');
}

function parseACText(text) {
  if (!text) return [];
  // Split on lines that start with "AC-N:" markers; everything in between is one AC.
  const t = String(text);
  const blocks = t.split(/\n(?=AC[-\s]?\d+\s*[:.])/i);
  const out = [];
  for (const block of blocks) {
    if (!block.trim()) continue;
    const ac = { given: '', when: '', then: '', and: '' };
    const givenM = block.match(/GIVEN\s+([\s\S]*?)(?=\bWHEN\b|\bTHEN\b|\bAND\b|$)/i);
    const whenM  = block.match(/WHEN\s+([\s\S]*?)(?=\bTHEN\b|\bAND\b|$)/i);
    const thenM  = block.match(/THEN\s+([\s\S]*?)(?=\bAND\b|$)/i);
    const andM   = block.match(/AND\s+([\s\S]*?)$/i);
    if (givenM) ac.given = givenM[1].trim();
    if (whenM)  ac.when  = whenM[1].trim();
    if (thenM)  ac.then  = thenM[1].trim();
    if (andM)   ac.and   = andM[1].trim();
    if (ac.given || ac.when || ac.then) out.push(ac);
  }
  if (out.length === 0 && t.trim()) {
    // Fallback: one AC with the whole thing in 'given'
    out.push({ given: t.trim(), when: '', then: '', and: '' });
  }
  return out;
}

// ============================================================ Export

async function exportCoverage() {
  const p = project();
  if (!p) return;
  const sheets = {
    'Coverage': p.requirements.map(r => {
      const row = { Code: r.code, Title: r.title };
      for (const s of p.stories) row[s.code || s.id] = s.requirementIds.includes(r.id) ? '✓' : '';
      return row;
    }),
  };
  const r = await window.api.exportXlsx({
    defaultName: `${p.name.replace(/[^A-Za-z0-9]+/g, '_')}_coverage.xlsx`,
    sheets,
  });
  if (r.ok) toast('Exported', 'good');
}

async function exportProjectJSON() {
  const p = project();
  if (!p) return;
  const r = await window.api.exportJson({
    defaultName: `${p.name.replace(/[^A-Za-z0-9]+/g, '_')}.json`,
    data: p,
  });
  if (r.ok) toast('Exported JSON', 'good');
}

async function exportProjectXLSX() {
  const p = project();
  if (!p) return;
  const wsByCode = new Map(p.workstreams.map(w => [w.id, w]));
  const epicById = new Map(p.epics.map(e => [e.id, e]));
  const reqById  = new Map(p.requirements.map(r => [r.id, r]));

  const sheets = {
    'Project': [{ Name: p.name, Description: p.description, CreatedAt: p.createdAt }],
    'Business Requirements': p.businessRequirements.map(b => ({
      Code: b.code, Title: b.title, Description: b.description, 'Source Doc': b.sourceDoc,
    })),
    'Requirements': p.requirements.map(r => ({
      Code: r.code, Title: r.title, Description: r.description,
      'Business Requirement': r.businessRequirementId ? (p.businessRequirements.find(b => b.id === r.businessRequirementId)?.code || '') : '',
    })),
    'Workstreams': p.workstreams.map(w => ({
      Code: w.code, Name: w.name, Description: w.description,
    })),
    'Epics': p.epics.map(e => ({
      Code: e.code, Name: e.name, Description: e.description,
      Workstream: wsByCode.get(e.workstreamId)?.code || '',
      Status: e.status,
    })),
    'Stories': p.stories.map(s => ({
      Code: s.code, Title: s.title, Description: s.description,
      Epic: epicById.get(s.epicId)?.code || '',
      Status: s.status,
      Priority: s.priority,
      'Launch Timing': s.launchTiming,
      Notes: s.notes,
      'Requirement Codes': s.requirementIds.map(rid => reqById.get(rid)?.code || '').filter(Boolean).join(', '),
      'Acceptance Criteria': s.acceptanceCriteria.map((ac, i) =>
        `AC-${i + 1}: GIVEN ${ac.given || ''}\n       WHEN  ${ac.when || ''}\n       THEN  ${ac.then || ''}${ac.and ? `\n       AND   ${ac.and}` : ''}`
      ).join('\n'),
    })),
    'Decision Log': p.decisions.map(d => ({
      ID: d.code, Question: d.question, Owner: d.owner,
      Raised: d.raisedDate, Due: d.dueDate, Status: d.status,
      Decision: d.decisionText,
      'Linked Stories': d.affectedStoryIds.map(sid => p.stories.find(s => s.id === sid)?.code || '').filter(Boolean).join(', '),
    })),
  };

  const r = await window.api.exportXlsx({
    defaultName: `${p.name.replace(/[^A-Za-z0-9]+/g, '_')}.xlsx`,
    sheets,
  });
  if (r.ok) toast('Exported Excel', 'good');
}

// ============================================================ Top-bar actions & shortcuts

function bindShortcuts() {
  window.api.onShortcut((name) => {
    switch (name) {
      case 'new-project':  promptNewProject(); break;
      case 'import-xlsx':  importXlsxAsProject(); break;
      case 'export-json':  exportProjectJSON(); break;
      case 'export-xlsx':  exportProjectXLSX(); break;
      case 'quick-search': focusSearch(); break;
    }
  });
  document.addEventListener('keydown', (ev) => {
    const meta = ev.metaKey || ev.ctrlKey;
    if (meta && ev.key === 'k') { ev.preventDefault(); focusSearch(); }
    if (ev.key === 'Escape') {
      if (document.getElementById('modalHost').classList.contains('open')) {
        ev.preventDefault();
        closeModal();
      } else if (state.selection) {
        state.selection = null;
        render();
      }
    }
  });
}

function focusSearch() {
  const sb = document.querySelector('.search');
  if (sb) sb.focus();
}

function showHelp() {
  const body = el('div');
  body.appendChild(el('h3', { style: 'margin-top:0' }, 'Hierarchy'));
  body.appendChild(el('p', {}, 'Project → Business Requirement → Requirement → linked to → Story (inside an Epic, inside a Workstream) → Acceptance Criteria.'));
  body.appendChild(el('h3', {}, 'Definition of Ready'));
  body.appendChild(el('p', {}, 'A story enters dev when: (1) ≥2 ACs written, (2) ≥1 requirement linked, (3) no open decisions blocking it, (4) an epic is assigned.'));
  body.appendChild(el('h3', {}, 'Cadence'));
  body.appendChild(el('p', {}, 'Weekly: Decision Log review (30 min). Walk every open row. Decide, reassign, or escalate.'));
  body.appendChild(el('h3', {}, 'Keyboard'));
  body.appendChild(el('p', { class: 'mono' }, '⌘N new project · ⌘I import Excel · ⌘K quick search · Esc close detail/modal'));
  openModal('Framework', body, 'OK', () => {}, { hideCancel: true });
}

function bindTopBar() {
  document.getElementById('btnNew').addEventListener('click', () => promptNewProject());
  document.getElementById('btnHelp').addEventListener('click', () => showHelp());
}

// ============================================================ Boot

(async function main() {
  await loadWorkspace();
  bindTopBar();
  bindShortcuts();
  if (state.workspace.projects.length > 0 && !state.workspace.activeProjectId) {
    state.workspace.activeProjectId = state.workspace.projects[0].id;
  }
  render();
})();
