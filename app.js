/* atomERP-ui - Central Application Controller & Router (Global Scope) */

// Setup routing paths dictionary
const routes = {
  hr: window.renderHR,
  finance: window.renderFinance,
  project: window.renderProject,
  sales: window.renderSales,
  inventory: window.renderInventory
};

// Global Initialized Flag
let initialDataBackup = null;

/**
 * 1. Load data from global mock variables (bypasses CORS local fetch blocks)
 */
async function loadInitialData() {
  const locale = window.atomERP.getLocale();
  await window.simulateApi('正在讀取本地離線數據庫...');
  
  try {
    const hr = JSON.parse(JSON.stringify(window.MOCK_HR_DATA[locale] || window.MOCK_HR_DATA.en || window.MOCK_HR_DATA));
    const finance = JSON.parse(JSON.stringify(window.MOCK_FINANCE_DATA[locale] || window.MOCK_FINANCE_DATA.en || window.MOCK_FINANCE_DATA));
    const project = JSON.parse(JSON.stringify(window.MOCK_PROJECT_DATA[locale] || window.MOCK_PROJECT_DATA.en || window.MOCK_PROJECT_DATA));
    const sales = JSON.parse(JSON.stringify(window.MOCK_SALES_DATA[locale] || window.MOCK_SALES_DATA.en || window.MOCK_SALES_DATA));
    const inventory = JSON.parse(JSON.stringify(window.MOCK_INVENTORY_DATA[locale] || window.MOCK_INVENTORY_DATA.en || window.MOCK_INVENTORY_DATA));

    const state = {
      hr,
      finance,
      project,
      sales,
      inventory,
      // Keep filter state persistent across clicks
      personnelSearch: '',
      personnelDeptFilter: 'all',
      dirSearch: '',
      salesSearch: '',
      salesDeptFilter: 'all',
      salesSortCol: 'annual',
      salesSortOrder: 'desc',
      invSearch: '',
      invCatFilter: 'all',
      project: {
        projects: project.projects,
        viewMode: 'kanban',
        filterAssignee: 'all'
      }
    };

    window.globalState = state;
    
    // Backup for data resets
    if (!initialDataBackup) {
      initialDataBackup = JSON.stringify(state);
    }
    
    window.showToast(window.atomERP.t('toast_init_success'), 'success');
  } catch (error) {
    console.error('Error initializing data cache:', error);
    window.showToast(window.atomERP.t('toast_init_fail'), 'danger');
  }
}

window.getCurrentUser = () => {
  try {
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) return JSON.parse(userJson);
  } catch (e) {
    console.warn('sessionStorage is not accessible:', e);
  }
  return window.currentUser || null;
};

/**
 * 2. Route Dispatcher
 */
function handleRouting() {
  const user = window.getCurrentUser();
  if (!user) {
    // Hide main application shell
    document.getElementById('sidebar').classList.add('hidden');
    document.querySelector('.main-layout').classList.add('hidden');
    
    // Show login page container
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) {
      loginContainer.classList.remove('hidden');
      window.atomERP.translateDOM(loginContainer);
    }
    return;
  }

  // Show main application shell
  document.getElementById('sidebar').classList.remove('hidden');
  document.querySelector('.main-layout').classList.remove('hidden');
  
  const loginContainer = document.getElementById('login-container');
  if (loginContainer) {
    loginContainer.classList.add('hidden');
  }

  // Set topbar status to current logged-in user
  const statusTextEl = document.getElementById('status-indicator-text');
  if (statusTextEl) {
    statusTextEl.textContent = `${user.name} (${user.id})`;
    statusTextEl.removeAttribute('data-i18n');
  }

  const hash = window.location.hash || '#/hr/personnel';
  
  // Format check: #/module/subview
  const parts = hash.split('/');
  if (parts.length < 3) {
    window.location.hash = '#/hr/personnel';
    return;
  }

  const module = parts[1];
  const subView = parts[2];
  
  // 1. Highlight active navigation links in sidebar
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.getElementById(`nav-${module}-${subView}`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  // 2. Render dynamic Breadcrumbs & View Titles
  updateBreadcrumbs(module, subView);

  // 3. Render Module viewport
  const viewport = document.getElementById('app-viewport');
  if (viewport && routes[module]) {
    // Clear old HTML
    viewport.innerHTML = '';
    
    // Call matching modular render function
    routes[module](subView, viewport);
    
    // Translate DOM elements (like sidebar active states or headers)
    window.atomERP.translateDOM();
    
    // 4. Update guided tours bubble anchor if active
    if (window.WorkflowGuide.activeFlow) {
      window.WorkflowGuide.refreshGuide();
    }
  }
}

