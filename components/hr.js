/* atomERP-ui - Human Resources Component (Global Scope) */

window.renderHR = function(subView, container) {
  const state = window.globalState || {};
  
  if (subView === 'personnel') {
    renderPersonnel(container, state);
  } else if (subView === 'payroll') {
    renderPayroll(container, state);
  } else if (subView === 'leave') {
    renderLeave(container, state);
  } else if (subView === 'travel') {
    renderTravel(container, state);
  } else if (subView === 'directory') {
    renderDirectory(container, state);
  }
}

/**
 * 1. 人事管理 (Personnel)
 */
function renderPersonnel(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  const deptRD = isZh ? "軟體研發部" : "R&D Department";
  const deptFinance = isZh ? "財務會計部" : "Finance Department";
  const deptBD = isZh ? "商業開發部" : "Business Development";
  const deptSales = isZh ? "業務推廣部" : "Sales & Marketing";
  const deptOps = isZh ? "營運行政部" : "Operations & Admin";

  let listHtml = '';
  const searchVal = state.personnelSearch || '';
  const deptFilter = state.personnelDeptFilter || 'all';
  
  const filtered = state.hr.employees.filter(emp => {
    const matchesSearch = emp.name.includes(searchVal) || emp.id.includes(searchVal) || emp.title.includes(searchVal);
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  filtered.forEach(emp => {
    listHtml += `
      <tr class="personnel-row" style="cursor:pointer;" data-id="${emp.id}">
        <td><span class="text-bold">${emp.id}</span></td>
        <td>${emp.name}</td>
        <td><span class="badge badge-in-progress">${emp.department}</span></td>
        <td>${emp.title}</td>
        <td>${emp.email}</td>
        <td>NT$ ${emp.salary.base.toLocaleString()}</td>
        <td>${emp.joinDate}</td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="card">
      <div class="flex-between" style="margin-bottom: 20px;">
        <h3>${window.atomERP.t('hr_emp_title')}</h3>
        <button class="btn btn-primary" id="add-employee-trigger-btn">${window.atomERP.t('hr_btn_hire')}</button>
      </div>

      <!-- Filters Row -->
      <div class="form-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 20px;">
        <div class="form-group">
          <label>${window.atomERP.t('hr_filter_keyword')}</label>
          <input type="text" id="personnel-search-input" value="${searchVal}" placeholder="${window.atomERP.t('hr_search_placeholder')}">
        </div>
        <div class="form-group">
          <label>${window.atomERP.t('hr_filter_dept')}</label>
          <select id="personnel-dept-select">
            <option value="all" ${deptFilter === 'all' ? 'selected' : ''}>${window.atomERP.t('hr_dept_all')}</option>
            <option value="${deptRD}" ${deptFilter === deptRD ? 'selected' : ''}>${window.atomERP.t('hr_dept_rd')}</option>
            <option value="${deptFinance}" ${deptFilter === deptFinance ? 'selected' : ''}>${window.atomERP.t('hr_dept_finance')}</option>
            <option value="${deptBD}" ${deptFilter === deptBD ? 'selected' : ''}>${window.atomERP.t('hr_dept_bd')}</option>
            <option value="${deptSales}" ${deptFilter === deptSales ? 'selected' : ''}>${window.atomERP.t('hr_dept_sales')}</option>
            <option value="${deptOps}" ${deptFilter === deptOps ? 'selected' : ''}>${window.atomERP.t('hr_dept_ops')}</option>
          </select>
        </div>
      </div>

      <!-- Employees Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${window.atomERP.t('hr_col_id')}</th>
              <th>${window.atomERP.t('hr_col_name')}</th>
              <th>${window.atomERP.t('hr_col_dept')}</th>
              <th>${window.atomERP.t('hr_col_title')}</th>
              <th>${window.atomERP.t('hr_col_email')}</th>
              <th>${window.atomERP.t('hr_col_salary')}</th>
              <th>${window.atomERP.t('hr_col_joindate')}</th>
            </tr>
          </thead>
          <tbody>
            ${listHtml || `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">${window.atomERP.t('no_records')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Hidden Hire Employee Panel -->
    <div id="add-employee-panel" class="card hidden" style="border-top: 3px solid var(--ksda-teal);">
      <div class="flex-between" style="margin-bottom: 16px;">
        <h4>${window.atomERP.t('hr_form_title')}</h4>
        <button class="btn btn-xs btn-secondary" id="close-add-panel-btn">${window.atomERP.t('btn_cancel')}</button>
      </div>
      <form id="add-employee-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="emp-name">${window.atomERP.t('hr_form_name')} <span class="text-danger">*</span></label>
            <input type="text" id="emp-name" placeholder="${isZh ? '請輸入姓名' : 'Enter name'}" required>
          </div>
          <div class="form-group">
            <label for="emp-dept">${window.atomERP.t('hr_col_dept')} <span class="text-danger">*</span></label>
            <select id="emp-dept" required>
              <option value="${deptRD}">${window.atomERP.t('hr_dept_rd')}</option>
              <option value="${deptFinance}">${window.atomERP.t('hr_dept_finance')}</option>
              <option value="${deptBD}">${window.atomERP.t('hr_dept_bd')}</option>
              <option value="${deptSales}">${window.atomERP.t('hr_dept_sales')}</option>
              <option value="${deptOps}">${window.atomERP.t('hr_dept_ops')}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="emp-title">${window.atomERP.t('hr_form_title_lbl')} <span class="text-danger">*</span></label>
            <input type="text" id="emp-title" placeholder="${isZh ? '如：網頁工程師' : 'e.g., Software Engineer'}" required>
          </div>
          <div class="form-group">
            <label for="emp-salary">${window.atomERP.t('hr_form_salary')} <span class="text-danger">*</span></label>
            <input type="number" id="emp-salary" value="50000" min="28000" required>
          </div>
          <div class="form-group">
            <label for="emp-email">${window.atomERP.t('hr_form_email')} <span class="text-danger">*</span></label>
            <input type="email" id="emp-email" placeholder="username@mockup-erp.org" required>
          </div>
          <div class="form-group">
            <label for="emp-phone">${window.atomERP.t('hr_form_phone')}</label>
            <input type="text" id="emp-phone" value="0900-123-456">
          </div>
        </div>
        <div class="flex-between">
          <span class="text-muted" style="font-size:0.75rem;">${window.atomERP.t('hr_form_req_label')}</span>
          <button type="submit" class="btn btn-primary">${window.atomERP.t('hr_form_btn_save')}</button>
        </div>
      </form>
    </div>
  `;

  // Hooks & Event Listeners
  const searchInput = document.getElementById('personnel-search-input');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      state.personnelSearch = e.target.value;
      renderPersonnel(container, state);
    }
  });

  const deptSelect = document.getElementById('personnel-dept-select');
  deptSelect.addEventListener('change', (e) => {
    state.personnelDeptFilter = e.target.value;
    renderPersonnel(container, state);
  });

  const triggerBtn = document.getElementById('add-employee-trigger-btn');
  const panel = document.getElementById('add-employee-panel');
  const closeBtn = document.getElementById('close-add-panel-btn');

  triggerBtn.addEventListener('click', () => {
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-fill values in Guide Mode to ease demonstration
    if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 0) {
      document.getElementById('emp-name').value = isZh ? '我是測試帳號' : 'DEMO';
      document.getElementById('emp-title').value = isZh ? '軟體工程師' : 'Software Engineer';
      document.getElementById('emp-salary').value = '65000';
      document.getElementById('emp-email').value = 'demo@mockup-erp.org';
      window.FormGuard.setDirty(true); // Flag form dirty
      
      // Update guide bubble location inside panel
      setTimeout(() => {
        const submitBtn = panel.querySelector('button[type="submit"]');
        const bubbleText = isZh 
          ? "我是測試帳號資料已預填！請點選『確認錄用存檔』按鈕存入本地資料庫庫。" 
          : "DEMO's details are pre-filled! Click 'Complete Onboarding' to save to the database.";
        window.WorkflowGuide.showBubble(submitBtn, bubbleText, "top");
      }, 200);
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
    window.FormGuard.setDirty(false);
  });

  // Form Guard Change tracking
  const form = document.getElementById('add-employee-form');
  form.addEventListener('input', () => window.FormGuard.setDirty(true));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('emp-name').value;
    const dept = document.getElementById('emp-dept').value;
    const title = document.getElementById('emp-title').value;
    const salary = parseInt(document.getElementById('emp-salary').value);
    const email = document.getElementById('emp-email').value;
    const phone = document.getElementById('emp-phone').value;
    
    const newEmp = {
      id: `EMP00${state.hr.employees.length + 1}`,
      name,
      department: dept,
      title,
      email,
      phone,
      joinDate: new Date().toISOString().split('T')[0],
      salary: { base: salary, bonus: 0, allowance: 0 },
      leaveBalance: { annual: 7, sick: 30, personal: 14 }
    };

    await window.simulateApi('錄用建檔中...');
    
    state.hr.employees.push(newEmp);
    window.FormGuard.setDirty(false); // Clean FormGuard
    window.showToast(window.atomERP.t('toast_hire_success') + ' ' + newEmp.id, 'success');
    
    // Step forward in guided tutorial
    if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 0) {
      window.WorkflowGuide.nextStep();
    } else {
      renderPersonnel(container, state);
    }
  });
  
  // Row clicks to open global Contact Drawer
  container.querySelectorAll('.personnel-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-id');
      window.showContactDrawer(id);
    });
  });

  // Refresh guide on view render
  if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 0) {
    window.WorkflowGuide.refreshGuide();
  }
}

/**
 * 2. 薪資試算 (Payroll)
 */
function renderPayroll(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  let payrollList = state.payrollCalculated || [];
  let tableRows = '';

  payrollList.forEach(p => {
    tableRows += `
      <tr>
        <td><span class="text-bold">${p.empId}</span></td>
        <td>${p.name}</td>
        <td>${p.dept}</td>
        <td>NT$ ${p.base.toLocaleString()}</td>
        <td class="text-success">+ NT$ ${p.travelClaim.toLocaleString()}</td>
        <td class="text-danger">- NT$ ${p.leaveDeduction.toLocaleString()}</td>
        <td><span class="text-bold" style="color:var(--ksda-teal);">NT$ ${p.total.toLocaleString()}</span></td>
        <td>
          <div style="font-size: 0.72rem; color: var(--text-muted);">
            算式: 基本 ${p.base} + 差旅 ${p.travelClaim} - 請假扣款 (${p.leaveHours}小時 x 270)
          </div>
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="card">
      <div class="flex-between" style="margin-bottom: 20px;">
        <div>
          <h3>${window.atomERP.t('pr_title')}</h3>
          <p class="card-subtext">${isZh ? '本計算器自動累加「出差報銷(財務審核通過)」並按日核實扣除「事病假扣款」' : 'Automatically aggregates approved expense claims and deducts unpaid leave days.'}</p>
        </div>
        <button class="btn btn-warning" id="run-payroll-btn">${window.atomERP.t('pr_btn_calc')}</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${window.atomERP.t('hr_col_id')}</th>
              <th>${window.atomERP.t('hr_col_name')}</th>
              <th>${window.atomERP.t('hr_col_dept')}</th>
              <th>${window.atomERP.t('hr_col_salary')}</th>
              <th>${isZh ? '差旅津貼(實報實銷)' : 'Travel Allowance (Reimbursement)'}</th>
              <th>${window.atomERP.t('pr_col_deduct')}</th>
              <th>${window.atomERP.t('pr_col_net')}</th>
              <th>${isZh ? '薪資核算明細公式' : 'Payroll Details & Formula'}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">${isZh ? '尚未進行薪資結算，請點選上方按鈕執行。' : 'No payroll calculations found. Click the button above to run payroll.'}</td></tr>`}
          </tbody>
        </table>
      </div>
      
      ${payrollList.length > 0 ? `
      <div class="flex-between" style="margin-top: 16px;">
        <span class="text-bold">${isZh ? '全體總發放金額：' : 'Total Payroll Payout: '}NT$ ${payrollList.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}</span>
        <button class="btn btn-primary" id="confirm-payroll-payout-btn">${window.atomERP.t('pr_btn_disburse')}</button>
      </div>
      ` : ''}
    </div>
  `;

  // Listeners
  const runBtn = document.getElementById('run-payroll-btn');
  runBtn.addEventListener('click', async () => {
    await window.simulateApi('薪資結構公式分析與試算中...');
    
    // Core Payroll calculation Engine
    const payroll = state.hr.employees.map(emp => {
      // 1. Check leave requests for this month
      const empLeaves = state.hr.leaveRequests.filter(lv => 
        lv.employeeId === emp.id && 
        lv.status === 'approved' && 
        (lv.startDate.includes('-05-') || lv.startDate.includes('-06-')) // Simple search month logic
      );
      
      let leaveHours = 0;
      empLeaves.forEach(lv => {
        if (lv.type === 'sick' || lv.type === 'personal') {
          leaveHours += lv.hours;
        }
      });
      
      // Hourly deduction rate: base salary / 240 hours
      const hourlyRate = Math.round(emp.salary.base / 240);
      const leaveDeduction = leaveHours * hourlyRate;
      
      // 2. Add approved expense claims for travel (category === '出差交通費')
      const travelClaims = state.finance.expenseClaims.filter(clm => 
        clm.employeeId === emp.id && 
        clm.status === 'approved' && 
        clm.category === '出差交通費'
      );
      const travelClaim = travelClaims.reduce((acc, clm) => acc + clm.amount, 0);
      
      const total = emp.salary.base + travelClaim - leaveDeduction;

      return {
        empId: emp.id,
        name: emp.name,
        dept: emp.department,
        base: emp.salary.base,
        travelClaim,
        leaveDeduction,
        leaveHours,
        total
      };
    });

    state.payrollCalculated = payroll;
    window.showToast(window.atomERP.t('toast_payroll_run'), 'success');
    
    if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 3) {
      // Finalize guide
      window.WorkflowGuide.nextStep();
    } else {
      renderPayroll(container, state);
    }
  });

  const payBtn = document.getElementById('confirm-payroll-payout-btn');
  if (payBtn) {
    payBtn.addEventListener('click', async () => {
      await window.simulateApi('發送銀行批次匯款 API 指令...');
      
      // Log payroll items directly into corporate ledger as single massive expense
      const totalPayout = state.payrollCalculated.reduce((acc, c) => acc + c.total, 0);
      const newLedger = {
        id: `LED-2026-0${state.finance.ledgerEntries.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: isZh ? '薪資支出' : 'Payroll Expense',
        account: isZh ? '銀行存款-玉山' : 'Bank Account - Esun',
        amount: totalPayout,
        payee: isZh ? '全體同仁' : 'All Employees',
        description: isZh ? '批次劃撥發放五月份員工應領薪水額度' : 'Batch disbursement of May employee payroll',
        cashierApproved: true
      };
      
      state.finance.ledgerEntries.unshift(newLedger);
      state.payrollCalculated = [];
      window.showToast(window.atomERP.t('toast_payroll_disburse'), 'success');
      renderPayroll(container, state);
    });
  }

  // Active guide prompt
  if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 3) {
    window.WorkflowGuide.refreshGuide();
  }
}

