/* atomERP-ui - Utilities & Flow Guides (Global Scope) */

window.atomERP = window.atomERP || {};

window.atomERP.getLocale = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang');
  return lang === 'zh' ? 'zh' : 'en';
};

window.atomERP.t = (key) => {
  const locale = window.atomERP.getLocale();
  const dict = (window.I18N_DICTS && window.I18N_DICTS[locale]) || {};
  return dict[key] !== undefined ? dict[key] : key;
};

window.atomERP.translateDOM = (root = document) => {
  const elements = root.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = window.atomERP.t(key);
    
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', translated);
      } else {
        el.value = translated;
      }
    } else {
      const caret = el.querySelector('.caret');
      if (caret) {
        el.innerHTML = '';
        el.appendChild(document.createTextNode(translated + ' '));
        el.appendChild(caret);
      } else {
        el.textContent = translated;
      }
    }
  });
};

// Global state shorthand
window.getGlobalState = () => window.globalState || {};
window.setGlobalState = (newState) => {
  window.globalState = { ...window.globalState, ...newState };
  // Trigger general update event if registered
  if (window.onGlobalStateChange) {
    window.onGlobalStateChange(window.globalState);
  }
};

/**
 * 1. Toast Notification System
 */
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✔️';
  if (type === 'warning') icon = '⚠️';
  if (type === 'danger') icon = '❌';
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 2. API Loader Spinner
 */
const apiTaskTranslations = {
  '正在讀取本地離線數據庫...': 'Reading local offline database...',
  '擴展至大型集團數據規模中...': 'Expanding to large corporate scale...',
  '重載一般規模數據中...': 'Reloading standard scale data...',
  '重置資料庫為初始設定...': 'Resetting database to initial defaults...',
  '解析並注入上傳之自訂 JSON...': 'Parsing and injecting uploaded custom JSON...',
  '更新庫存量、寫入歷史紀錄中...': 'Updating stock count and logging transaction...',
  '經費公文夾傳遞中...': 'Routing expense claim document...',
  '決行同意，出納撥款，建立會計流水流水帳中...': 'Approving claim, disbursing petty cash, and posting to ledger...',
  '寫入複式記帳日記簿中...': 'Writing double-entry ledger transaction...',
  '錄用建檔中...': 'Saving onboarding employee record...',
  '薪資結構公式分析與試算中...': 'Analyzing and calculating payroll formulas...',
  '發送銀行批次匯款 API 指令...': 'Sending bank batch transfer API commands...',
  '假單發送公文傳遞中...': 'Routing leave request document...',
  '簽核同意、更新假別餘額資料庫中...': 'Approving leave and updating balance database...',
  '退回假單簽呈中...': 'Rejecting leave request document...',
  '公文流程送出中...': 'Submitting travel dispatch request...',
  '核發同意，發送請款草稿至財務部門中...': 'Approving travel and dispatching draft claim to finance...'
};

window.simulateApi = function(taskName) {
  const locale = window.atomERP.getLocale();
  const defaultTask = locale === 'zh' ? '載入數據中...' : 'Loading...';
  const actualTaskName = taskName || defaultTask;
  
  return new Promise((resolve) => {
    const backdrop = document.getElementById('api-loading-backdrop');
    const textEl = document.getElementById('api-loading-text');
    
    if (backdrop && textEl) {
      const prefix = locale === 'zh' ? '模擬 API 連線：' : 'Simulating API Connection: ';
      let displayTask = actualTaskName;
      if (locale === 'en' && apiTaskTranslations[actualTaskName]) {
        displayTask = apiTaskTranslations[actualTaskName];
      }
      textEl.textContent = `${prefix}${displayTask}`;
      backdrop.classList.remove('hidden');
    }
    
    // Random latency between 400ms and 800ms
    const delay = 400 + Math.random() * 400;
    setTimeout(() => {
      if (backdrop) backdrop.classList.add('hidden');
      resolve();
    }, delay);
  });
}

/**
 * 3. Form Exit Guard (防呆警告器)
 */
class FormGuardManager {
  constructor() {
    this.isDirty = false;
    this.pendingUrl = null;
    
    // Bind UI actions
    document.addEventListener('DOMContentLoaded', () => this.initEvents());
  }
  