const stripEmoji = (str) => {
  if (!str) return '';
  return str.replace(/^[👤💵📅✈️📖🧾📊📋📈🖥️📦]\s*/u, '').trim();
};

function updateBreadcrumbs(module, subView) {
  const breadcrumbs = document.getElementById('breadcrumbs');
  const viewTitle = document.getElementById('view-title');
  if (!breadcrumbs || !viewTitle) return;

  const names = {
    hr: {
      group: window.atomERP.t('nav_title_hr'),
      personnel: window.atomERP.t('nav_hr_personnel'),
      payroll: window.atomERP.t('nav_hr_payroll'),
      leave: window.atomERP.t('nav_hr_leave'),
      travel: window.atomERP.t('nav_hr_travel'),
      directory: window.atomERP.t('nav_hr_directory')
    },
    finance: {
      group: window.atomERP.t('nav_title_finance'),
      claims: window.atomERP.t('nav_finance_claims'),
      ledger: window.atomERP.t('nav_finance_ledger')
    },
    project: {
      group: window.atomERP.t('nav_title_project'),
      board: window.atomERP.t('nav_project_board')
    },
    sales: {
      group: window.atomERP.t('nav_title_sales'),
      performance: window.atomERP.t('nav_sales_performance'),
      dashboard: window.atomERP.t('nav_sales_dashboard')
    },
    inventory: {
      group: window.atomERP.t('nav_title_inventory'),
      stockin: window.atomERP.t('nav_inventory_stockin')
    }
  };

  const moduleData = names[module];
  if (moduleData) {
    const groupName = stripEmoji(moduleData.group);
    const subViewName = stripEmoji(moduleData[subView] || '');
    
    breadcrumbs.innerHTML = `
      <span>${window.atomERP.t('home')}</span> &gt; 
      <span>${groupName}</span> &gt; 
      <span class="active">${subViewName}</span>
    `;
    viewTitle.textContent = subViewName;
  }
}

/**
 * 3. Scale up dataset (Large corporate scale simulation)
 */
async function scaleUpData() {
  await window.simulateApi('擴展至大型集團數據規模中...');
  
  const state = window.globalState;
  if (!state) return;

  const locale = window.atomERP.getLocale();
  const isZh = locale === 'zh';
  
  const names = isZh 
    ? ['黃志豪', '徐美華', '廖大偉', '曾淑惠', '江明憲', '蔡培元', '董麗娟', '謝建國', '沈靜宜', '潘世勳']
    : ['David Huang', 'Amy Hsu', 'James Liao', 'Betty Tseng', 'Kevin Chiang', 'Peter Tsai', 'Helen Dong', 'George Hsieh', 'Grace Shen', 'Sean Pan'];
    
  const depts = isZh
    ? ['軟體研發部', '業務推廣部', '營運行政部', '財務會計部', '商業開發部']
    : ['R&D Department', 'Sales & Marketing', 'Operations & Admin', 'Finance Department', 'Business Development'];
    
  const titles = isZh
    ? ['技術副總', '高級專員', '行政秘書', '出納人員', 'UI設計師', '資安工程師']
    : ['VP of Technology', 'Senior Specialist', 'Administrative Secretary', 'Cashier', 'UI Designer', 'Security Engineer'];

  for (let i = 1; i <= 25; i++) {
    const rName = names[Math.floor(Math.random() * names.length)] + (isZh ? (i % 3 === 0 ? '豪' : '恩') : '');
    const rDept = depts[Math.floor(Math.random() * depts.length)];
    const rTitle = titles[Math.floor(Math.random() * titles.length)];
    const baseSal = 35000 + Math.floor(Math.random() * 65000);
    
    state.hr.employees.push({
      id: `EMP${100 + i}`,
      name: rName,
      department: rDept,
      title: rTitle,
      email: `emp${100+i}@mockup-erp.org`,
      phone: `09${Math.floor(10 + Math.random() * 89)}-${Math.floor(100 + Math.random()*899)}-${Math.floor(100+Math.random()*899)}`,
      joinDate: `2024-0${Math.floor(1 + Math.random() * 8)}-12`,
      salary: { base: baseSal, bonus: 0, allowance: 0 },
      leaveBalance: { annual: 14, sick: 30, personal: 14 }
    });
  }

  // Multiply sales performance values to millions
  state.sales.salesPerformance.forEach(rep => {
    rep.monthly = rep.monthly.map(v => v * 4.5);
    rep.annual = rep.monthly.reduce((acc, curr) => acc + curr, 0);
    rep.quarterly = [
      rep.monthly[0] + rep.monthly[1] + rep.monthly[2],
      rep.monthly[3] + rep.monthly[4] + rep.monthly[5],
      0, 0
    ];
  });
  
  state.sales.salesTargets.companyAnnual = 50000000;
  state.sales.salesTargets.currentAchieved = state.sales.salesPerformance.reduce((acc, r) => acc + r.annual, 0);

  // Auto trigger viewport update
  handleRouting();
  window.showToast(window.atomERP.t('toast_scale'), 'success');
}