/**
 * 3. 請假休假 (Leave Requests)
 */
function renderLeave(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  let pendingRows = '';
  let historyRows = '';
  
  state.hr.leaveRequests.forEach(lv => {
    const row = `
      <tr>
        <td>${lv.id}</td>
        <td><span class="text-bold">${lv.employeeName}</span></td>
        <td>${lv.type === 'annual' ? window.atomERP.t('lv_type_annual') : lv.type === 'sick' ? window.atomERP.t('lv_type_sick') : window.atomERP.t('lv_type_personal')}</td>
        <td>${lv.startDate} ~ ${lv.endDate}</td>
        <td>${lv.hours} ${isZh ? '小時' : 'hrs'} (${Math.round(lv.hours / 8)} ${window.atomERP.t('days')})</td>
        <td>${lv.reason}</td>
        <td>
          ${lv.status === 'pending' 
            ? `<span class="badge badge-pending">${window.atomERP.t('status_pending')}</span>` 
            : lv.status === 'approved' 
              ? `<span class="badge badge-approved">${window.atomERP.t('status_approved')}</span>` 
              : `<span class="badge badge-rejected">${window.atomERP.t('status_rejected')}</span>`}
        </td>
        <td>
          ${lv.status === 'pending'
            ? `<button class="btn btn-xs btn-primary approve-leave-btn" data-id="${lv.id}">${window.atomERP.t('btn_approve')}</button>
               <button class="btn btn-xs btn-danger reject-leave-btn" data-id="${lv.id}">${window.atomERP.t('btn_reject')}</button>`
            : `<span style="font-size:0.75rem; color:var(--text-muted);">${isZh ? '結案' : 'Closed'}</span>`
          }
        </td>
      </tr>
    `;
    
    if (lv.status === 'pending') {
      pendingRows += row;
    } else {
      historyRows += row;
    }
  });

  container.innerHTML = `
    <!-- Top Stats Row -->
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-title">${isZh ? '待處理請假單' : 'Pending Leave Requests'}</div>
        <div class="card-metric">${state.hr.leaveRequests.filter(l => l.status === 'pending').length} ${isZh ? '件' : 'Case(s)'}</div>
        <div class="card-subtext">${isZh ? '需要人事及主管批核' : 'Requires approval'}</div>
      </div>
      <div class="card">
        <div class="card-title">${isZh ? '年度特休平均剩餘額' : 'Avg Annual Leave Balance'}</div>
        <div class="card-metric">${Math.round(state.hr.employees.reduce((acc, e) => acc + e.leaveBalance.annual, 0) / state.hr.employees.length)} ${window.atomERP.t('days')}</div>
        <div class="card-subtext">${isZh ? '每名員工的平均年假額度' : 'Average days per employee'}</div>
      </div>
    </div>

    <!-- Application Form Grid -->
    <div class="form-grid" style="grid-template-columns: 1fr 2fr; gap: 24px;">
      
      <!-- Left side: Apply Form -->
      <div class="card" id="leave-form-container">
        <h3>${window.atomERP.t('lv_req_title')}</h3>
        <p class="card-subtext" style="margin-bottom: 16px;">${isZh ? '送出後將在右側產生待審核項目' : 'Pending items will appear on the right after submission.'}</p>
        
        <form id="leave-apply-form">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="leave-emp-id">${isZh ? '申請同仁' : 'Employee'} <span class="text-danger">*</span></label>
            <select id="leave-emp-id" required>
              ${state.hr.employees.map(e => `<option value="${e.id}">${e.name} (${e.department})</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="leave-type">${window.atomERP.t('lv_form_type')} <span class="text-danger">*</span></label>
            <select id="leave-type" required>
              <option value="annual">${isZh ? '年假/特休 (扣除年假餘額)' : 'Annual Leave (Deduct Balance)'}</option>
              <option value="sick">${isZh ? '病假 (半薪，計入扣款試算)' : 'Sick Leave (Half pay, deducts salary)'}</option>
              <option value="personal">${isZh ? '事假 (無薪，計入扣款試算)' : 'Personal Leave (Unpaid, deducts salary)'}</option>
            </select>
          </div>
          
          <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group">
              <label for="leave-start">${isZh ? '開始日期' : 'Start Date'}</label>
              <input type="date" id="leave-start" required>
            </div>
            <div class="form-group">
              <label for="leave-end">${isZh ? '結束日期' : 'End Date'}</label>
              <input type="date" id="leave-end" required>
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="leave-hours">${isZh ? '請假總時數 (1天 = 8小時)' : 'Total Leave Hours (1 day = 8 hours)'}</label>
            <input type="number" id="leave-hours" value="24" min="1" max="240" required>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="leave-proxy">${window.atomERP.t('lv_form_proxy')}</label>
            <select id="leave-proxy">
              ${state.hr.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 16px;">
            <label for="leave-reason">${window.atomERP.t('lv_form_reason')}</label>
            <textarea id="leave-reason" placeholder="${isZh ? '請填寫休假或請假事由...' : 'Describe reason for leave...'}"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width:100%;">${window.atomERP.t('lv_btn_submit')}</button>
        </form>
      </div>

      <!-- Right side: Pending / Approved lists -->
      <div class="flex-gap" style="flex-direction: column; width: 100%; gap: 20px;">
        
        <!-- Pending List -->
        <div class="card" style="width: 100%;" id="pending-leaves-table">
          <h4>${window.atomERP.t('lv_list_title')}</h4>
          <p class="card-subtext" style="margin-bottom: 12px;">${isZh ? '主管可以在此核發許可' : 'Managers can review and approve here.'}</p>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>${window.atomERP.t('lv_col_id')}</th>
                  <th>${window.atomERP.t('lv_col_requester')}</th>
                  <th>${window.atomERP.t('lv_col_type')}</th>
                  <th>${window.atomERP.t('lv_col_duration')}</th>
                  <th>${window.atomERP.t('lv_col_hours')}</th>
                  <th>${window.atomERP.t('lv_col_reason')}</th>
                  <th>${window.atomERP.t('lv_col_status')}</th>
                  <th>${window.atomERP.t('lv_col_action')}</th>
                </tr>
              </thead>
              <tbody>
                ${pendingRows || `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">${isZh ? '無待批核的請假申請' : 'No pending leave applications.'}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- History List -->
        <div class="card" style="width: 100%;">
          <h4>📊 ${isZh ? '歷史假單紀錄與歸檔' : 'Leave History & Archive'}</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>${window.atomERP.t('lv_col_id')}</th>
                  <th>${window.atomERP.t('lv_col_requester')}</th>
                  <th>${window.atomERP.t('lv_col_type')}</th>
                  <th>${window.atomERP.t('lv_col_duration')}</th>
                  <th>${window.atomERP.t('lv_col_hours')}</th>
                  <th>${window.atomERP.t('lv_col_reason')}</th>
                  <th>${window.atomERP.t('lv_col_status')}</th>
                  <th>${isZh ? '歸檔' : 'Archived'}</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows || `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">${isZh ? '尚無已審核的歷史紀錄' : 'No approved history records found.'}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Autocomplete variables for Guide Flow
  if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 1) {
    document.getElementById('leave-emp-id').value = 'EMP001'; // Zhang Xiaoming
    document.getElementById('leave-type').value = 'annual'; // Annual
    document.getElementById('leave-start').value = '2026-06-10';
    document.getElementById('leave-end').value = '2026-06-12';
    document.getElementById('leave-hours').value = '24';
    document.getElementById('leave-reason').value = isZh ? '帶全家人去澎湖三天兩夜家庭旅遊' : '3-day family trip to Penghu';
    window.FormGuard.setDirty(true);
    
    setTimeout(() => {
      const submitBtn = document.querySelector('#leave-apply-form button[type="submit"]');
      const bubbleText = isZh 
        ? "我是測試帳號特休單內容已自動代入。請點選『提交假單審核』送出請假公文。" 
        : "Leave details for DEMO are pre-filled! Click 'Submit Leave Application' to route the request.";
      window.WorkflowGuide.showBubble(submitBtn, bubbleText, "top");
    }, 200);
  }

  // Event Handlers
  const applyForm = document.getElementById('leave-apply-form');
  applyForm.addEventListener('input', () => window.FormGuard.setDirty(true));

  applyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const empId = document.getElementById('leave-emp-id').value;
    const empObj = state.hr.employees.find(x => x.id === empId);
    const type = document.getElementById('leave-type').value;
    const startDate = document.getElementById('leave-start').value;
    const endDate = document.getElementById('leave-end').value;
    const hours = parseInt(document.getElementById('leave-hours').value);
    const reason = document.getElementById('leave-reason').value;

    const newReq = {
      id: `LV-2026-0${state.hr.leaveRequests.length + 1}`,
      employeeId: empId,
      employeeName: empObj.name,
      type,
      startDate,
      endDate,
      hours,
      reason,
      status: 'pending'
    };

    await window.simulateApi('假單發送公文傳遞中...');
    
    state.hr.leaveRequests.unshift(newReq);
    window.FormGuard.setDirty(false);
    window.showToast(window.atomERP.t('toast_leave_submit'), 'success');
    
    if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 1) {
      window.WorkflowGuide.nextStep();
    } else {
      renderLeave(container, state);
    }
  });

  // Approval Buttons Click Event listeners
  document.querySelectorAll('.approve-leave-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const lvId = e.target.getAttribute('data-id');
      const request = state.hr.leaveRequests.find(x => x.id === lvId);
      
      await window.simulateApi('簽核同意、更新假別餘額資料庫中...');
      
      request.status = 'approved';
      
      // Decrement balance if it's an annual leave
      const emp = state.hr.employees.find(x => x.id === request.employeeId);
      if (emp && request.type === 'annual') {
        const days = Math.round(request.hours / 8);
        emp.leaveBalance.annual = Math.max(0, emp.leaveBalance.annual - days);
        window.showToast(isZh ? `假期審核通過！已成功扣減 ${emp.name} 年假額度 ${days} 天。` : `Leave approved! Deducted ${days} days of annual leave for ${emp.name}.`, 'success');
      } else {
        window.showToast(window.atomERP.t('toast_leave_approve'), 'success');
      }

      if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 2) {
        window.WorkflowGuide.nextStep();
      } else {
        renderLeave(container, state);
      }
    });
  });

  document.querySelectorAll('.reject-leave-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const lvId = e.target.getAttribute('data-id');
      const request = state.hr.leaveRequests.find(x => x.id === lvId);
      
      await window.simulateApi('退回假單簽呈中...');
      request.status = 'rejected';
      window.showToast(window.atomERP.t('toast_leave_reject'), 'warning');
      renderLeave(container, state);
    });
  });

  // Re-run guide on load
  if (window.WorkflowGuide.activeFlow === 'leaveToPay' && window.WorkflowGuide.currentStepIndex === 2) {
    window.WorkflowGuide.refreshGuide();
  }
}

