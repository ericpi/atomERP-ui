/* atomERP-ui - Sales Management Component (Global Scope) */

window.renderSales = function(subView, container) {
  const state = window.globalState || {};
  
  if (subView === 'performance') {
    renderPerformance(container, state);
  } else if (subView === 'dashboard') {
    renderDashboard(container, state);
  }
}

/**
 * 1. 業務業績統計表格 (Performance Table)
 */
function renderPerformance(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  const deptBD = isZh ? "商業開發部" : "Business Development";
  const deptSales = isZh ? "業務推廣部" : "Sales & Marketing";

  const searchVal = state.salesSearch || '';
  const deptFilter = state.salesDeptFilter || 'all';
  const sortCol = state.salesSortCol || 'annual';
  const sortOrder = state.salesSortOrder || 'desc'; // 'asc' or 'desc'
  
  let filtered = state.sales.salesPerformance.filter(rep => {
    const matchesSearch = rep.repName.includes(searchVal) || rep.repId.includes(searchVal);
    const matchesDept = deptFilter === 'all' || rep.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Sorting logic
  filtered.sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];
    
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const tableRows = filtered.map(rep => {
    return `
      <tr>
        <td><span class="text-bold">${rep.repId}</span></td>
        <td>${rep.repName}</td>
        <td><span class="badge badge-todo">${rep.department}</span></td>
        <td>NT$ ${rep.monthly[4].toLocaleString()}</td> <!-- May -->
        <td>NT$ ${rep.monthly[5].toLocaleString()} <!-- June -->
        <td>NT$ ${rep.quarterly[1].toLocaleString()}</td> <!-- Q2 -->
        <td><span class="text-bold" style="color:var(--ksda-teal);">NT$ ${rep.annual.toLocaleString()}</span></td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="card">
      <div class="flex-between" style="margin-bottom: 20px;">
        <div>
          <h3>${window.atomERP.t('sl_title')}</h3>
          <p class="card-subtext">${window.atomERP.t('sl_sub')}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="form-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 20px;">
        <div class="form-group">
          <label>${isZh ? '搜尋業務專員' : 'Search Sales Rep'}</label>
          <input type="text" id="sales-search-input" value="${searchVal}" placeholder="${window.atomERP.t('sl_search_placeholder')}">
        </div>
        <div class="form-group">
          <label>${window.atomERP.t('sl_filter_dept')}</label>
          <select id="sales-dept-select">
            <option value="all" ${deptFilter === 'all' ? 'selected' : ''}>${window.atomERP.t('hr_dept_all')}</option>
            <option value="${deptBD}" ${deptFilter === deptBD ? 'selected' : ''}>${window.atomERP.t('hr_dept_bd')}</option>
            <option value="${deptSales}" ${deptFilter === deptSales ? 'selected' : ''}>${window.atomERP.t('hr_dept_sales')}</option>
          </select>
        </div>
      </div>

      <!-- Table Container -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th data-sort="repId">${window.atomERP.t('sl_col_id')} ${sortCol === 'repId' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
              <th data-sort="repName">${window.atomERP.t('sl_col_name')} ${sortCol === 'repName' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
              <th data-sort="department">${window.atomERP.t('sl_col_dept')} ${sortCol === 'department' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
              <th>${isZh ? window.atomERP.t('sl_col_may') + '業績' : window.atomERP.t('sl_col_may') + ' Sales'}</th>
              <th>${isZh ? window.atomERP.t('sl_col_jun') + '業績' : window.atomERP.t('sl_col_jun') + ' Sales'}</th>
              <th data-sort="quarterly">${window.atomERP.t('sl_col_q2')} ${sortCol === 'quarterly' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
              <th data-sort="annual">${window.atomERP.t('sl_col_annual')} ${sortCol === 'annual' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">${isZh ? '無搜尋相符之業務資料' : 'No matching sales records found.'}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Hooks
  const searchInput = document.getElementById('sales-search-input');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      state.salesSearch = e.target.value;
      renderPerformance(container, state);
    }
  });

  const deptSelect = document.getElementById('sales-dept-select');
  deptSelect.addEventListener('change', (e) => {
    state.salesDeptFilter = e.target.value;
    renderPerformance(container, state);
  });

  // Sort clicks
  container.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (state.salesSortCol === col) {
        state.salesSortOrder = state.salesSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.salesSortCol = col;
        state.salesSortOrder = 'desc'; // Default desc on new col
      }
      renderPerformance(container, state);
    });
  });
}

/**
 * 2. 銷售視覺化儀表板 (Sales Dashboard)
 */
function renderDashboard(container, state) {
  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  const target = state.sales.salesTargets;
  const achievedPercent = Math.round((target.currentAchieved / target.companyAnnual) * 100);

  // Group monthly sales data for Trend Line graph
  const repList = state.sales.salesPerformance;
  const monthlySums = [0, 0, 0, 0, 0, 0];
  
  repList.forEach(rep => {
    for (let i = 0; i < 6; i++) {
      monthlySums[i] += rep.monthly[i];
    }
  });

  // Find maximum monthly sum to scale SVG chart dynamically
  const maxVal = Math.max(...monthlySums) || 1;
  const peakLabel = maxVal >= 10000 ? (isZh ? (maxVal / 10000).toFixed(0) + '萬' : (maxVal / 10000).toFixed(0) + '0k') : maxVal.toString();
  const midLabel = maxVal >= 10000 ? (isZh ? (maxVal / 2 / 10000).toFixed(0) + '萬' : (maxVal / 2 / 10000).toFixed(0) + '0k') : (maxVal / 2).toString();

  // Group department totals for Donut chart
  let deptOneSum = 0;
  let deptTwoSum = 0;
  repList.forEach(rep => {
    if (rep.department === '商業開發部' || rep.department === 'Business Development') {
      deptOneSum += rep.annual;
    } else {
      deptTwoSum += rep.annual;
    }
  });
  
  const totalAnnual = deptOneSum + deptTwoSum;
  const deptOnePercent = totalAnnual > 0 ? Math.round((deptOneSum / totalAnnual) * 100) : 50;
  const deptTwoPercent = 100 - deptOnePercent;

  container.innerHTML = `
    <!-- Top Progress Indicators -->
    <div class="card">
      <h3 style="margin-bottom:12px;">${window.atomERP.t('sd_title')}</h3>
      <div class="flex-between" style="font-size:0.85rem; font-weight:700; margin-bottom:8px;">
        <span>${window.atomERP.t('sd_achieved')}${target.currentAchieved.toLocaleString()}</span>
        <span>${window.atomERP.t('sd_target')}${target.companyAnnual.toLocaleString()}</span>
      </div>
      <div style="width:100%; height:16px; background-color:var(--bg-secondary); border-radius:8px; overflow:hidden; display:flex; align-items:stretch; border:1px solid var(--border-color);">
        <div style="width:${achievedPercent}%; height:100%; background:linear-gradient(90deg, var(--ksda-teal), #2EC4B6); transition:var(--transition-normal); display:flex; align-items:center; justify-content:flex-end; padding-right:8px;">
          <span style="font-size:0.65rem; color:#fff; font-weight:800;">${achievedPercent}%</span>
        </div>
      </div>
    </div>

    <!-- Charts Row Grid -->
    <div class="form-grid" style="grid-template-columns: 1.5fr 1fr; gap: 24px; align-items:stretch;">
      
      <!-- Trend Line Chart Card -->
      <div class="card" style="display:flex; flex-direction:column; min-height:360px;">
        <h3>${window.atomERP.t('sd_chart_trend')}</h3>
        <p class="card-subtext" style="margin-bottom:20px;">${window.atomERP.t('sd_chart_trend_sub')}</p>
        
        <!-- Interactive Inline SVG Line Graph -->
        <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; position:relative;" id="line-chart-box">
          <svg viewBox="0 0 500 220" style="width:100%; height:100%;">
            <!-- Grid Lines -->
            <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f3f5" stroke-width="1" />
            <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f3f5" stroke-width="1" />
            <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f3f5" stroke-width="1" />
            <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f3f5" stroke-width="1" />
            <line x1="40" y1="180" x2="480" y2="180" stroke="#E2E8F0" stroke-width="1" />
            
            <!-- X Axis Marks -->
            <text x="40" y="196" fill="var(--text-muted)" font-size="8" text-anchor="middle">${isZh ? '1月' : 'Jan'}</text>
            <text x="128" y="196" fill="var(--text-muted)" font-size="8" text-anchor="middle">${isZh ? '2月' : 'Feb'}</text>
            <text x="216" y="196" fill="var(--text-muted)" font-size="8" text-anchor="middle">${isZh ? '3月' : 'Mar'}</text>
            <text x="304" y="196" fill="var(--text-muted)" font-size="8" text-anchor="middle">${isZh ? '4月' : 'Apr'}</text>
            <text x="392" y="196" fill="var(--text-muted)" font-size="8" text-anchor="middle">${isZh ? '5月' : 'May'}</text>
            <text x="480" y="196" fill="var(--text-muted)" font-size="8" text-anchor="middle">${isZh ? '6月' : 'Jun'}</text>
            
            <!-- Y Axis Label -->
            <text x="32" y="24" fill="var(--text-muted)" font-size="8" text-anchor="end">${peakLabel}</text>
            <text x="32" y="104" fill="var(--text-muted)" font-size="8" text-anchor="end">${midLabel}</text>
            <text x="32" y="184" fill="var(--text-muted)" font-size="8" text-anchor="end">0</text>
            
            <!-- SVG Polyline Trend -->
            <polyline
              fill="none"
              stroke="var(--ksda-teal)"
              stroke-width="3"
              points="
                40,${180 - (monthlySums[0]/maxVal)*160}
                128,${180 - (monthlySums[1]/maxVal)*160}
                216,${180 - (monthlySums[2]/maxVal)*160}
                304,${180 - (monthlySums[3]/maxVal)*160}
                392,${180 - (monthlySums[4]/maxVal)*160}
                480,${180 - (monthlySums[5]/maxVal)*160}
              "
            />
            
            <!-- Dot nodes -->
            ${monthlySums.map((sum, idx) => {
              const cx = 40 + idx * 88;
              const cy = 180 - (sum / maxVal) * 160;
              const monthsArray = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'];
              const monthLabel = isZh ? (idx+1) + '月份業績' : window.atomERP.t('sl_col_' + monthsArray[idx]) + ' Sales';
              return `
                <circle cx="${cx}" cy="${cy}" r="5" fill="#FFFFFF" stroke="var(--ksda-teal)" stroke-width="3" class="chart-dot" data-val="NT$ ${sum.toLocaleString()}" data-month="${monthLabel}"/>
              `;
            }).join('')}
          </svg>
          
          <!-- Visual Overlay Tooltip for trend dots -->
          <div id="chart-hover-tip" style="position:absolute; background-color:var(--ksda-dark); color:#FFFFFF; font-size:0.75rem; padding:8px 12px; border-radius:8px; pointer-events:none; display:none; z-index:10; white-space:nowrap;"></div>
        </div>
      </div>

      <!-- Donut Pie Chart Card -->
      <div class="card" style="display:flex; flex-direction:column; min-height:360px;">
        <h3>${window.atomERP.t('sd_chart_pie')}</h3>
        <p class="card-subtext" style="margin-bottom:20px;">${window.atomERP.t('sd_chart_pie_sub')}</p>
        
        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px;">
          <!-- SVG Donut Chart -->
          <svg width="150" height="150" viewBox="0 0 42 42" class="donut">
            <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#FFF"></circle>
            <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--bg-secondary)" stroke-width="5.5"></circle>
            
            <!-- Teal Segments -->
            <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--ksda-teal)" stroke-width="5.5" stroke-dasharray="${deptOnePercent} ${100 - deptOnePercent}" stroke-dashoffset="25"></circle>
            <!-- Gold Segment -->
            <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--ksda-gold)" stroke-width="5.5" stroke-dasharray="${deptTwoPercent} ${100 - deptTwoPercent}" stroke-dashoffset="${125 - deptOnePercent}"></circle>
            
            <g class="chart-text">
              <text x="50%" y="54%" class="chart-number" text-anchor="middle" font-size="6" font-weight="700" fill="var(--ksda-dark)"></text>
            </g>
          </svg>
 
           <!-- Label Legends -->
          <div style="width:100%; display:flex; flex-direction:column; gap:10px; font-size:0.75rem;">
            <div class="flex-between">
              <div class="flex-gap" style="gap:6px;">
                <span style="width:12px; height:12px; border-radius:50%; background-color:var(--ksda-teal); display:inline-block;"></span>
                <span>${window.atomERP.t('hr_dept_bd')}</span>
              </div>
              <span class="text-bold">${deptOnePercent}% (NT$ ${deptOneSum.toLocaleString()})</span>
            </div>
            <div class="flex-between">
              <div class="flex-gap" style="gap:6px;">
                <span style="width:12px; height:12px; border-radius:50%; background-color:var(--ksda-gold); display:inline-block;"></span>
                <span>${window.atomERP.t('hr_dept_sales')}</span>
              </div>
              <span class="text-bold">${deptTwoPercent}% (NT$ ${deptTwoSum.toLocaleString()})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Hook hover events to dots
  const tip = document.getElementById('chart-hover-tip');
  container.querySelectorAll('.chart-dot').forEach(dot => {
    dot.addEventListener('mouseover', (e) => {
      const val = dot.getAttribute('data-val');
      const month = dot.getAttribute('data-month');
      
      tip.innerHTML = `<span style="font-weight:700; color:var(--ksda-gold);">${month}</span><br>${val}`;
      tip.style.display = 'block';
      
      // Position tooltip relative to chart box
      const chartBox = document.getElementById('line-chart-box');
      const boxRect = chartBox.getBoundingClientRect();
      const dotRect = dot.getBoundingClientRect();
      
      tip.style.left = `${dotRect.left - boxRect.left + 10}px`;
      tip.style.top = `${dotRect.top - boxRect.top - 40}px`;
    });
    
    dot.addEventListener('mouseout', () => {
      tip.style.display = 'none';
    });
  });
}