  initEvents() {
    const stayBtn = document.getElementById('form-guard-stay-btn');
    const leaveBtn = document.getElementById('form-guard-leave-btn');
    
    if (stayBtn) {
      stayBtn.addEventListener('click', () => this.stay());
    }
    
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => this.leave());
    }
  }
  
  setDirty(dirty = true) {
    this.isDirty = dirty;
  }
  
  checkNavigation(targetUrl) {
    if (this.isDirty) {
      this.pendingUrl = targetUrl;
      const modal = document.getElementById('form-guard-modal');
      if (modal) {
        modal.classList.remove('hidden');
      }
      return false; // Intercept
    }
    return true; // Allow
  }
  
  stay() {
    const modal = document.getElementById('form-guard-modal');
    if (modal) modal.classList.add('hidden');
    this.pendingUrl = null;
  }
  
  leave() {
    this.setDirty(false);
    const modal = document.getElementById('form-guard-modal');
    if (modal) modal.classList.add('hidden');
    
    if (this.pendingUrl) {
      window.location.hash = this.pendingUrl;
    }
  }
}

window.FormGuard = new FormGuardManager();

/**
 * 4. Workflow Tutorial Guide Controller (演示引導引擎)
 */
class WorkflowGuideController {
  constructor() {
    this.activeFlow = null;
    this.currentStepIndex = 0;
    this.guideModeActive = true;
    
    // Built-in Guided Flows with translation keys
    this.flows = {
      leaveToPay: {
        titleKey: "leaveToPay_title",
        steps: [
          {
            titleKey: "leaveToPay_step1_title",
            route: "/hr/personnel",
            elementSelector: "#add-employee-trigger-btn, .btn-primary",
            textKey: "leaveToPay_step1_text",
            arrow: "bottom"
          },
          {
            titleKey: "leaveToPay_step2_title",
            route: "/hr/leave",
            elementSelector: "#leave-form-container, form",
            textKey: "leaveToPay_step2_text",
            arrow: "top"
          },
          {
            titleKey: "leaveToPay_step3_title",
            route: "/hr/leave",
            elementSelector: "#pending-leaves-table, .btn-success",
            textKey: "leaveToPay_step3_text",
            arrow: "bottom"
          },
          {
            titleKey: "leaveToPay_step4_title",
            route: "/hr/payroll",
            elementSelector: "#run-payroll-btn",
            textKey: "leaveToPay_step4_text",
            arrow: "bottom"
          }
        ]
      },
      travelToLedger: {
        titleKey: "travelToLedger_title",
        steps: [
          {
            titleKey: "travelToLedger_step1_title",
            route: "/hr/travel",
            elementSelector: "#travel-form-container, form",
            textKey: "travelToLedger_step1_text",
            arrow: "top"
          },
          {
            titleKey: "travelToLedger_step2_title",
            route: "/finance/claims",
            elementSelector: "#claim-form-container, form",
            textKey: "travelToLedger_step2_text",
            arrow: "top"
          },
          {
            titleKey: "travelToLedger_step3_title",
            route: "/finance/claims",
            elementSelector: "#pending-claims-table, .btn-success",
            textKey: "travelToLedger_step3_text",
            arrow: "bottom"
          },
          {
            titleKey: "travelToLedger_step4_title",
            route: "/finance/ledger",
            elementSelector: "#ledger-table-body, tr:first-child",
            textKey: "travelToLedger_step4_text",
            arrow: "bottom"
          }
        ]
      }
    };
  }