/**
 * 4. 出差申請 (Business Travel)
 */
function renderTravel(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  let tableRows = '';
  state.hr.travelRequests.forEach(tr => {
    tableRows += `
      <tr>
        <td>${tr.id}</td>
        <td><span class="text-bold">${tr.employeeName}</span></td>
        <td>${tr.destination}</td>
        <td>${tr.startDate} ~ ${tr.endDate}</td>
        <td>${tr.purpose}</td>
        <td>
          ${tr.status === 'pending'
            ? `<span class="badge badge-pending">${isZh ? '審核中' : 'Pending'}</span>`
            : `<span class="badge badge-approved">${isZh ? '核准完成' : 'Approved'}</span>`}
        </td>
        <td>
          ${tr.status === 'pending'
            ? `<button class="btn btn-xs btn-primary approve-travel-btn" data-id="${tr.id}">${isZh ? '同意出差' : 'Approve'}</button>`
            : `<span style="font-size:0.75rem; color:var(--text-muted);">${isZh ? '已派發交通津貼草稿' : 'Dispatched Draft'}</span>`
          }
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="form-grid" style="grid-template-columns: 1fr 2fr; gap: 24px; align-items:stretch;">
      
      <!-- Apply Form -->
      <div class="card" id="travel-form-container">
        <h3>${window.atomERP.t('tr_form_title')}</h3>
        <p class="card-subtext" style="margin-bottom: 16px;">${isZh ? '出差核准後，自動連結財務模組產生預計請款憑證草稿' : 'After approval, a draft expense claim will automatically be generated in finance.'}</p>
        
        <form id="travel-apply-form">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="travel-emp-id">${isZh ? '申請同仁' : 'Employee'} <span class="text-danger">*</span></label>
            <select id="travel-emp-id" required>
              ${state.hr.employees.map(e => `<option value="${e.id}">${e.name} (${e.department})</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="travel-dest">${window.atomERP.t('tr_form_dest')} <span class="text-danger">*</span></label>
            <input type="text" id="travel-dest" placeholder="${isZh ? '例：台北分會辦事處' : 'e.g., Taipei Branch Office'}" required>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group">
              <label for="travel-start">${isZh ? '出發日期' : 'Start Date'}</label>
              <input type="date" id="travel-start" required>
            </div>
            <div class="form-group">
              <label for="travel-end">${isZh ? '返回日期' : 'End Date'}</label>
              <input type="date" id="travel-end" required>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="travel-budget">${window.atomERP.t('tr_form_budget')}</label>
            <input type="number" id="travel-budget" value="2800" min="0" required>
          </div>
          <div class="form-group" style="margin-bottom: 16px;">
            <label for="travel-purpose">${window.atomERP.t('tr_form_purpose')}</label>
            <textarea id="travel-purpose" placeholder="${window.atomERP.t('tr_form_placeholder_purpose')}" required></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width:100%;">${window.atomERP.t('tr_btn_submit')}</button>
        </form>
      </div>

      <!-- List -->
      <div class="card">
        <h3>${window.atomERP.t('tr_list_title')}</h3>
        <div class="table-container" style="margin-top: 16px;">
          <table>
            <thead>
              <tr>
                <th>${window.atomERP.t('tr_col_id')}</th>
                <th>${window.atomERP.t('tr_col_emp')}</th>
                <th>${window.atomERP.t('tr_col_dest')}</th>
                <th>${window.atomERP.t('tr_col_duration')}</th>
                <th>${window.atomERP.t('tr_col_purpose')}</th>
                <th>${window.atomERP.t('tr_col_status')}</th>
                <th>${isZh ? '審核操作' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">${isZh ? '目前無出差公務申請案' : 'No travel requests found.'}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Autocomplete for Flow B
  if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 0) {
    document.getElementById('travel-emp-id').value = 'EMP004'; // Ajen
    document.getElementById('travel-dest').value = isZh ? '台北分會辦事處' : 'Taipei Branch Office';
    document.getElementById('travel-start').value = '2026-06-18';
    document.getElementById('travel-end').value = '2026-06-19';
    document.getElementById('travel-budget').value = '2800';
    document.getElementById('travel-purpose').value = isZh ? '拜訪大型合作廠商進行年度合約簽署與交流' : 'Visit major client for annual contract signing';
    window.FormGuard.setDirty(true);

    setTimeout(() => {
      const submitBtn = document.querySelector('#travel-apply-form button[type="submit"]');
      const bubbleText = isZh 
        ? "出差表單內容已代入。點選『提交出差申請』，出差審核後將自動派發津貼草稿至財務區！" 
        : "Travel request details pre-filled! Click 'Submit Travel Application' to proceed.";
      window.WorkflowGuide.showBubble(submitBtn, bubbleText, "top");
    }, 200);
  }

  // Listeners
  const form = document.getElementById('travel-apply-form');
  form.addEventListener('input', () => window.FormGuard.setDirty(true));
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const empId = document.getElementById('travel-emp-id').value;
    const empObj = state.hr.employees.find(x => x.id === empId);
    const destination = document.getElementById('travel-dest').value;
    const startDate = document.getElementById('travel-start').value;
    const endDate = document.getElementById('travel-end').value;
    const purpose = document.getElementById('travel-purpose').value;
    const budget = parseInt(document.getElementById('travel-budget').value);

    const newTr = {
      id: `TR-2026-0${state.hr.travelRequests.length + 1}`,
      employeeId: empId,
      employeeName: empObj.name,
      destination,
      startDate,
      endDate,
      purpose,
      budget,
      status: 'pending'
    };

    await window.simulateApi('公文流程送出中...');
    state.hr.travelRequests.unshift(newTr);
    window.FormGuard.setDirty(false);
    window.showToast(isZh ? `出差申請送出！單號為: ${newTr.id}，請在清單中核准。` : `Travel request submitted! ID: ${newTr.id}.`, 'success');
    renderTravel(container, state);
  });

  // Approvals
  document.querySelectorAll('.approve-travel-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const trId = e.target.getAttribute('data-id');
      const trObj = state.hr.travelRequests.find(x => x.id === trId);
      
      await window.simulateApi('核發同意，發送請款草稿至財務部門中...');
      trObj.status = 'approved';
      
      // Auto create a Finance Expense claim draft!
      const newClaim = {
        id: `CLM-2026-0${state.finance.expenseClaims.length + 1}`,
        employeeId: trObj.employeeId,
        employeeName: trObj.employeeName,
        category: isZh ? '出差交通費' : 'Business Travel',
        amount: trObj.budget,
        description: isZh 
          ? `【出差關聯單 ${trObj.id}】${trObj.destination}公務出差報銷`
          : `[Related Travel ${trObj.id}] ${trObj.destination} business trip reimbursement`,
        receiptAttached: false,
        receiptUrl: '',
        status: 'pending',
        submitDate: new Date().toISOString().split('T')[0]
      };
      
      state.finance.expenseClaims.unshift(newClaim);
      window.showToast(isZh 
        ? `核准出差！財務管理模組中已同步產生關聯請款單 ${newClaim.id} (草稿)！` 
        : `Travel approved! Reimbursement draft ${newClaim.id} has been created in Finance.`, 'success');
      
      if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 0) {
        window.WorkflowGuide.nextStep();
      } else {
        renderTravel(container, state);
      }
    });
  });

  // Guided tutorial step check
  if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 0) {
    // If pending list has pending items, focus approve button
    const pendingTravel = state.hr.travelRequests.filter(t => t.status === 'pending');
    if (pendingTravel.length > 0) {
      setTimeout(() => {
        const approveBtn = document.querySelector('.approve-travel-btn');
        if (approveBtn) {
          const bubbleText = isZh 
            ? "出差單已列在核備清單中！請點擊『同意出差』核准此單。" 
            : "Travel request is queued! Click 'Approve' to authorize this trip.";
          window.WorkflowGuide.showBubble(approveBtn, bubbleText, "bottom");
        }
      }, 100);
    } else {
      window.WorkflowGuide.refreshGuide();
    }
  }
}