/**
 * 4. App bootstrapping and Event bindings
 */
async function bootstrap() {
  // Init Tutorial Guide System
  window.WorkflowGuide.init();
  
  // Load mock data
  await loadInitialData();
  
  // Translate main document static shell
  window.atomERP.translateDOM();
  
  // Initial routing
  handleRouting();

  // Intercept Navigation changes for FormGuard Warning
  const hashChangeListener = (e) => {
    const nextUrl = window.location.hash;
    const oldUrl = e.oldURL ? '#' + e.oldURL.split('#')[1] : '';
    
    if (!window.FormGuard.checkNavigation(nextUrl)) {
      // Revert URL hash silently
      window.removeEventListener('hashchange', hashChangeListener);
      window.location.hash = oldUrl;
      // Re-add listener
      setTimeout(() => window.addEventListener('hashchange', hashChangeListener), 100);
    } else {
      handleRouting();
    }
  };
  window.addEventListener('hashchange', hashChangeListener);

  // Set up topbar actions & Dropdowns
  const dataBtn = document.getElementById('data-btn');
  const dropdown = document.getElementById('data-dropdown');
  
  if (dataBtn && dropdown) {
    dataBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
  }

  // Language Dropdown
  const langBtn = document.getElementById('lang-btn');
  const langDropdown = document.getElementById('lang-dropdown');
  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });
  }

  document.addEventListener('click', () => {
    if (dropdown) dropdown.classList.remove('open');
    if (langDropdown) langDropdown.classList.remove('open');
  });

  // Language Switcher Handlers
  const btnLangEn = document.getElementById('btn-lang-en');
  const btnLangZh = document.getElementById('btn-lang-zh');
  
  const setLanguage = (lang) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('lang', lang);
    const hash = window.location.hash;
    window.location.href = window.location.pathname + '?' + searchParams.toString() + hash;
  };

  if (btnLangEn) {
    btnLangEn.addEventListener('click', () => setLanguage('en'));
  }
  if (btnLangZh) {
    btnLangZh.addEventListener('click', () => setLanguage('zh'));
  }

  // Scale buttons
  const btnScaleNormal = document.getElementById('btn-data-scale-normal');
  if (btnScaleNormal) {
    btnScaleNormal.addEventListener('click', async () => {
      if (initialDataBackup) {
        await window.simulateApi('重載一般規模數據中...');
        window.globalState = JSON.parse(initialDataBackup);
        handleRouting();
        window.showToast(window.atomERP.t('toast_reset') || '已重載為標準模擬數據。', 'success');
      }
    });
  }

  const btnScaleLarge = document.getElementById('btn-data-scale-large');
  if (btnScaleLarge) {
    btnScaleLarge.addEventListener('click', scaleUpData);
  }

  const btnReset = document.getElementById('btn-data-reset');
  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      if (initialDataBackup) {
        await window.simulateApi('重置資料庫為初始設定...');
        window.globalState = JSON.parse(initialDataBackup);
        window.FormGuard.setDirty(false);
        handleRouting();
        window.showToast(window.atomERP.t('toast_reset'), 'success');
      }
    });
  }

  // Custom JSON data Uploader
  const jsonUpload = document.getElementById('json-upload-input');
  if (jsonUpload) {
    jsonUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const customData = JSON.parse(event.target.result);
          
          // Validation check
          if (!customData.hr || !customData.finance || !customData.sales) {
            window.showToast(window.atomERP.t('toast_upload_fail_format'), 'danger');
            return;
          }

          await window.simulateApi('解析並注入上傳之自訂 JSON...');
          
          window.globalState = {
            ...window.globalState,
            ...customData
          };
          
          handleRouting();
          window.showToast(window.atomERP.t('toast_upload_success'), 'success');
        } catch (err) {
          window.showToast(window.atomERP.t('toast_upload_fail_parse'), 'danger');
        }
      };
      reader.readAsText(file);
    });
  }

  // Intercept Sidebar link clicks to hook FormGuard
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetHash = link.getAttribute('href');
      if (!window.FormGuard.checkNavigation(targetHash)) {
        e.preventDefault(); // Block immediate routing
      }
    });
  });

  // Add sample Guided Flows triggers on sidebar footer or topbar context
  const breadcrumbs = document.getElementById('breadcrumbs');
  if (breadcrumbs) {
    breadcrumbs.style.cursor = 'pointer';
    breadcrumbs.title = window.atomERP.getLocale() === 'zh' ? '點擊選擇展示流程引導' : 'Click to select guided workflow tour';
    
    breadcrumbs.addEventListener('click', (e) => {
      // Prompt choices via confirm popup
      const flowSelect = confirm(window.atomERP.t('guide_tour_alert'));
      if (flowSelect) {
        window.WorkflowGuide.startFlow('leaveToPay');
      } else {
        window.WorkflowGuide.startFlow('travelToLedger');
      }
    });
  }

  // Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted!');
      try {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (!emailInput || !passwordInput) {
          console.error('Email or password input element not found in DOM!');
          return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        console.log('Attempting login for email:', email);

        if (!window.globalState || !window.globalState.hr || !window.globalState.hr.employees) {
          console.error('window.globalState is not fully initialized!');
          window.showToast('系統資料載入中，請稍候。', 'danger');
          return;
        }

        // Find the employee with this email in the active database
        let employee = window.globalState.hr.employees.find(
          emp => emp.email && emp.email.toLowerCase() === email.toLowerCase()
        );
        
        // Fallback for demo@mockup-erp.org in English locale
        if (!employee && email.toLowerCase() === 'demo@mockup-erp.org') {
          employee = window.globalState.hr.employees.find(emp => emp.id === 'EMP001');
        }

        if (employee && password === '123') {
          console.log('Credentials valid, user resolved:', employee.name, employee.id);
          await window.simulateApi(window.atomERP.getLocale() === 'zh' ? '驗證帳密並登入中...' : 'Authenticating credentials...');
          
          try {
            sessionStorage.setItem('currentUser', JSON.stringify(employee));
          } catch (storageErr) {
            console.warn('Unable to write to sessionStorage:', storageErr);
          }
          window.currentUser = employee; // Memory-based session fallback
          
          window.showToast(window.atomERP.t('login_success'), 'success');
          
          // Clear password input
          passwordInput.value = '';
          
          // Re-route to show the normal system
          handleRouting();
        } else {
          console.warn('Login verification failed. employee found =', !!employee, 'password matches =', password === '123');
          // Show error dialog
          const errorModal = document.getElementById('login-error-modal');
          if (errorModal) {
            errorModal.classList.remove('hidden');
            window.atomERP.translateDOM(errorModal);
          } else {
            window.showToast(window.atomERP.t('login_failed'), 'danger');
          }
        }
      } catch (err) {
        console.error('Runtime error during form submission:', err);
        const errorModal = document.getElementById('login-error-modal');
        if (errorModal) {
          errorModal.classList.remove('hidden');
          window.atomERP.translateDOM(errorModal);
        } else {
          window.showToast('登入失敗：程式異常，請檢查主控台。', 'danger');
        }
      }
    });
  }

  // Login Error Modal Close Button
  const loginErrorCloseBtn = document.getElementById('login-error-close-btn');
  if (loginErrorCloseBtn) {
    loginErrorCloseBtn.addEventListener('click', () => {
      const modal = document.getElementById('login-error-modal');
      if (modal) {
        modal.classList.add('hidden');
      }
    });
  }

  // Logout Action
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      try {
        sessionStorage.removeItem('currentUser');
      } catch (e) {
        console.warn('sessionStorage block on removeItem:', e);
      }
      window.currentUser = null;
      
      // Reset status indicator attributes
      const statusTextEl = document.getElementById('status-indicator-text');
      if (statusTextEl) {
        statusTextEl.setAttribute('data-i18n', 'api_online');
        statusTextEl.textContent = window.atomERP.t('api_online');
      }
      handleRouting();
    });
  }

  // Click on Status Indicator to display Profile Drawer
  const statusIndicator = document.getElementById('status-indicator');
  if (statusIndicator) {
    statusIndicator.addEventListener('click', () => {
      const user = window.getCurrentUser();
      if (user) {
        window.showContactDrawer(user.id);
      }
    });
  }
}

// Bootstrap!
document.addEventListener('DOMContentLoaded', bootstrap);
