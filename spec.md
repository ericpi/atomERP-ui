# atomERP-ui — 系統規格書 (System Specification)

本文件定義了一套用於展示與流程溝通之純前端 ERP 系統 Mockup 規格。此系統旨在以高品質的工業風視覺介面，提供完整的業務功能流程演示，無需真實的後端資料庫與伺服器，所有資料流皆透過靜態 JS/JSON 載入，並在前端以模擬 API 延遲與邏輯狀態進行變更。

---

## 一、 設計風格與美術規範 (Visual & Design System)

設計語言採 **「明亮、工業風、精緻質感」** 路線。結合細緻邊框、現代無襯線字體、輕量毛玻璃 (Glassmorphism) 以及精心規劃的微互動。

### 1. 核心配色 (Color Palette)

* **品牌主色 (Primary Accent - Teal):** `#00A0A3` 
  * 應用於：左側主導航選單、頂部標題列裝飾、主按鈕 (Primary Button)、進行中工作流程步驟 (Active Steps)、主要聚焦邊框。
  * HSL 對應：`hsl(181, 100%, 32%)`
  * 懸停色：`#008183`，微量背景：`rgba(0, 160, 165, 0.08)`
* **品牌輔助色 (Secondary Highlight - Gold):** `#FBB042`
  * 應用於：狀態提示 (Warning)、待覆核狀態標籤、甘特圖里程碑、重要流程提示。
  * HSL 對應：`hsl(36, 97%, 62%)`
  * 懸停色：`#e59929`，微量背景：`rgba(251, 176, 66, 0.08)`
* **深色中性色 (Neutral Dark):** `#424142`
  * 應用於：主標題、導航文字、內文主要文字、重元素背景。
* **中度中性色 (Neutral Medium):** `#59595B`
  * 應用於：次要段落文字、說明文字、表格欄位標題、次要邊框與輔助分割線。
* **語意配色 (Semantic Colors):**
  * 成功 (Success): `#2EC4B6` (特用於：已核准標籤、成功提示 Toast、收入指標)
  * 失敗 (Danger): `#E63946` (特用於：已駁回標籤、表單必填錯誤、請假扣款、支出指標)
  * 警告 (Warning): `#FBB042`
  * 資訊 (Info): `#0077B6`
* **背景與卡片 (Backgrounds):**
  * 系統背景：`#F4F7F6` (帶有極微弱青灰色調的明亮工業灰)
  * 卡片背景：`#FFFFFF` (純白)
  * 次要背景：`#EAEFED`

### 2. 介面視覺特徵 (Visual Features)

* **字型 (Typography):** 採用現代簡潔字型 `font-family: 'Inter', 'Noto Sans TC', -apple-system, sans-serif`。
* **格線系統 (Layout Grid):** 精確的 `8px` 網格系統，元件邊距一致採用 `8px / 16px / 24px`。
* **邊框與圓角 (Borders & Radius):**
  * 邊框：`1px solid #E2E8F0`，極簡而精準。
  * 圓角：卡片與表單採 `8px` (中圓角)，按鈕與標籤採 `4px` (小圓角)，維持硬朗精緻的工業幾何感。
* **客製化滾動條 (Custom Scrollbar):** 寬高 `6px`，軌道採系統底色，滾動條滑塊採次要灰，懸浮時切換至中度中性色。
* **陰影 (Shadows):** 避免使用濃重陰影，採用極輕薄的擴散陰影：
  * 卡片陰影：`box-shadow: 0 4px 20px -2px rgba(66, 65, 66, 0.05)`
  * 懸浮陰影：`box-shadow: 0 10px 25px -5px rgba(0, 160, 163, 0.1)`

---

## 二、 系統架構與檔案結構 (System Architecture)

系統採用單頁面應用 (Single Page Application, SPA) 邏輯建構，不引入重型前端框架，以確保極速載入與可攜性。

