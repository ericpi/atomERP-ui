/* atomERP-ui - Inventory Management Component (Global Scope) */

window.renderInventory = function(subView, container) {
  const state = window.globalState || {};
  
  if (subView === 'stockin') {
    renderStockIn(container, state);
  }
}

/**
 * 進貨與庫存查詢系統 (Stock-In & Query)
 */
function renderStockIn(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  let itemRows = '';
  let logRows = '';
  const searchVal = state.invSearch || '';
  const catFilter = state.invCatFilter || 'all';

  const catGifts = isZh ? "行銷禮品" : "Marketing Gifts";
  const catEquipment = isZh ? "辦公設備" : "Office Equipment";
  const catSupplies = isZh ? "辦公耗材" : "Office Supplies";

  // 1. Render Inventory Items List
  const filteredItems = state.inventory.inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchVal.toLowerCase()) || item.id.toLowerCase().includes(searchVal.toLowerCase());
    const matchesCat = catFilter === 'all' || item.category === catFilter;
    return matchesSearch && matchesCat;
  });

  filteredItems.forEach(item => {
    const isLowStock = item.stockCount < item.minThreshold;
    const warningLabel = isLowStock 
      ? `<span class="badge badge-pending">${window.atomERP.t('iv_warning_lbl')}</span>` 
      : `<span class="badge badge-approved">${window.atomERP.t('iv_normal_lbl')}</span>`;
      
    const highlightStyle = isLowStock 
      ? `style="background-color: var(--ksda-gold-light); border-left: 3px solid var(--ksda-gold);"` 
      : '';

    itemRows += `
      <tr ${highlightStyle}>
        <td><span class="text-bold">${item.id}</span></td>
        <td>${item.name}</td>
        <td><span class="badge badge-todo">${item.category}</span></td>
        <td><span class="text-bold" style="color:${isLowStock ? 'var(--danger)' : 'var(--text-primary)'};">${item.stockCount} ${item.unit}</span></td>
        <td>${item.minThreshold} ${item.unit}</td>
        <td>NT$ ${item.unitPrice}</td>
        <td>${item.location}</td>
        <td>${warningLabel}</td>
      </tr>
    `;
  });

  // 2. Render Stock-In Logs List
  state.inventory.stockInLog.forEach(log => {
    logRows += `
      <tr>
        <td>${log.id}</td>
        <td><span class="text-bold">${log.itemId}</span></td>
        <td>${log.itemName}</td>
        <td class="text-success text-bold">+ ${log.quantity}</td>
        <td>${log.date}</td>
        <td>${log.operator}</td>
        <td>${log.supplier}</td>
      </tr>
    `;
  });

  container.innerHTML = `
    <!-- Top Statistics Summary -->
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-title">${window.atomERP.t('iv_kpi_total')}</div>
        <div class="card-metric">${state.inventory.inventoryItems.length} ${isZh ? '種' : 'Sku(s)'}</div>
        <div class="card-subtext">${window.atomERP.t('iv_kpi_total_sub')}</div>
      </div>
      <div class="card" style="border-left: 4px solid var(--ksda-gold);">
        <div class="card-title text-warning">${window.atomERP.t('iv_kpi_warning')}</div>
        <div class="card-metric text-danger">
          ${state.inventory.inventoryItems.filter(i => i.stockCount < i.minThreshold).length} ${isZh ? '項低水位' : 'Low Stock(s)'}
        </div>
        <div class="card-subtext">${window.atomERP.t('iv_kpi_warning_sub')}</div>
      </div>
    </div>

    <!-- Double Column Layout -->
    <div class="form-grid" style="grid-template-columns: 1fr 2fr; gap: 24px; align-items:stretch;">
      
      <!-- Left side: Stock In form and Scanner simulation -->
      <div class="card" id="stock-in-form-container">
        <h3>${window.atomERP.t('iv_form_title')}</h3>
        <p class="card-subtext" style="margin-bottom: 16px;">${window.atomERP.t('iv_form_sub')}</p>
        
        <!-- Scanner Simulator Bar -->
        <div style="background-color:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--border-radius-sm); padding:12px; margin-bottom:16px; text-align:center;">
          <span style="font-size:0.75rem; font-weight:700; display:block; margin-bottom:8px; color:var(--ksda-dark);">${isZh ? '📲 條碼與 QR Code 模擬感應區' : '📲 Simulated Scanner Induction Zone'}</span>
          <button type="button" class="btn btn-secondary btn-sm" id="barcode-scan-btn" style="width:100%; border-color:var(--ksda-teal);">
            ${window.atomERP.t('iv_btn_scan')}
          </button>
        </div>

        <form id="stock-in-form">
          <div class="form-group" style="margin-bottom:12px;">
            <label for="stk-item-id">${window.atomERP.t('iv_form_item')} <span class="text-danger">*</span></label>
            <select id="stk-item-id" required>
              ${state.inventory.inventoryItems.map(i => `<option value="${i.id}">${i.name} (${i.location})</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom:12px;">
            <label for="stk-qty">${window.atomERP.t('iv_form_qty')} <span class="text-danger">*</span></label>
            <input type="number" id="stk-qty" value="50" min="1" required>
          </div>
          
          <div class="form-group" style="margin-bottom:12px;">
            <label for="stk-supplier">${window.atomERP.t('iv_form_supplier')} <span class="text-danger">*</span></label>
            <input type="text" id="stk-supplier" placeholder="${window.atomERP.t('iv_form_supplier_placeholder')}" required>
          </div>
          
          <div class="form-group" style="margin-bottom:12px;">
            <label for="stk-operator">${isZh ? '進貨收貨點收員' : 'Receiving Operator'}</label>
            <select id="stk-operator">
              ${state.hr.employees.map(e => `<option value="${e.name}">${e.name} (${e.department})</option>`).join('')}
            </select>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top:8px;">${window.atomERP.t('iv_btn_submit')}</button>
        </form>
      </div>

      <!-- Right side: Catalog query and history -->
      <div class="flex-gap" style="flex-direction: column; width: 100%; gap: 20px;">
        
        <!-- Inventory Query list -->
        <div class="card" style="width: 100%;">
          <h3>${window.atomERP.t('iv_list_title')}</h3>
          
          <!-- Filters -->
          <div class="form-grid" style="grid-template-columns: 1fr 1fr; margin: 12px 0;">
            <div class="form-group">
              <input type="text" id="inv-search-input" value="${searchVal}" placeholder="${isZh ? '搜尋品項名稱、編號... (按 Enter 進行搜尋)' : 'Search product name, ID... (Press Enter)'}">
            </div>
            <div class="form-group">
              <select id="inv-cat-select" style="min-height:36px;">
                <option value="all" ${catFilter === 'all' ? 'selected' : ''}>${window.atomERP.t('iv_filter_cat')}</option>
                <option value="${catGifts}" ${catFilter === catGifts ? 'selected' : ''}>${isZh ? '行銷禮品' : 'Marketing Gifts'}</option>
                <option value="${catEquipment}" ${catFilter === catEquipment ? 'selected' : ''}>${isZh ? '辦公設備' : 'Office Equipment'}</option>
                <option value="${catSupplies}" ${catFilter === catSupplies ? 'selected' : ''}>${isZh ? '辦公耗材' : 'Office Supplies'}</option>
              </select>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>${window.atomERP.t('iv_col_id')}</th>
                  <th>${window.atomERP.t('iv_col_name')}</th>
                  <th>${window.atomERP.t('iv_col_cat')}</th>
                  <th>${window.atomERP.t('iv_col_count')}</th>
                  <th>${window.atomERP.t('iv_col_min')}</th>
                  <th>${window.atomERP.t('iv_col_price')}</th>
                  <th>${window.atomERP.t('iv_col_loc')}</th>
                  <th>${isZh ? '狀態' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows || `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">${isZh ? '無此搜尋庫存' : 'No matching inventory found.'}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stock in History log -->
        <div class="card" style="width: 100%;">
          <h3>${window.atomERP.t('iv_log_title')}</h3>
          <div class="table-container" style="margin-top: 12px;">
            <table>
              <thead>
                <tr>
                  <th>${window.atomERP.t('iv_log_col_id')}</th>
                  <th>${window.atomERP.t('iv_col_id')}</th>
                  <th>${window.atomERP.t('iv_log_col_name')}</th>
                  <th>${window.atomERP.t('iv_log_col_qty')}</th>
                  <th>${window.atomERP.t('iv_log_col_date')}</th>
                  <th>${window.atomERP.t('iv_log_col_operator')}</th>
                  <th>${window.atomERP.t('iv_log_col_supplier')}</th>
                </tr>
              </thead>
              <tbody>
                ${logRows || `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">${isZh ? '尚無進貨日記項' : 'No stock-in records found.'}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Simulated Barcode Scanning Overlay Camera Frame -->
    <div id="barcode-scanner-overlay" class="modal-backdrop hidden" style="background-color:rgba(0,0,0,0.85);">
      <div style="border: 2px solid var(--ksda-teal); width:280px; height:280px; border-radius: var(--border-radius); display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative; box-shadow: 0 0 25px var(--ksda-teal); overflow:hidden;">
        <!-- Laser line -->
        <div style="position:absolute; left:0; width:100%; height:2px; background-color:var(--danger); animation: laserScan 2s linear infinite; box-shadow: 0 0 8px var(--danger);"></div>
        <span style="color:#FFF; font-weight:700; font-size:0.85rem; z-index:10; background-color:rgba(0,160,163,0.8); padding:6px 12px; border-radius:20px;">📷 ${isZh ? '正在搜尋標籤條碼中...' : 'Scanning for barcode labels...'}</span>
      </div>
    </div>

    <!-- Scan laser keyframe styling injection -->
    <style>
      @keyframes laserScan {
        0% { top: 0%; }
        50% { top: 100%; }
        100% { top: 0%; }
      }
    </style>
  `;

  // Hooks & listeners
  const searchInput = document.getElementById('inv-search-input');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      state.invSearch = e.target.value;
      renderStockIn(container, state);
    }
  });

  const catSelect = document.getElementById('inv-cat-select');
  catSelect.addEventListener('change', (e) => {
    state.invCatFilter = e.target.value;
    renderStockIn(container, state);
  });

  // Barcode Scanner simulation
  const scanBtn = document.getElementById('barcode-scan-btn');
  const scannerOverlay = document.getElementById('barcode-scanner-overlay');

  scanBtn.addEventListener('click', () => {
    scannerOverlay.classList.remove('hidden');
    
    // Simulate camera searching and beep sound after 1.5s
    setTimeout(async () => {
      scannerOverlay.classList.add('hidden');
      
      // Beep sound simulation & Random picker
      const randomItem = state.inventory.inventoryItems[Math.floor(Math.random() * state.inventory.inventoryItems.length)];
      
      document.getElementById('stk-item-id').value = randomItem.id;
      document.getElementById('stk-qty').value = 50;
      document.getElementById('stk-supplier').value = isZh ? '客製協作總廠' : 'Custom Collab Factory';
      
      window.FormGuard.setDirty(true);
      window.showToast(isZh 
        ? `嗶！掃描成功：感應到 SKU 編號 [${randomItem.id}] | ${randomItem.name}！已自動帶入表單。` 
        : `Beep! Scan successful: SKU [${randomItem.id}] | ${randomItem.name} detected! Auto-filled form.`, 'success');
    }, 1500);
  });

  // Form Guard Change tracking
  const form = document.getElementById('stock-in-form');
  form.addEventListener('input', () => window.FormGuard.setDirty(true));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const itemId = document.getElementById('stk-item-id').value;
    const itemObj = state.inventory.inventoryItems.find(x => x.id === itemId);
    const qty = parseInt(document.getElementById('stk-qty').value);
    const supplier = document.getElementById('stk-supplier').value;
    const operator = document.getElementById('stk-operator').value;

    const newLog = {
      id: `STK-2026-0${state.inventory.stockInLog.length + 1}`,
      itemId,
      itemName: itemObj.name,
      quantity: qty,
      date: new Date().toISOString().split('T')[0],
      operator,
      supplier
    };

    await window.simulateApi(isZh ? '更新庫存量、寫入歷史紀錄中...' : 'Updating inventory levels and logging historical records...');
    
    // Update inventory stock count!
    itemObj.stockCount += qty;
    state.inventory.stockInLog.unshift(newLog);
    
    window.FormGuard.setDirty(false);
    window.showToast(isZh 
      ? `進貨登記成功！已增補 ${itemObj.name} +${qty} ${itemObj.unit}，庫存數已更新。` 
      : `Stock-in logged! Replenished ${itemObj.name} +${qty} ${itemObj.unit}. Inventory levels updated.`, 'success');
    renderStockIn(container, state);
  });
}
