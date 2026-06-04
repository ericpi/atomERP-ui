# atomERP-ui — 系統規格書 (System Specification)

本文件定義了一套用於展示與流程溝通之純前端 ERP 系統 Mockup 規格。此系統旨在以高品質的工業風視覺介面，提供完整的業務功能流程演示，無需真實的後端資料庫與伺服器，所有資料流皆透過靜態 JSON 載入，並在前端以模擬 API 延遲與邏輯狀態進行變更。

---

## 一、 設計風格與美術規範 (Visual & Design System)

依據 **品牌設計風格書** 進行整體視覺規劃，設計語言採 **「明亮、工業風、精緻質感」** 路線。結合細緻邊框、現代無襯線字體、輕量毛玻璃 (Glassmorphism) 以及精心規劃的微互動。

### 1. 核心配色 (Color Palette)

* **品牌主色 (Primary Accent - Teal):** `#00A0A3` 
  * 應用於：左側主導航選單、頂部標題列裝飾、主按鈕 (Primary Button)、進行中工作流程步驟 (Active Steps)、主要聚焦邊框。
  * HSL 對應：`hsl(181, 100%, 32%)`
* **品牌輔助色 (Secondary Highlight - Gold):** `#FBB042`
  * 應用於：狀態提示 (Warning)、待審核狀態標籤、通知小紅點、甘特圖里程碑、重要流程提示。
  * HSL 對應：`hsl(36, 97%, 62%)`
* **深色中性色 (Neutral Dark):** `#424142`
  * 應用於：主標題、導航文字、內文主要文字、重元素背景。
* **中度中性色 (Neutral Medium):** `#59595B`
  * 應用於：次要段落文字、說明文字、表格欄位標題、次要邊框與輔助分割線。
* **背景與卡片 (Backgrounds):**
  * 系統背景：`#F4F7F6` (帶有極微弱青灰色調的明亮工業灰)
  * 卡片背景：`#FFFFFF` (純白)
  * 次要背景：`#EAEFED`

### 2. 介面視覺特徵 (Visual Features)

* **字型 (Typography):** 採用現代簡潔字型 `font-family: 'Inter', -apple-system, sans-serif`。
* **格線系統 (Layout Grid):** 精確的 `8px` 網格系統，元件邊距一致採用 `8px / 16px / 24px`。
* **邊框與圓角 (Borders & Radius):**
  * 邊框：`1px solid #E2E8F0`，極簡而精準。
  * 圓角：卡片與表單採 `8px` (中圓角)，按鈕與標籤採 `4px` (小圓角)，維持硬朗精緻的工業幾何感。
* **陰影 (Shadows):** 避免使用濃重陰影，採用極輕薄的擴散陰影：
  * 卡片陰影：`box-shadow: 0 4px 20px -2px rgba(66, 65, 66, 0.05)`
  * 懸浮陰影：`box-shadow: 0 10px 25px -5px rgba(0, 160, 163, 0.1)`

---

## 二、 系統架構與檔案結構 (System Architecture)

系統採用單頁面應用 (Single Page Application, SPA) 邏輯建構，不引入重型前端框架，以確保極速載入與便攜性。

```
erp-frontend/
├── spec.md                   # 系統規格書 (本檔案)
├── index.html                # 系統主骨架頁面
├── index.css                 # 核心設計系統與 UI 樣式庫
├── app.js                    # 路由、狀態管理與核心控制邏輯
├── utils.js                  # 共用工具庫 (API 模擬、防呆提示、導覽器)
├── data/                     # 模擬 API 載入之離線 JavaScript 資料夾
│   ├── hr.js                 # 人資管理資料 (人事、薪資、假別、出差、通訊錄)
│   ├── finance.js            # 財務管理資料 (請款、會計出納)
│   ├── project.js            # 專案管理資料 (Sprint, Epic, Issue 結構)
│   ├── sales.js              # 銷售管理資料 (業績統計、圖表數據)
│   └── inventory.js          # 庫存管理資料 (庫存明細、進貨紀錄)
└── components/               # 各功能模組渲染元件
    ├── hr.js                 # 人資管理介面模組
    ├── finance.js            # 財務管理介面模組
    ├── project.js            # 專案管理介面模組
    ├── sales.js              # 銷售管理介面模組
    └── inventory.js          # 庫存管理介面模組
```