/**
 * 5. 員工通訊錄 (Employee Directory)
 */
function renderDirectory(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  let cardsHtml = '';
  const searchVal = state.dirSearch || '';
  
  const filtered = state.hr.employees.filter(emp => {
    return emp.name.includes(searchVal) || emp.department.includes(searchVal) || emp.title.includes(searchVal);
  });

  filtered.forEach(emp => {
    cardsHtml += `
      <div class="card dir-card" style="cursor:pointer;" data-id="${emp.id}">
        <div class="flex-gap" style="margin-bottom: 12px;">
          <div class="logo-box" style="background-color: var(--border-color); color: var(--ksda-dark); width:36px; height:36px; box-shadow:none;">
            ${emp.name.slice(0, 1)}
          </div>
          <div>
            <h4 style="margin:0;">${emp.name}</h4>
            <span style="font-size:0.7rem; color:var(--text-muted);">${emp.title}</span>
          </div>
        </div>
        <div style="font-size:0.75rem; color:var(--text-secondary); line-height: 1.6;">
          <p>📞 ${isZh ? '電話: ' : 'Phone: '}${emp.phone}</p>
          <p>✉️ ${isZh ? '信箱: ' : 'Email: '}${emp.email}</p>
          <p>🏢 ${isZh ? '部門: ' : 'Dept: '}<span class="badge badge-todo" style="padding:2px 6px;">${emp.department}</span></p>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px;">
      <h3>${window.atomERP.t('dir_title')}</h3>
      <div class="form-group" style="margin-top: 12px;">
        <input type="text" id="dir-search-input" value="${searchVal}" placeholder="${window.atomERP.t('dir_search_placeholder')}">
      </div>
    </div>

    <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
      ${cardsHtml || `<div class="card" style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">${window.atomERP.t('dir_no_emp')}</div>`}
    </div>
  `;

  // Hooks
  const searchInput = document.getElementById('dir-search-input');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      state.dirSearch = e.target.value;
      renderDirectory(container, state);
    }
  });

  // Directory Card Clicks to Global Drawer
  document.querySelectorAll('.dir-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      window.showContactDrawer(id);
    });
  });
}