```
erp-frontend/
├── spec.md                   # 系統規格書 (本檔案)
├── index.html                # 系統主骨架頁面
├── index.css                 # 核心設計系統與 UI 樣式庫 (含工業風變數設定)
├── app.js                    # 路由、狀態管理、語系切換與核心控制邏輯
├── utils.js                  # 共用工具庫 (API 模擬、防呆提示、導覽器、詳細抽屜)
├── data/                     # 模擬 API 載入之離線資料夾
│   ├── locales.js            # 多語系語彙字典對照表 (中/英文)
│   ├── hr.js / hr.json       # 人資管理資料 (人事、薪資、假別、出差、通訊錄)
│   ├── finance.js / finance.json  # 財務管理資料 (請款、會計出納)
│   ├── project.js / project.json  # 專案管理資料 (Sprint, Epic, Issue 結構)
│   ├── sales.js / sales.json      # 銷售管理資料 (業績統計、圖表數據)
│   └── inventory.js / inventory.json # 庫存管理資料 (庫存明細、進貨紀錄)
└── components/               # 各功能模組渲染元件
    ├── hr.js                 # 人資管理介面渲染器 (含薪資計算引擎、請假/出差審批)
    ├── finance.js            # 財務管理介面渲染器 (含憑證上傳、會計流水帳)
    ├── project.js            # 專案管理介面渲染器 (含 Epic/Sprint 看板與樹狀結構)
    ├── sales.js              # 銷售管理介面渲染器 (含業績排序表、SVG 趨勢折線/甜甜圈圖)
    └── inventory.js          # 庫存管理介面渲染器 (含條碼掃描模擬、低水位高亮警示)
```

> [!NOTE]
> `data/` 下的 `.js` 檔會將 Mock 數據綁定至全域物件 `window.MOCK_*_DATA` 並區分 `zh` 與 `en` 鍵值，藉此完美支援雙擊 `index.html` 於 `file://` 下離線執行並提供動態語系切換。對應的 `.json` 檔為原始數據備份，便於需要時參考。

---

## 三、 資料交換規格 (Data Schemas)

所有資料皆採用本地離線 JavaScript 檔案模擬全域變數載入。初始化時，系統在記憶體內維護一個 `globalState` 全域狀態物件，所有的增刪改查皆在記憶體中運作。

### 1. 員工資料結構 (hr.js)
```json
{
  "employees": [
    {
      "id": "EMP001",
      "name": "我是測試帳號",
      "department": "軟體研發部",
      "title": "資深工程師",
      "email": "demo@mockup-erp.org",
      "phone": "0912-345-678",
      "joinDate": "2022-03-15",
      "salary": {
        "base": 65000,
        "bonus": 5000,
        "allowance": 3000
      },
      "leaveBalance": {
        "annual": 10,
        "sick": 30,
        "personal": 14
      }
    }
  ],
  "leaveRequests": [
    {
      "id": "LV-2026-001",
      "employeeId": "EMP001",
      "employeeName": "我是測試帳號",
      "type": "annual",
      "startDate": "2026-06-10",
      "endDate": "2026-06-12",
      "hours": 24,
      "reason": "家庭旅遊",
      "status": "pending"
    }
  ],
  "travelRequests": [
    {
      "id": "TR-2026-001",
      "employeeId": "EMP004",
      "employeeName": "王阿珍",
      "destination": "台北分會辦事處",
      "startDate": "2026-06-18",
      "endDate": "2026-06-19",
      "purpose": "拜訪大型合作廠商及合約簽署",
      "budget": 2800,
      "status": "approved"
    }
  ]
}
```

### 2. 財務資料結構 (finance.js)
```json
{
  "expenseClaims": [
    {
      "id": "CLM-2026-001",
      "employeeId": "EMP004",
      "employeeName": "王阿珍",
      "category": "出差交通費",
      "amount": 2800,
      "description": "台北出差拜訪客戶高鐵來回票",
      "receiptAttached": true,
      "receiptUrl": "receipt_travel_demo.jpg",
      "status": "pending",
      "submitDate": "2026-06-01"
    }
  ],
  "ledgerEntries": [
    {
      "id": "LED-2026-001",
      "date": "2026-05-01",
      "type": "expense",
      "category": "辦公室租金",
      "account": "銀行存款-玉山",
      "amount": 45000,
      "payee": "大安建設股份有限公司",
      "description": "五月份辦公室租金",
      "cashierApproved": true
    }
  ]
}
```