---

## 三、 資料交換規格 (Data Schemas)

所有資料皆採用本地離線 JavaScript 檔案模擬全域變數載入，藉此完美支援雙擊 `index.html` 直接於 `file://` 協議下離線開啟執行，並在記憶體內維護一個 `globalState` 全域狀態物件。

### 1. 員工資料結構 (hr.json)
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
      "employeeId": "EMP001",
      "employeeName": "我是測試帳號",
      "destination": "台北分會辦事處",
      "startDate": "2026-06-18",
      "endDate": "2026-06-19",
      "purpose": "參與 跨部技術交流會議",
      "status": "approved"
    }
  ]
}
```

### 2. 財務資料結構 (finance.json)
```json
{
  "expenseClaims": [
    {
      "id": "CLM-2026-001",
      "employeeId": "EMP001",
      "employeeName": "我是測試帳號",
      "category": "出差交通費",
      "amount": 2800,
      "description": "台北出差高鐵來回票與計程車費",
      "receiptAttached": true,
      "receiptUrl": "receipt_demo.jpg",
      "status": "pending",
      "submitDate": "2026-06-02"
    }
  ],
  "ledgerEntries": [
    {
      "id": "LED-2026-015",
      "date": "2026-06-01",
      "type": "expense",
      "category": "軟體服務訂閱",
      "account": "銀行存款-玉山",
      "amount": 15000,
      "payee": "Amazon Web Services",
      "description": "五月份雲端主機租用費",
      "cashierApproved": true
    }
  ]
}
```

### 3. 專案管理資料結構 (project.json)
```json
{
  "projects": [
    {
      "id": "PRJ001",
      "name": "ERP 系統原型建置專案",
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
          "name": "Sprint 1 - 基礎骨架與樣式配置",
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
          "status": "todo",
          "priority": "high",
          "description": "依據 工業風格設定進行視覺刻劃"
        }
      ]
    }
  ]
}
```

### 4. 銷售業績資料結構 (sales.json)
```json
{
  "salesPerformance": [
    {
      "repId": "REP001",
      "repName": "王阿珍",
      "department": "業務一部",
      "monthly": [120000, 150000, 180000, 220000, 190000, 250000],
      "quarterly": [450000, 660000],
      "annual": 1110000
    }
  ],
  "salesTargets": {
    "companyAnnual": 50000000,
    "currentAchieved": 38250000
  }
}
```

### 5. 庫存資料結構 (inventory.json)
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
| [Logo] ERP Mockup Demo System          [模擬數據切換] [引導模式:開] |
+---------------+---------------------------------------------------------+
|               | 首頁儀表板 / 目前工作階段進度: [請款流程展示]               |
| 人資管理       | ------------------------------------------------------- |
|  - 人事管理   | (右側主要工作區域)                                       |
|  - 薪資試算   |                                                         |
|  - 請假申請   |   [ 表單輸入區域 / 報表數據區 ]                          |
|  - 出差申請   |                                                         |
|  - 員工通訊錄 |                                                         |
|               |                                                         |
| 財務管理       |                                                         |
|  - 員工請款   |                                                         |
|  - 簡易會計   |                                                         |
|               |                                                         |
| 專案管理       |                                                         |
|  - Issue看板  |                                                         |
|               |                                                         |
| 銷售管理       |   +--------------------------------------------------+  |
|  - 業績統計表 |   |                                                  |  |
|  - 業績看板   |   | [防呆警示] 偵測到您已輸入表單資料，確定要離不儲存嗎？|  |
|               |   +--------------------------------------------------+  |
| 庫存管理       |                                                         |
+---------------+---------------------------------------------------------+
```