  init() {
    const toggle = document.getElementById('guide-mode-checkbox');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        this.guideModeActive = e.target.checked;
        if (!this.guideModeActive) {
          this.clearGuide();
        } else {
          this.refreshGuide();
        }
      });
    }

    const nextBtn = document.getElementById('guide-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    const closeBtn = document.getElementById('guide-tooltip-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.clearGuide());
    }
    
    // Observe window resizing to reposition active bubble
    window.addEventListener('resize', () => {
      if (this.activeFlow && this.guideModeActive) {
        this.positionBubble();
      }
    });
  }

  startFlow(flowId) {
    if (!this.flows[flowId]) return;
    this.activeFlow = flowId;
    this.currentStepIndex = 0;
    this.guideModeActive = true;
    
    const toggle = document.getElementById('guide-mode-checkbox');
    if (toggle) toggle.checked = true;
    
    // Build Topbar Stepper Progress
    this.renderStepper();
    
    // Jump to initial step route
    const initialStep = this.flows[flowId].steps[0];
    if (window.location.hash !== `#${initialStep.route}`) {
      window.location.hash = `#${initialStep.route}`;
    } else {
      this.refreshGuide();
    }
    
    const guideToastFlow = window.atomERP.t('guide_toast_flow') || 'Guided Tour active: ';
    const flowTitle = window.atomERP.t(this.flows[flowId].titleKey);
    window.showToast(`${guideToastFlow}${flowTitle}`, 'warning');
  }

  renderStepper() {
    const stepperContainer = document.getElementById('workflow-stepper');
    const stepperList = document.getElementById('stepper-list');
    if (!stepperContainer || !stepperList || !this.activeFlow) return;

    stepperContainer.classList.remove('hidden');
    stepperList.innerHTML = '';
    
    const flow = this.flows[this.activeFlow];
    flow.steps.forEach((step, idx) => {
      const li = document.createElement('li');
      li.className = 'stepper-item';
      if (idx === this.currentStepIndex) li.classList.add('active');
      else if (idx < this.currentStepIndex) li.classList.add('done');
      
      li.textContent = window.atomERP.t(step.titleKey);
      stepperList.appendChild(li);
    });
  }

  refreshGuide() {
    if (!this.activeFlow || !this.guideModeActive) return;
    
    const flow = this.flows[this.activeFlow];
    const step = flow.steps[this.currentStepIndex];
    
    // Verify if we are on correct route
    const currentRoute = window.location.hash.slice(1);
    if (!currentRoute.startsWith(step.route)) {
      // User wandered off, but we keep guide active or prompt return
      return;
    }

    this.renderStepper();

    // Look for target element
    setTimeout(() => {
      const target = document.querySelector(step.elementSelector);
      if (target) {
        this.showBubble(target, window.atomERP.t(step.textKey), step.arrow);
      } else {
        // Fallback: anchor center screen if target is inside a collapsed tab
        this.showBubble(null, window.atomERP.t(step.textKey), 'bottom');
      }
    }, 100); // Small timeout for dynamic UI generation
  }

  showBubble(targetEl, text, direction = 'bottom') {
    const bubble = document.getElementById('guide-tooltip-bubble');
    const textEl = document.getElementById('guide-tooltip-text');
    const countEl = document.getElementById('guide-step-count');
    
    if (!bubble || !textEl || !countEl) return;
    
    textEl.textContent = text;
    
    const flow = this.flows[this.activeFlow];
    const stepWord = window.atomERP.t('step_word') || (window.atomERP.getLocale() === 'zh' ? '步驟' : 'Step');
    countEl.textContent = `${stepWord} ${this.currentStepIndex + 1}/${flow.steps.length}`;
    
    bubble.classList.remove('hidden');
    
    // Clear old direction classes
    bubble.classList.remove('arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');
    bubble.classList.add(`arrow-${direction}`);
    
    this.activeTarget = targetEl;
    this.activeDirection = direction;
    
    this.positionBubble();
  }

  positionBubble() {
    const bubble = document.getElementById('guide-tooltip-bubble');
    if (!bubble) return;
    
    if (!this.activeTarget) {
      // Center in screen
      bubble.style.position = 'fixed';
      bubble.style.top = '50%';
      bubble.style.left = '50%';
      bubble.style.transform = 'translate(-50%, -50%)';
      // Hide arrow
      const arrow = bubble.querySelector('.guide-tooltip-arrow');
      if (arrow) arrow.style.display = 'none';
      return;
    }
    
    const arrow = bubble.querySelector('.guide-tooltip-arrow');
    if (arrow) arrow.style.display = 'block';
    
    bubble.style.position = 'absolute';
    const rect = this.activeTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    let top = 0;
    let left = 0;
    
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;
    
    if (this.activeDirection === 'bottom') {
      top = rect.bottom + scrollTop + 10;
      left = rect.left + scrollLeft + (rect.width / 2) - 40;
    } else if (this.activeDirection === 'top') {
      top = rect.top + scrollTop - bubbleHeight - 10;
      left = rect.left + scrollLeft + (rect.width / 2) - 40;
    } else if (this.activeDirection === 'left') {
      top = rect.top + scrollTop + (rect.height / 2) - 30;
      left = rect.left + scrollLeft - bubbleWidth - 10;
    } else if (this.activeDirection === 'right') {
      top = rect.top + scrollTop + (rect.height / 2) - 30;
      left = rect.right + scrollLeft + 10;
    }
    
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
    bubble.style.transform = 'none';
  }

  nextStep() {
    const flow = this.flows[this.activeFlow];
    if (this.currentStepIndex < flow.steps.length - 1) {
      this.currentStepIndex++;
      const nextStep = flow.steps[this.currentStepIndex];
      
      if (window.location.hash !== `#${nextStep.route}`) {
        window.location.hash = `#${nextStep.route}`;
      } else {
        this.refreshGuide();
      }
    } else {
      // Flow Complete!
      const guideCongrats = window.atomERP.t('guide_congrats') || 'Success! The guide has successfully concluded.';
      window.showToast(guideCongrats, 'success');
      this.clearGuide();
    }
  }

  clearGuide() {
    this.activeFlow = null;
    this.currentStepIndex = 0;
    
    const bubble = document.getElementById('guide-tooltip-bubble');
    if (bubble) bubble.classList.add('hidden');
    
    const stepperContainer = document.getElementById('workflow-stepper');
    if (stepperContainer) stepperContainer.classList.add('hidden');
  }
}