### 3. 專案管理資料結構 (project.js)
```json
{
  "projects": [
    {
      "id": "PRJ001",
      "name": "ERP 系統原型開發案",
      "description": "ERP 演示系統與流程模擬專案",
      "epics": [
        {
          "id": "EP-01",
          "name": "人資管理與請假流演示模組",
          "status": "in_progress"
        }
      ],
      "sprints": [
        {
          "id": "SP-01",
          "name": "Sprint 1 - 基礎架構與核心佈局",
          "startDate": "2026-06-01",
          "endDate": "2026-06-14",
          "status": "active"
        }
      ],
      "issues": [
        {
          "id": "ISS-001",
          "epicId": "EP-01",
          "sprintId": "SP-01",
          "parentId": null,
          "title": "設計左側主導航列與頂部狀態區",
          "assignee": "EMP001",
          "assigneeName": "我是測試帳號",
          "status": "in_progress",
          "priority": "high",
          "description": "依據 工業風格設定進行視覺刻劃與路由切換骨架"
        }
      ]
    }
  ]
}
```

### 4. 銷售業績資料結構 (sales.js)
```json
{
  "salesPerformance": [
    {
      "repId": "REP001",
      "repName": "王阿珍",
      "department": "商業開發部",
      "monthly": [120000, 150000, 180000, 220000, 190000, 250000],
      "quarterly": [450000, 660000, 0, 0],
      "annual": 1110000
    }
  ],
  "salesTargets": {
    "companyAnnual": 30000000,
    "currentAchieved": 25060000
  }
}
```

### 5. 庫存資料結構 (inventory.js)
```json
{
  "inventoryItems": [
    {
      "id": "INV-001",
      "name": "客製化工業感紀念筆記本",
      "category": "行銷禮品",
      "stockCount": 120,
      "minThreshold": 50,
      "unit": "本",
      "unitPrice": 150,
      "location": "A3 倉庫-第2架"
    }
  ],
  "stockInLog": [
    {
      "id": "STK-2026-001",
      "itemId": "INV-001",
      "itemName": "客製化工業感紀念筆記本",
      "quantity": 200,
      "date": "2026-05-12",
      "operator": "我是測試帳號",
      "supplier": "精工印刷廠"
    }
  ]
}
```

---

## 四、 介面配置與導航結構 (Interface Layout & Navigation)

系統採標準 ERP 高效率工作版面配置：

```
+-------------------------------------------------------------------------+
  [Logo] atomERP System                  [演示引導:開] [🌐 語言] [💾 數據管理]
+---------------+---------------------------------------------------------+
|               | 首頁 / 人資管理 / 請假休假                                |
| 人資管理       | ------------------------------------------------------- |
|  - 人事管理   | (右側主要工作區域Viewport)                               |
|  - 薪資試算   |                                                         |
|  - 請假休假   |   [ KPI 指標區 / 資料過濾篩選區 ]                       |
|  - 出差外出   |                                                         |
|  - 員工通訊錄 |   [ 資料表格 / 輸入表單 ]                               |
|               |                                                         |
| 財務管理       |                                                         |
|  - 員工請款   |                                                         |
|  - 簡易會計   |   +--------------------------------------------------+  |
|               |   |                                                  |  |
| 專案管理       |   | [防呆警告] 偵測到您已輸入表單資料，確定要直接離開？|  |
|  - Issue看板  |   +--------------------------------------------------+  |
|               |                                                         |
| 銷售與庫存... |                                                         |
+---------------+---------------------------------------------------------+
```

### 1. 左側主選單 (Sidebar Navigation)
* **路由對照表：**
  * `人資管理`: 人事管理 (`#/hr/personnel`), 薪資試算 (`#/hr/payroll`), 請假休假 (`#/hr/leave`), 出差外出 (`#/hr/travel`), 員工通訊錄 (`#/hr/directory`)
  * `財務管理`: 員工請款 (`#/finance/claims`), 簡易會計與出納 (`#/finance/ledger`)
  * `專案管理`: 階層式 Issue 看板 (`#/project/board`)
  * `銷售管理`: 業務業績統計 (`#/sales/performance`), 銷售儀表板 (`#/sales/dashboard`)
  * `庫存管理`: 進貨與庫存查詢 (`#/inventory/stockin`)
* **高亮狀態：** 當前選取的子選單將套用品牌主色 Teal 背景、微量陰影高亮標記。

### 2. 頂部狀態控制列 (Topbar Actions)
* **模擬 API 數據管理 (Mock Data Manager):**
  * 提供「一般公司規模 (預設)」、「大型集團規模」之規模切換，「重設為初始資料」，以及「上傳自訂 JSON 資料」之功能。
