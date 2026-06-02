/* atomERP-ui - Financial Management Component (Global Scope) */

window.renderFinance = function(subView, container) {
  const state = window.globalState || {};
  
  if (subView === 'claims') {
    renderClaims(container, state);
  } else if (subView === 'ledger') {
    renderLedger(container, state);
  }
}

/**
 * 1. 員工請款 (Expense Claims)
 */
function renderClaims(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  let pendingRows = '';
  let archiveRows = '';
  
  state.finance.expenseClaims.forEach(clm => {
    const row = `
      <tr>
        <td>${clm.id}</td>
        <td><span class="text-bold">${clm.employeeName}</span></td>
        <td><span class="badge badge-todo">${clm.category}</span></td>
        <td><span class="text-bold" style="color:var(--ksda-teal);">NT$ ${clm.amount.toLocaleString()}</span></td>
        <td>${clm.description}</td>
        <td>
          ${clm.receiptAttached 
            ? `<span style="color:var(--success); font-weight:600;">${window.atomERP.t('cl_receipt_attached')}</span>` 
            : `<span style="color:var(--danger);">${window.atomERP.t('cl_receipt_missing')}</span>`}
        </td>
        <td>${clm.submitDate}</td>
        <td>
          ${clm.status === 'pending'
            ? `<span class="badge badge-pending">${window.atomERP.t('status_pending')}</span>`
            : `<span class="badge badge-approved">${isZh ? '已撥款' : 'Disbursed'}</span>`}
        </td>
        <td>
          ${clm.status === 'pending'
            ? `<button class="btn btn-xs btn-primary approve-claim-btn" data-id="${clm.id}">${window.atomERP.t('cl_btn_approve')}</button>`
            : `<span style="font-size:0.75rem; color:var(--text-muted);">${window.atomERP.t('cl_disbursed_ledger')}</span>`
          }
        </td>
      </tr>
    `;

    if (clm.status === 'pending') {
      pendingRows += row;
    } else {
      archiveRows += row;
    }
  });

  // Calculate stats
  const pendingTotal = state.finance.expenseClaims
    .filter(c => c.status === 'pending')
    .reduce((acc, c) => acc + c.amount, 0);

  container.innerHTML = `
    <!-- Top KPI cards -->
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-title">${window.atomERP.t('cl_title_kpi1')}</div>
        <div class="card-metric">${state.finance.expenseClaims.filter(c => c.status === 'pending').length} ${isZh ? '件' : 'Case(s)'}</div>
        <div class="card-subtext">${window.atomERP.t('cl_title_kpi1_sub')}${pendingTotal.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-title">${window.atomERP.t('cl_title_kpi2')}</div>
        <div class="card-metric">
          ${Math.round((state.finance.expenseClaims.filter(c => c.receiptAttached).length / state.finance.expenseClaims.length) * 100)}%
        </div>
        <div class="card-subtext">${window.atomERP.t('cl_title_kpi2_sub')}</div>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="form-grid" style="grid-template-columns: 1fr 2fr; gap: 24px;">
      
      <!-- Apply Form -->
      <div class="card" id="claim-form-container">
        <h3>${window.atomERP.t('cl_form_title')}</h3>
        <p class="card-subtext" style="margin-bottom: 16px;">${window.atomERP.t('cl_form_sub')}</p>
        
        <form id="claim-apply-form">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="claim-emp-id">${window.atomERP.t('cl_form_emp')} <span class="text-danger">*</span></label>
            <select id="claim-emp-id" required>
              ${state.hr.employees.map(e => `<option value="${e.id}">${e.name} (${e.department})</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="claim-category">${window.atomERP.t('cl_form_cat')} <span class="text-danger">*</span></label>
            <select id="claim-category" required>
              <option value="出差交通費">${window.atomERP.t('cl_cat_travel')}</option>
              <option value="辦公文具">${window.atomERP.t('cl_cat_stationery')}</option>
              <option value="公務餐敘">${window.atomERP.t('cl_cat_meals')}</option>
              <option value="軟體服務訂閱">${window.atomERP.t('cl_cat_saas')}</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="claim-amount">${window.atomERP.t('cl_form_amount')} <span class="text-danger">*</span></label>
            <input type="number" id="claim-amount" placeholder="${window.atomERP.t('cl_form_amount_placeholder')}" required>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="claim-desc">${window.atomERP.t('cl_form_desc')}</label>
            <textarea id="claim-desc" placeholder="${window.atomERP.t('cl_form_desc_placeholder')}" required></textarea>
          </div>
          
          <!-- Receipt Box Simulation -->
          <div class="form-group" style="margin-bottom: 16px;">
            <label>${window.atomERP.t('cl_form_receipt')}</label>
            <div class="receipt-drop-zone" id="receipt-upload-box" style="border: 2px dashed var(--border-color); padding: 20px; text-align:center; border-radius: var(--border-radius-sm); cursor:pointer; background-color:var(--bg-system); transition:var(--transition-fast);">
              <span class="upload-icon" id="receipt-icon" style="font-size: 1.8rem; display:block; margin-bottom:8px;">📸</span>
              <span class="upload-text" id="receipt-text" style="font-size:0.75rem; color:var(--text-muted);">${window.atomERP.t('cl_form_receipt_placeholder')}</span>
            </div>
            <input type="hidden" id="receipt-attached-state" value="false">
          </div>
          
          <button type="submit" class="btn btn-primary" style="width:100%;">${window.atomERP.t('cl_btn_submit')}</button>
        </form>
      </div>

      <!-- Tables -->
      <div class="flex-gap" style="flex-direction: column; width: 100%; gap: 20px;">
        
        <!-- Pending Table -->
        <div class="card" style="width: 100%;" id="pending-claims-table">
          <h4>${window.atomERP.t('cl_list_title')}</h4>
          <p class="card-subtext" style="margin-bottom: 12px;">${window.atomERP.t('cl_list_sub')}</p>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>${window.atomERP.t('cl_col_id')}</th>
                  <th>${window.atomERP.t('cl_col_emp')}</th>
                  <th>${window.atomERP.t('cl_col_cat')}</th>
                  <th>${window.atomERP.t('cl_col_amount')}</th>
                  <th>${window.atomERP.t('cl_col_desc')}</th>
                  <th>${window.atomERP.t('cl_col_receipt')}</th>
                  <th>${window.atomERP.t('cl_col_date')}</th>
                  <th>${window.atomERP.t('cl_col_status')}</th>
                  <th>${window.atomERP.t('cl_col_action')}</th>
                </tr>
              </thead>
              <tbody>
                ${pendingRows || `<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">${isZh ? '目前無待簽核的請款單項目' : 'No pending claims found.'}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- History Archive -->
        <div class="card" style="width: 100%;">
          <h4>${window.atomERP.t('cl_hist_title')}</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>${window.atomERP.t('cl_col_id')}</th>
                  <th>${window.atomERP.t('cl_col_emp')}</th>
                  <th>${window.atomERP.t('cl_col_cat')}</th>
                  <th>${window.atomERP.t('cl_col_amount')}</th>
                  <th>${window.atomERP.t('cl_col_desc')}</th>
                  <th>${window.atomERP.t('cl_col_receipt')}</th>
                  <th>${window.atomERP.t('cl_col_date')}</th>
                  <th>${window.atomERP.t('cl_col_status')}</th>
                  <th>${window.atomERP.t('cl_col_cashier')}</th>
                </tr>
              </thead>
              <tbody>
                ${archiveRows || `<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">${isZh ? '尚無已撥款歷史案件' : 'No historical claims found.'}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Autocomplete Guide B
  if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 1) {
    // Find the latest pending travel-associated claim
    const travelClaim = state.finance.expenseClaims.find(c => c.category === '出差交通費' && c.status === 'pending');
    if (travelClaim) {
      document.getElementById('claim-emp-id').value = travelClaim.employeeId;
      document.getElementById('claim-category').value = travelClaim.category;
      document.getElementById('claim-amount').value = travelClaim.amount;
      document.getElementById('claim-desc').value = travelClaim.description;
      
      // Target upload box
      setTimeout(() => {
        const box = document.getElementById('receipt-upload-box');
        const bubbleText = isZh 
          ? "出差單關聯請款已自動預填！現在點選『收據上傳區』模擬收據上傳以通過審核條件！" 
          : "Travel claim auto-filled! Click the receipt area to upload a simulated invoice.";
        window.WorkflowGuide.showBubble(box, bubbleText, "top");
      }, 200);
    }
  }

  // Upload Simulation Listener
  const uploadBox = document.getElementById('receipt-upload-box');
  const receiptStateInput = document.getElementById('receipt-attached-state');
  
  uploadBox.addEventListener('click', () => {
    // Simulate attaching receipt file
    uploadBox.style.borderColor = 'var(--success)';
    uploadBox.style.backgroundColor = 'rgba(46, 196, 182, 0.05)';
    document.getElementById('receipt-icon').textContent = '📎';
    document.getElementById('receipt-text').innerHTML = `<span style="color:var(--success); font-weight:700;">${window.atomERP.t('cl_form_receipt_uploaded')}</span><br><span style="font-size:0.68rem; color:var(--text-muted);">receipt_upload_2026.jpg</span>`;
    receiptStateInput.value = 'true';
    window.showToast(window.atomERP.t('cl_form_receipt_uploaded'), 'success');

    // Guide forward
    if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 1) {
      setTimeout(() => {
        const submitBtn = document.querySelector('#claim-apply-form button[type="submit"]');
        const bubbleText = isZh 
          ? "收據發票憑證成功附上！請點選『提交財務請款單』遞交主管簽呈。" 
          : "Receipt attached! Click 'Submit Expense Claim' to route the document.";
        window.WorkflowGuide.showBubble(submitBtn, bubbleText, "top");
      }, 200);
    }
  });

  // Form Guard Change tracking
  const form = document.getElementById('claim-apply-form');
  form.addEventListener('input', () => window.FormGuard.setDirty(true));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (receiptStateInput.value !== 'true') {
      window.showToast(window.atomERP.t('toast_claim_fail_receipt'), 'danger');
      return;
    }

    const empId = document.getElementById('claim-emp-id').value;
    const empObj = state.hr.employees.find(x => x.id === empId);
    const category = document.getElementById('claim-category').value;
    const amount = parseInt(document.getElementById('claim-amount').value);
    const description = document.getElementById('claim-desc').value;

    // Check if this was a travel draft or a brand new one
    const trDraft = state.finance.expenseClaims.find(c => c.employeeId === empId && c.category === category && c.status === 'pending' && c.receiptAttached === false);
    
    if (trDraft) {
      // Complete existing draft
      trDraft.receiptAttached = true;
      trDraft.amount = amount;
      trDraft.description = description;
      trDraft.submitDate = new Date().toISOString().split('T')[0];
    } else {
      // Create new claim
      const newClaim = {
        id: `CLM-2026-0${state.finance.expenseClaims.length + 1}`,
        employeeId: empId,
        employeeName: empObj.name,
        category,
        amount,
        description,
        receiptAttached: true,
        receiptUrl: 'receipt_manual_demo.jpg',
        status: 'pending',
        submitDate: new Date().toISOString().split('T')[0]
      };
      state.finance.expenseClaims.unshift(newClaim);
    }

    await window.simulateApi('經費公文夾傳遞中...');
    window.FormGuard.setDirty(false);
    window.showToast(window.atomERP.t('toast_claim_submit'), 'success');

    if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 1) {
      window.WorkflowGuide.nextStep();
    } else {
      renderClaims(container, state);
    }
  });

  // Claim Approval handlers
  document.querySelectorAll('.approve-claim-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const claim = state.finance.expenseClaims.find(c => c.id === id);
      
      await window.simulateApi('決行同意，出納撥款，建立會計流水流水帳中...');
      
      claim.status = 'approved';
      
      // Auto write to general ledger as Expense!
      const newLedger = {
        id: `LED-2026-0${state.finance.ledgerEntries.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: isZh ? `員工報銷-${claim.category}` : `Reimbursement - ${claim.category}`,
        account: isZh ? '零用金' : 'Petty Cash',
        amount: claim.amount,
        payee: claim.employeeName,
        description: isZh 
          ? `核銷報銷請款案 (${claim.id}): ${claim.description}`
          : `Approved claim (${claim.id}): ${claim.description}`,
        cashierApproved: true
      };
      
      state.finance.ledgerEntries.unshift(newLedger);
      window.showToast(isZh 
        ? `同意核銷！出納已撥付零用金 NT$ ${claim.amount.toLocaleString()} 予 ${claim.employeeName}，並自動記帳於會計總帳中！` 
        : `Claim approved! Disbursed NT$ ${claim.amount.toLocaleString()} petty cash to ${claim.employeeName} and logged in ledger.`, 'success');
      
      if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 2) {
        window.WorkflowGuide.nextStep();
      } else {
        renderClaims(container, state);
      }
    });
  });

  // Guided tutorial step check
  if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 2) {
    const pendingClaim = state.finance.expenseClaims.filter(c => c.status === 'pending');
    if (pendingClaim.length > 0) {
      setTimeout(() => {
        const approveBtn = document.querySelector('.approve-claim-btn');
        if (approveBtn) {
          const bubbleText = isZh 
            ? "請款單已抵達待核銷公文匣！請點選『同意核銷撥款』按鈕以准予撥付現金零用金。" 
            : "Claim is queued for approval! Click 'Approve' to disburse petty cash.";
          window.WorkflowGuide.showBubble(approveBtn, bubbleText, "bottom");
        }
      }, 100);
    } else {
      window.WorkflowGuide.refreshGuide();
    }
  }
}

/**
 * 2. 簡易會計與出納 (Accounting & Ledger)
 */
function renderLedger(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  let tableRows = '';
  let totalIncome = 0;
  let totalExpense = 0;
  
  state.finance.ledgerEntries.forEach(entry => {
    if (entry.type === 'income') {
      totalIncome += entry.amount;
    } else {
      totalExpense += entry.amount;
    }

    tableRows += `
      <tr>
        <td>${entry.id}</td>
        <td>${entry.date}</td>
        <td>
          <span class="badge ${entry.type === 'income' ? 'badge-approved' : 'badge-rejected'}">
            ${entry.type === 'income' ? '📥 收入' : '📤 支出'}
          </span>
        </td>
        <td><span class="text-bold">${entry.category}</span></td>
        <td>${entry.account}</td>
        <td><span class="text-bold" style="color:${entry.type === 'income' ? 'var(--success)' : 'var(--danger)'};">NT$ ${entry.amount.toLocaleString()}</span></td>
        <td>${entry.payee}</td>
        <td>${entry.description}</td>
        <td>
          ${entry.cashierApproved 
            ? `<span style="color:var(--success); font-weight:600;">✔️ 出納已過帳</span>` 
            : `<span style="color:var(--ksda-gold);">⏳ 待覆核</span>`}
        </td>
      </tr>
    `;
  });

  const balance = totalIncome - totalExpense;

  container.innerHTML = `
    <!-- Top Ledger KPIs -->
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-title">${window.atomERP.t('lg_title_kpi1')}</div>
        <div class="card-metric text-success">NT$ ${totalIncome.toLocaleString()}</div>
        <div class="card-subtext">${window.atomERP.t('lg_title_kpi1_sub')}</div>
      </div>
      <div class="card">
        <div class="card-title">${window.atomERP.t('lg_title_kpi2')}</div>
        <div class="card-metric text-danger">NT$ ${totalExpense.toLocaleString()}</div>
        <div class="card-subtext">${window.atomERP.t('lg_title_kpi2_sub')}</div>
      </div>
      <div class="card">
        <div class="card-title">${window.atomERP.t('lg_title_kpi3')}</div>
        <div class="card-metric" style="color:${balance >= 0 ? 'var(--ksda-teal)' : 'var(--danger)'};">
          NT$ ${balance.toLocaleString()}
        </div>
        <div class="card-subtext">${window.atomERP.t('lg_title_kpi3_sub')}</div>
      </div>
    </div>

    <!-- Forms & Table layout -->
    <div class="form-grid" style="grid-template-columns: 1fr 2.5fr; gap: 24px; align-items:stretch;">
      
      <!-- New Entry Form -->
      <div class="card">
        <h3>${window.atomERP.t('lg_form_title')}</h3>
        <p class="card-subtext" style="margin-bottom: 16px;">${window.atomERP.t('lg_form_sub')}</p>
        
        <form id="ledger-form">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="led-type">${window.atomERP.t('lg_form_type')} <span class="text-danger">*</span></label>
            <select id="led-type" required>
              <option value="expense">${window.atomERP.t('lg_type_expense')}</option>
              <option value="income">${window.atomERP.t('lg_type_income')}</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="led-category">${window.atomERP.t('lg_form_cat')} <span class="text-danger">*</span></label>
            <input type="text" id="led-category" placeholder="${window.atomERP.t('lg_form_cat_placeholder')}" required>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="led-account">${window.atomERP.t('lg_form_acc')} <span class="text-danger">*</span></label>
            <select id="led-account" required>
              <option value="銀行存款-玉山">${window.atomERP.t('lg_acc_bank')}</option>
              <option value="零用金">${window.atomERP.t('lg_acc_cash')}</option>
              <option value="信用卡-台新">${window.atomERP.t('lg_acc_cc')}</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="led-amount">${window.atomERP.t('lg_form_amount')} <span class="text-danger">*</span></label>
            <input type="number" id="led-amount" placeholder="${isZh ? '金額...' : 'Amount...'}" required>
          </div>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="led-payee">${window.atomERP.t('lg_form_payee')} <span class="text-danger">*</span></label>
            <input type="text" id="led-payee" placeholder="${window.atomERP.t('lg_form_payee_placeholder')}" required>
          </div>
          
          <div class="form-group" style="margin-bottom: 16px;">
            <label for="led-desc">${window.atomERP.t('lg_form_desc')}</label>
            <textarea id="led-desc" placeholder="${window.atomERP.t('lg_form_desc_placeholder')}" required></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width:100%;">${window.atomERP.t('lg_btn_submit')}</button>
        </form>
      </div>

      <!-- Ledger Table -->
      <div class="card">
        <h3>📖 ${isZh ? 'Mockup Inc.會計日記流水簿 (General Ledger)' : 'Mockup Inc. General Ledger'}</h3>
        <div class="table-container" style="margin-top: 16px;">
          <table>
            <thead>
              <tr>
                <th>${window.atomERP.t('lg_col_id')}</th>
                <th>${window.atomERP.t('lg_col_date')}</th>
                <th>${window.atomERP.t('lg_col_type')}</th>
                <th>${window.atomERP.t('lg_col_cat')}</th>
                <th>${window.atomERP.t('lg_col_acc')}</th>
                <th>${window.atomERP.t('lg_col_amount')}</th>
                <th>${window.atomERP.t('lg_col_payee')}</th>
                <th>${window.atomERP.t('lg_col_desc')}</th>
                <th>${window.atomERP.t('lg_col_status')}</th>
              </tr>
            </thead>
            <tbody id="ledger-table-body">
              ${tableRows || `<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">${isZh ? '尚無會計日記帳項目' : 'No ledger entries recorded.'}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Hooks
  const lForm = document.getElementById('ledger-form');
  lForm.addEventListener('input', () => window.FormGuard.setDirty(true));

  lForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const type = document.getElementById('led-type').value;
    const category = document.getElementById('led-category').value;
    const account = document.getElementById('led-account').value;
    const amount = parseInt(document.getElementById('led-amount').value);
    const payee = document.getElementById('led-payee').value;
    const description = document.getElementById('led-desc').value;

    const newLedger = {
      id: `LED-2026-0${state.finance.ledgerEntries.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      account,
      amount,
      payee,
      description,
      cashierApproved: true
    };

    await window.simulateApi('寫入複式記帳日記簿中...');
    
    state.finance.ledgerEntries.unshift(newLedger);
    window.FormGuard.setDirty(false);
    window.showToast(window.atomERP.t('toast_ledger_success'), 'success');
    renderLedger(container, state);
  });

  // Active guide prompt
  if (window.WorkflowGuide.activeFlow === 'travelToLedger' && window.WorkflowGuide.currentStepIndex === 3) {
    // If the latest item is the travel claim reimbursement, highlight it!
    const latest = state.finance.ledgerEntries[0];
    if (latest && latest.description.includes('CLM-2026-0')) {
      setTimeout(() => {
        const trNode = document.querySelector('#ledger-table-body tr:first-child');
        const bubbleText = isZh 
          ? "大功告成！可以看到剛才撥款的出差費已自動代入會計流水帳，且完成複式分錄登打！請點選『我知道了』結案！" 
          : "Success! The approved trip reimbursement has been auto-logged into the General Ledger under expenses. Click 'Got it' to conclude the tour!";
        window.WorkflowGuide.showBubble(trNode, bubbleText, "bottom");
      }, 200);
    } else {
      window.WorkflowGuide.refreshGuide();
    }
  }
}