### 1. 左側主選單 (Sidebar Navigation)
* **導航行為：** 點擊任一子選單，右側主要工作區域會切換至對應頁面，若目前頁面有尚未儲存的輸入量，將觸發「防呆退出警示」。
* **目前功能高亮：** 使用品牌 Teal 背景色（搭配柔和轉折與圓角）高亮顯示目前選取頁面。

### 2. 頂部狀態控制列 (Topbar Actions)
* **API 模擬切換 (Data Controller Panel):**
  * 提供「重設模擬數據」、「載入預設 JSON A 套組 (一般公司規模)」、「載入預設 JSON B 套組 (大型集團規模)」以及「上傳自訂 JSON」之快捷操作，便於與使用者溝通在不同數據下的報表樣貌。
* **流程進度指示器 (Workflow Stepper):**
  * 當啟動「流程展示模式」時，頂部會顯示一個有階段性的 Stepper (e.g. 請假申請 -> 主管審核 -> 薪資結算扣除 -> 出納過帳)。
  * 提供「引導泡泡 (Guide Tooltips)」，指引溝通者下一步該點擊哪裡，達成完美的互動流程簡報。

---

## 五、 五大核心模組功能與業務流程 (Core Modules & Workflows)

### 1. 人資管理模組 (Human Resources)

* **人事管理 (Personnel):**
  * 呈現精美的員工列表（可依部門篩選、快速搜尋）。
  * 支援「新增員工」表單：包含姓名、部門、職稱、起薪、年假額度輸入。
* **薪資計算與發放 (Payroll):**
  * 自動讀取員工基本薪資，並加上「出差交通費(自動連結請款資料)」、「請假扣款(自動讀取已核准事病假)」以計算實領實發。
  * 提供「一鍵試算五月份薪資」流程按鈕，呈現實時計算過程動畫與最終發放清冊表單。
* **員工請假/休假申請 (Leave Requests):**
  * 提供「請假申請表」：包含請假類型(特休、病假、事假)、起迄時間、請假時數、代理人選取以及事由。
  * 請假送出後，前端模擬「審核關卡」：主管可以在「請假審核清單」點擊「核准/退回」，核准後該員工之 `leaveBalance` 剩餘額度將實時扣除。
* **出差與外出管理 (Business Travel):**
  * 出差申請單：目的地、出差區間、出差目的、預估交通費與雜支。
  * 審核流程：核准後，自動建立一筆「關聯請款單」至財務管理請款草稿區。
* **員工通訊錄 (Employee Directory):**
  * 卡片式通訊錄，支援模糊搜尋 (姓名/部門/職缺/電話/Email)，極速回應，點擊可於側邊欄拉出精緻細節面版。

---

### 2. 財務管理模組 (Financial Management)

* **員工請款流程 (Expense Claims) [重點流程展示]:**
  * 包含請款種類(差旅、文具、軟體授權、交際費)、金額、說明，以及「憑證照片上傳 (Drag & Drop Receipt Upload)」模擬區。
  * 流程引導：員工送出請款 -> 頂部 Stepper 移至「財務審核」-> 點擊財務審核將產生主管同意動畫 -> 進入「出納撥款」-> 點擊出納撥款將自動在「簡易會計帳」產生一筆 Expense 會計流水帳。
* **簡易會計與出納 (Accounting & Ledger):**
  * 呈現精美複式記帳形式的流水平衡帳目表。
  * 支援手動「記一筆帳」：包含日期、科目(資產、負債、收入、支出)、帳戶(現金、銀行)、金額、交易對象及備註。
  * 提供會計月份收支餘額視覺化面板。

---

### 3. 專案管理模組 (Project Management)

* **階層式 Issue Tracking 風格:**
  * **第一層 (Epic):** 顯示專案史詩級里程碑與總進度條。
  * **第二層 (Sprint):** 切換不同 Sprint，呈現該 Sprint 內包含的任务樹狀圖。
  * **第三層 (Issue / Task):** 階層式樹狀列表，可點開看子工作 (Subtask)。