* **演示流程引導器 (Interactive Stepper):**
  * 啟動流程時，頂部會出現對應步驟的 Stepper 指示器，並定位顯示引導泡泡 (Guide Tooltips)，點擊「我知道了」引導下一步。
* **多語系切換器 (Language Selector):**
  * 提供中/英文切換，更換語系將附加 `?lang=zh` 或 `?lang=en` 參數重新載入，並調用 `locales.js` 翻譯所有標記 `data-i18n` 的節點。
* **登入與權限驗證 (Authentication & Session):**
  * 系統預設偵測登入狀態。若未登入，隱藏系統介面並顯示 `#login-container`。
  * 測試帳號 Email 為：`demo@mockup-erp.org`，密碼統一為 `123`。
  * **登入失敗對話框：** 若輸入的信箱或密碼錯誤，系統會跳出顯示「帳號或密碼錯誤」的警告對話框 (Dialog)，要求確認後方可關閉對話框重新登入。
  * 登入後頂部顯示用戶名與工號。點擊狀態列可滑出「同仁詳細資料」側邊欄 (Drawer)。

---

## 五、 五大核心模組功能與業務流程 (Core Modules & Workflows)

### 1. 人資管理模組 (Human Resources)

* **人事管理 (Personnel):**
  * 表格列出所有同仁工號、姓名、部門、起薪與到職日，支援部門篩選與模糊搜尋。
  * 「新增員工表單」支援錄用存檔，填入欄位時自動鎖定為 Dirty。點選任一員工列，由右側滑出「同仁詳細資料」Drawer，展示特休與病假剩餘天數。
* **薪資試算 (Payroll):**
  * 薪資計算公式：`應發薪資 = 基本薪資 + 差旅津貼(財務核銷完畢者) - 請假扣款`。
  * 扣款公式：`事假或病假之累計時數 x 時薪` (時薪為 `基本薪資 / 240`)。
  * 點選「批次發薪」後，自動將總發放金額產生一筆「支出-薪資支出」日記帳，過帳至財務簡易會計帳中。
* **請假休假 (Leave Requests):**
  * 請假單可選取同仁、假別 (特休、病假、事假)、起迄時間、時數、職務代理人與事由。
  * 假單送出列入待審核清單。點選「核准」後，若假別為「特休(annual)」，系統將換算天數 (`hours / 8`) 並實時扣減該同仁的 `leaveBalance.annual` 額度。
* **出差外出 (Business Travel):**
  * 出差單送出並獲得「核准」後，系統會自動在「財務請款」中派發一筆科目為「出差交通費」的草稿請款單，金額與出差經費預算一致，等待憑證上傳與報銷。
* **員工通訊錄 (Employee Directory):**
  * 卡片式通訊錄，支援即時模糊搜尋。點選卡片即可打開同仁詳情抽屜。

---

### 2. 財務管理模組 (Financial Management)

* **員工請款流程 (Expense Claims) [重點流程展示]:**
  * 表單支援報銷科目選擇、申報金額與收據憑證模擬上傳。
  * **收據模擬機制**：點擊「憑證上傳區」會模擬附上發票照片 (`receipt_upload_2026.jpg`)。未上傳憑證者無法提交。
  * 審核撥款後，會自動在簡易會計帳 (Ledger) 中產生一筆以「零用金」支付的複式記帳，付款人為該員工。
* **簡易會計與出納 (Accounting & Ledger):**
  * 頂部顯示三個 KPI 指標卡：總累計收入、總累計支出、會計盈餘結存。
  * 支援手動登打「複式記帳」表單，可選擇收/支、科目、金流帳戶 (玉山銀行、零用金、台新信用卡)、金額並即時更新平衡表。

---

### 3. 專案管理模組 (Project Management)

* **階層式 Issue 看板:**
  * **Epic 里程碑進度條**：動態加總該 Epic 下所有 Issue 的狀態，並計算已完成 (`done`) 的比例以 Teal 進度條百分比呈現。
  * **狀態看板視圖 (Kanban View)**:
    - 四個狀態欄位：Todo -> In Progress -> Code Review -> Done。
    - 支援滑鼠拖曳 (Drag & Drop) Issue 卡片進行狀態變更，亦可點選卡片上的左右箭頭調整狀態。
  - **階層樹狀表視圖 (Tree View)**:
    - 依據 `parentId` 將 Issue 依照主任務、子任務縮排呈現。