window.WorkflowGuide = new WorkflowGuideController();

/**
 * 5. Global Contact Drawer Controller
 */
window.showContactDrawer = function(empId) {
  const state = window.globalState || {};
  const emp = state.hr.employees.find(e => e.id === empId);
  if (!emp) return;

  const drawer = document.getElementById('dir-drawer');
  const drawerBody = document.getElementById('drawer-body');
  if (!drawer || !drawerBody) return;

  document.getElementById('drawer-name').textContent = emp.name;
  
  const idLbl = window.atomERP.t('drawer_id');
  const deptLbl = window.atomERP.t('drawer_dept');
  const titleLbl = window.atomERP.t('drawer_title_lbl');
  const emailLbl = window.atomERP.t('drawer_email');
  const phoneLbl = window.atomERP.t('drawer_phone');
  const dateLbl = window.atomERP.t('drawer_date');
  const leaveLbl = window.atomERP.t('drawer_leave');
  const sickLbl = window.atomERP.t('drawer_sick');
  const daysLbl = window.atomERP.t('days');

  drawerBody.innerHTML = `
    <div class="logo-box" style="margin: 0 auto 20px; width:70px; height:70px; font-size:1.8rem; background-color:var(--ksda-teal-light); color:var(--ksda-teal); box-shadow:none;">
      ${emp.name.slice(0, 1)}
    </div>
    <table style="width:100%; font-size:0.85rem;">
      <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0; font-weight:600; width:40%;">${idLbl}</td><td>${emp.id}</td></tr>
      <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0; font-weight:600;">${deptLbl}</td><td>${emp.department}</td></tr>
      <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0; font-weight:600;">${titleLbl}</td><td>${emp.title}</td></tr>
      <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0; font-weight:600;">${emailLbl}</td><td>${emp.email}</td></tr>
      <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0; font-weight:600;">${phoneLbl}</td><td>${emp.phone}</td></tr>
      <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0; font-weight:600;">${dateLbl}</td><td>${emp.joinDate}</td></tr>
      <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0; font-weight:600;">${leaveLbl}</td><td>${emp.leaveBalance.annual} ${daysLbl}</td></tr>
      <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0; font-weight:600;">${sickLbl}</td><td>${emp.leaveBalance.sick} ${daysLbl}</td></tr>
    </table>
  `;
  drawer.classList.remove('hidden');
};

// Bind global drawer close listener on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-drawer-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const drawer = document.getElementById('dir-drawer');
      if (drawer) drawer.classList.add('hidden');
    });
  }
});