* **互動式看板 (Kanban Board):**
  * 支援將 Issue 拖曳或點選切換狀態 (Todo -> In Progress -> Code Review -> Done)。
  * 提供快速過濾器：只看我的工作、依緊急度 (High/Medium/Low) 著色標記。

---

### 4. 銷售管理模組 (Sales Management)

* **業績統計表格 (Performance Table):**
  * 支援按 **「每月 / 每季 / 每年」** 交叉統計各部門與個別業務員的銷售業績與目標達成率。
  * 具備動態欄位排序 (Sortable Table Headers)、關鍵字快速查詢。
* **全公司業績視覺化儀表板 (Sales Dashboard):**
  * 具備 Teal/Gold 專屬配色的視覺化圖表。
  * 包含：「每月銷售趨勢折線圖」、「各部門業績佔比圓餅圖」、「本季銷售目標達成進度條」。
  * **純前端互動特性：** 滑鼠移至圖表節點會顯示精緻的 Tooltip 資料提示。

---

### 5. 庫存管理模組 (Inventory Management)

* **進貨與庫存輸入 (Stock-In Form):**
  * 精緻的進貨單輸入面板：選擇物品、輸入進貨數量、進貨單價、供應商、存放庫位。
  * 提供「條碼/QR code 模擬掃描輸入」按鈕（點擊後隨機自動填入某項庫存物品以模擬實際操作）。
* **庫存明細與低於安全水位警示 (Inventory Query):**
  * 條列式庫存盤點表，若庫存數量 `stockCount` 低於該品項之安全水位 `minThreshold`，該列自動高亮（以 Gold 輔助色外框與驚嘆號標籤警示），提醒採購進貨。

---

## 六、 關鍵 UX 特色與防呆機制 (Key UX Features)

### 1. 輸入防呆警告機制 (Dirty Form Exit Guard)

* **機制描述：** 當使用者在「新增員工表單」、「請假申請單」、「記一筆帳」或「進貨單」等大輸入量欄位進行編輯時，系統自動將該表單標記為 `isDirty = true`。
* **觸發場景：**
  * 若使用者在 `isDirty = true` 狀態下，點擊左側導航選單試圖切換功能，或點擊 Data Panel 重設數據。
* **反應行為：**
  * 系統**不直接進行路由切換**，而是阻斷行為，並彈出精美設計的「工業風客製化防呆警示 Modal」，提示：「您有尚未儲存的輸入資料，直接離開將遺失這些內容，確定要離開嗎？」。
  * 使用者點擊「確定離開」：清除 `isDirty`，完成路由切換。
  * 使用者點擊「留在此頁」：關閉 Modal，保留輸入狀態。

### 2. 精緻前端流程簡報導覽器 (Interactive Walkthrough Guide)

* **機制描述：** 為方便與客戶或使用者進行功能流程簡報，頂部狀態列提供一個「流程導覽器」下拉清單。
* **示範場景 A：【新進員工從請假到發薪流程】**
  1. 步驟 1 (人事)：引導點擊新增我是測試帳號工程師。
  2. 步驟 2 (請假)：引導我是測試帳號提交 3 天特休申請。
  3. 步驟 3 (人資審核)：引導切換至假單審核頁面點擊核准。
  4. 步驟 4 (薪資試算)：引導切換至薪資試算，顯示系統自動扣除 3 天請假扣款的公式與算式。
* **示範場景 B：【差旅請款自動入帳流程】**
  1. 步驟 1 (出差)：引導填寫出差至台北分會申請單並送出。
  2. 步驟 2 (請款)：引導至請款頁面，顯示已自動代入出差交通費草稿，引導上傳憑證照片送出請款。
  3. 步驟 3 (財務審核與出納過帳)：引導核准請款並撥款。
  4. 步驟 4 (會計流水帳)：自動導向簡易會計帳，顯示一筆新產生的「支出 - 出差交通費」複式記帳。

---

本規格書將作為 ERP 系統 Mockup 的唯一指導規範，未來所有功能更新、畫面調整、欄位異動皆會同步更新於此 spec.md 中，確保規格與前端 Mockup 邏輯高度契合。