---

### 4. 銷售管理模組 (Sales Management)

* **業務業績統計 (Performance Table):**
  * 交叉統計各業務專員在 5月、6月、Q2 及年度累計業績。
  * 支援表頭點擊排序 (Sortable Column Headers)，可依工號、姓名、部門、年度累計等遞增/遞減排序。
* **全公司業績視覺化儀表板 (Sales Dashboard):**
  * 頂部年度銷售總目標達成度進度條。
  * **月度銷售趨勢折線圖 (SVG Trend Line)**：原生 SVG 繪製，滑鼠移至節點 (Dot) 上會以 Tooltip 浮標動態顯示當月業績累計數。
  * **部門業績佔比甜甜圈圖 (SVG Donut Chart)**：以 SVG 圓環比率展現「商業開發部」與「業務推廣部」的業績佔比。

---

### 5. 庫存管理模組 (Inventory Management)

* **進貨與庫存輸入 (Stock-In Form):**
  * **條碼模擬掃描**：點擊「模擬感應掃描」後，彈出具雷射動畫的模擬感應相機畫面，1.5 秒後模擬嗶聲並隨機填入一筆 SKU 物件資訊、預設數量與供應商。
  * 提交進貨將自動在 `stockInLog` 流水簿上記錄，並累加該品項之在庫庫存量。
* **庫存水位警戒明細 (Inventory Query):**
  * 即時庫存明細查詢。若目前庫存低於「安全水位 (minThreshold)」，該品項列會自動套用 Gold 輔助色警戒背景，並顯示 `⚠️ 庫存偏低` 標籤，提示採購進貨。

---

## 六、 關鍵 UX 特色與防呆機制 (Key UX Features)

### 1. 輸入防呆警告機制 (Dirty Form Exit Guard)

* 當使用者在「新增員工表單」、「請假申請單」、「出差申請單」、「記一筆帳」、「員工請款」或「進貨單」等輸入性欄位編輯時，系統將表單標記為 `isDirty = true`。
* 若使用者在 `isDirty` 狀態下點擊左側導航或下拉控制重設數據，系統將進行路由攔截並彈出防呆警示 Modal：「**資料尚未儲存！您確定要直接離開嗎？**」。
* 使用者確認離開後路由才會前進，否則保留原頁面輸入狀態。

### 2. 演示流程簡報導覽器 (Interactive Walkthrough Guide)

頂部提供動態引導氣泡，能引導簡報者完成兩個指標性的 ERP 端到端業務流程：

* **演示流程 A：【新進員工請假發薪業務流】**
  1. **步驟 1 (人事)：** 引導至 `#/hr/personnel`。點擊「新增員工」打開表單。系統自動代入「我是測試帳號」新進人員資料，引導點擊存檔。
  2. **步驟 2 (請假)：** 引導至 `#/hr/leave`。系統自動為我是測試帳號填入「3天特休單」，引導點擊提交。
  3. **步驟 3 (核准)：** 停留於請假頁。引導在右側待核銷清單中，為我是測試帳號的特休申請點擊「核准」，扣減天數。
  4. **步驟 4 (發薪)：** 引導至 `#/hr/payroll`。點擊「一鍵試算本月薪資」，檢視我是測試帳號特休扣減天數、時數與最終核算實發公式。
* **演示流程 B：【差旅請款日記簿入帳業務流】**
  1. **步驟 1 (出差)：** 引導至 `#/hr/travel`。系統預填王阿珍台北差旅派遣，引導提交並於列表點擊「同意出差」核准。
  2. **步驟 2 (請款)：** 引導至 `#/finance/claims`。系統已自動關聯出差草稿 (預算 2800 元)，引導點擊收據區模擬上傳凭证，提交請款。
  3. **步驟 3 (財務)：** 停留於請款頁。引導在列表中為王阿珍該單點擊「同意核銷撥款」。
  4. **步驟 4 (流水帳)：** 引導至 `#/finance/ledger`。引導在會計總帳第一列，高亮檢視由財務核銷自動產生的「支出-差旅報銷」日記流水帳複式分錄。

---

本規格書為 atomERP-ui 前端 Mockup 系統的唯一指導規範。
