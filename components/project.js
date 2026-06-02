/* atomERP-ui - Project Management Component (Global Scope) */

window.renderProject = function(subView, container) {
  const state = window.globalState || {};
  
  if (subView === 'board') {
    renderBoard(container, state);
  }
}

/**
 * 階層式 Issue 看板與專案管理
 */
function renderBoard(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  const project = state.project.projects[0]; // Active project
  const viewMode = state.project.viewMode || 'kanban'; // 'kanban' or 'tree'
  const filterAssignee = state.project.filterAssignee || 'all';

  // Calculate Epic Progresses dynamically based on issue count
  const epicsHtml = project.epics.map(epic => {
    const epicIssues = project.issues.filter(iss => iss.epicId === epic.id);
    const completed = epicIssues.filter(iss => iss.status === 'done').length;
    const progress = epicIssues.length > 0 ? Math.round((completed / epicIssues.length) * 100) : 0;
    
    return `
      <div class="card" style="padding:14px; display:flex; flex-direction:column; gap:6px;">
        <span style="font-size:0.75rem; font-weight:700; color:var(--text-secondary);">${epic.name}</span>
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="flex-grow:1; height:6px; background-color:var(--bg-secondary); border-radius:3px; overflow:hidden;">
            <div style="width:${progress}%; height:100%; background-color:var(--ksda-teal); transition:var(--transition-normal);"></div>
          </div>
          <span style="font-size:0.72rem; font-weight:700; color:var(--ksda-teal);">${progress}%</span>
        </div>
      </div>
    `;
  }).join('');

  // Kanban Columns render
  let lanesHtml = '';
  if (viewMode === 'kanban') {
    const columns = [
      { id: 'todo', name: window.atomERP.t('pj_col_todo') },
      { id: 'in_progress', name: window.atomERP.t('pj_col_progress') },
      { id: 'code_review', name: window.atomERP.t('pj_col_review') },
      { id: 'done', name: window.atomERP.t('pj_col_done') }
    ];

    lanesHtml = columns.map(col => {
      const colIssues = project.issues.filter(iss => {
        const matchesCol = iss.status === col.id;
        const matchesAssignee = filterAssignee === 'all' || iss.assignee === filterAssignee;
        return matchesCol && matchesAssignee;
      });

      const cards = colIssues.map(iss => {
        let prioColor = 'var(--text-muted)';
        if (iss.priority === 'high') prioColor = 'var(--danger)';
        else if (iss.priority === 'medium') prioColor = 'var(--ksda-gold)';
        
        return `
          <div class="card issue-card" style="padding:12px; margin-bottom:10px; border-left:4px solid ${prioColor}; box-shadow:var(--shadow-sm); cursor:grab;" draggable="true" data-id="${iss.id}">
            <div class="flex-between" style="margin-bottom:6px;">
              <span style="font-size:0.68rem; font-weight:700; color:var(--text-muted);">${iss.id}</span>
              <span class="badge ${iss.priority === 'high' ? 'badge-rejected' : 'badge-pending'}" style="font-size:0.6rem; padding:1px 4px;">${iss.priority}</span>
            </div>
            <h5 style="font-size:0.8rem; font-weight:600; margin-bottom:8px; line-height:1.3;">${iss.title}</h5>
            <div class="flex-between" style="font-size:0.72rem; color:var(--text-secondary);">
              <span>👤 ${iss.assigneeName}</span>
              <div class="flex-gap" style="gap:4px;">
                <button class="btn btn-xs btn-secondary move-issue-btn" data-id="${iss.id}" data-dir="prev" style="padding:2px 4px; min-height:16px;">◀</button>
                <button class="btn btn-xs btn-secondary move-issue-btn" data-id="${iss.id}" data-dir="next" style="padding:2px 4px; min-height:16px;">▶</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="card kanban-column" style="background-color:var(--bg-secondary); padding:12px; border-radius:var(--border-radius); flex: 1 1 200px; display:flex; flex-direction:column; gap:8px;">
          <h4 style="font-size:0.82rem; font-weight:700; color:var(--ksda-dark); padding:2px 4px; border-bottom:1px solid rgba(0,0,0,0.06); margin-bottom:8px;">
            ${col.name} (${colIssues.length})
          </h4>
          <div class="kanban-cards-box" style="flex-grow:1; min-height:300px; overflow-y:auto;" data-col="${col.id}">
            ${cards || `<div style="text-align:center; padding:40px 0; color:var(--text-muted); font-size:0.75rem;">${isZh ? '拖曳至此處或暫無工作' : 'Drag here or no issues'}</div>`}
          </div>
        </div>
      `;
    }).join('');
  } else {
    // Tree View rendering
    let treeHtml = '';
    
    // Group issues by parentId
    const rootIssues = project.issues.filter(iss => !iss.parentId);
    
    treeHtml = rootIssues.map(parent => {
      const subtasks = project.issues.filter(sub => sub.parentId === parent.id);
      
      const subHtml = subtasks.map(sub => `
        <div style="margin-left: 28px; padding: 10px 14px; border-left: 2px dashed var(--border-color); background-color: var(--bg-system); border-radius: var(--border-radius-sm); display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div>
            <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">${window.atomERP.t('pj_subtask_label')}${sub.id}</span>
            <h5 style="margin: 2px 0 0 0; font-size:0.8rem;">${sub.title}</h5>
          </div>
          <div class="flex-gap">
            <span style="font-size: 0.72rem;">👤 ${sub.assigneeName}</span>
            <span class="badge badge-${sub.status === 'done' ? 'approved' : sub.status === 'in_progress' ? 'in-progress' : 'todo'}" style="font-size:0.65rem;">
              ${sub.status}
            </span>
          </div>
        </div>
      `).join('');

      return `
        <div class="card" style="margin-bottom:16px; border-left: 4px solid var(--ksda-teal);">
          <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:1px solid var(--border-color); margin-bottom:10px;">
            <div>
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">${window.atomERP.t('pj_parenttask_label')}${parent.id}</span>
              <h4 style="margin: 2px 0 0 0; font-size:0.88rem; font-weight:700;">${parent.title}</h4>
            </div>
            <div class="flex-gap">
              <span style="font-size: 0.75rem;">👤 ${parent.assigneeName}</span>
              <span class="badge badge-${parent.status === 'done' ? 'approved' : parent.status === 'in_progress' ? 'in-progress' : 'todo'}">
                ${parent.status}
              </span>
            </div>
          </div>
          <div>
            ${subHtml || `<span style="font-size:0.72rem; color:var(--text-muted); padding-left:12px;">${window.atomERP.t('pj_no_subtasks')}</span>`}
          </div>
        </div>
      `;
    }).join('');

    lanesHtml = `
      <div style="width: 100%; display: flex; flex-direction: column;">
        ${treeHtml}
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Top Selector and View Mode buttons -->
    <div class="card">
      <div class="flex-between">
        <div>
          <h3>${window.atomERP.t('pj_title')}${project.name}</h3>
          <p class="card-subtext">${project.description}</p>
        </div>
        
        <div class="flex-gap">
          <!-- View switch buttons -->
          <div class="flex-gap" style="gap:2px; background-color:var(--bg-secondary); padding:2px; border-radius:var(--border-radius-sm);">
            <button class="btn btn-xs ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}" id="btn-view-kanban" style="padding:6px 10px;">${window.atomERP.t('pj_btn_kanban')}</button>
            <button class="btn btn-xs ${viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}" id="btn-view-tree" style="padding:6px 10px;">${window.atomERP.t('pj_btn_tree')}</button>
          </div>
          
          <!-- Assignee Filter -->
          <select id="project-assignee-select" style="min-height:30px; font-size:0.75rem; padding:4px 8px;">
            <option value="all" ${filterAssignee === 'all' ? 'selected' : ''}>${window.atomERP.t('pj_filter_assignee')}</option>
            ${state.hr.employees.map(e => `<option value="${e.id}" ${filterAssignee === e.id ? 'selected' : ''}>${e.name}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Epics progress indicators -->
    <div style="margin-bottom:8px;">
      <h4 style="font-size:0.8rem; text-transform:uppercase; color:var(--text-muted); letter-spacing:1px; margin-bottom:10px;">
        ${window.atomERP.t('pj_kpi_title')}
      </h4>
      <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
        ${epicsHtml}
      </div>
    </div>

    <!-- Main Board lanes grid -->
    <div class="flex-gap" style="align-items:stretch; overflow-x:auto; padding-bottom:10px; width:100%;">
      ${lanesHtml}
    </div>
  `;

  // Hooks & listeners
  document.getElementById('btn-view-kanban').addEventListener('click', () => {
    state.project.viewMode = 'kanban';
    renderBoard(container, state);
  });

  document.getElementById('btn-view-tree').addEventListener('click', () => {
    state.project.viewMode = 'tree';
    renderBoard(container, state);
  });

  document.getElementById('project-assignee-select').addEventListener('change', (e) => {
    state.project.filterAssignee = e.target.value;
    renderBoard(container, state);
  });

  // Manual move button actions (Kanban column shift simulation)
  document.querySelectorAll('.move-issue-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.getAttribute('data-id');
      const dir = btn.getAttribute('data-dir');
      const iss = project.issues.find(x => x.id === id);
      
      const statuses = ['todo', 'in_progress', 'code_review', 'done'];
      let currIdx = statuses.indexOf(iss.status);
      
      if (dir === 'next' && currIdx < statuses.length - 1) {
        currIdx++;
      } else if (dir === 'prev' && currIdx > 0) {
        currIdx--;
      }
      
      iss.status = statuses[currIdx];
      
      // Update Epic progress bar smoothly
      window.showToast(window.atomERP.t('toast_issue_moved') + iss.id + ' ' + (isZh ? '移動至' : 'moved to') + ' ' + iss.status, 'success');
      renderBoard(container, state);
    });
  });

  // Drag and Drop implementation for Desktop browsers
  if (viewMode === 'kanban') {
    const cardNodes = container.querySelectorAll('.issue-card');
    const boxNodes = container.querySelectorAll('.kanban-cards-box');

    cardNodes.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
        card.style.opacity = '0.5';
      });
      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });
    });

    boxNodes.forEach(box => {
      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.style.backgroundColor = 'rgba(0,160,163,0.03)';
      });
      box.addEventListener('dragleave', () => {
        box.style.backgroundColor = 'transparent';
      });
      box.addEventListener('drop', async (e) => {
        e.preventDefault();
        box.style.backgroundColor = 'transparent';
        const id = e.dataTransfer.getData('text/plain');
        const iss = project.issues.find(x => x.id === id);
        const nextStatus = box.getAttribute('data-col');
        
        if (iss && iss.status !== nextStatus) {
          iss.status = nextStatus;
          window.showToast(window.atomERP.t('toast_issue_moved') + iss.id + ' ' + (isZh ? '移至' : 'moved to') + ' ' + nextStatus, 'success');
          renderBoard(container, state);
        }
      });
    });
  }
}
