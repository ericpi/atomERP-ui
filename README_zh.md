# atomERP-ui — 輕量級現代化前端 ERP UI 模版

[English](README.md) | [繁體中文](README_zh.md)

🔗 **[Live Demo / 線上展示](https://ericpi.github.io/atomERP-ui/?lang=zh)**

本專案是一個專為 **Mockup Inc.** 設計的乾淨、高視覺質感且完全具備離線運行能力的 ERP 前端示範模版。作為流程演示與客戶溝通的利器，它完全採用原生 JavaScript、HTML5 和純 CSS 打造，無須架設本機伺服器、打包工具或資料庫，只需雙擊 `index.html` 即可在瀏覽器中完美運作。

---

## 🚀 核心特色

* **完全離線執行 (相容 `file://` 協定)：** 採用基於腳本的動態資料載入機制，避開瀏覽器 CORS 跨域限制，可直接雙擊本地檔案載入。
* **系統登入與路由守衛 (Auth Guard)：** 完全遮蔽後台的單色背景登入畫面，未通過驗證前無法載入後方系統。登入帳號支援員工資料庫之任一筆 Email，密碼為 `123`（提供 `demo@mockup-erp.org` 測試）。
* **元件化前端架構：** 系統各功能模組完全拆分於獨立的元件檔案 (`components/*.js`) 中，並在主路由控制器中進行動態渲染掛載。
* **個人詳細資料與登出控制：** 右上角顯示目前登入者的姓名與工號，點擊即可彈出該同仁的個人詳細資料抽屜，並在右側新增了獨立的登出 (Logout) 按鈕。
* **完善的雙語系 (i18n) 支援：** 預設為英文介面，透過網址參數 `?lang=zh` 或頂部 Language 選單，可即時無縫切換為繁體中文。
* **互動展示引導 (中央導覽引擎)：** 提供 `WorkflowGuide` 引導模組，以動態氣泡提示框帶領使用者跑完完整業務流程：
  * **Flow A (新進發薪)：** 錄用新員工 ➔ 提交特休假單 ➔ 審核核准 ➔ 自動核算本月薪資扣減公式。
  * **Flow B (差旅報銷)：** 填報差旅單 ➔ 關聯式費用請款表單與模擬憑證照片上傳 ➔ 財會審核撥款 ➔ 自動過帳至會計日記流水帳。
* **表單防呆防護 (FormGuard)：** 偵測表單未儲存之變更，於切換頁面或重設資料時顯示警告，防止使用者輸入資料遺失。
* **動態 SVG 視覺化圖表：** 自訂設計的互動式 SVG 折線圖與甜甜圈圖，可依據現有資料庫規模等比動態縮放。
* **模擬 API 連線延遲：** 以精美遮罩與動畫呈現 API 通訊延遲，模擬與後端伺服器真實互動場景。

---

## 📂 專案目錄結構

```bash
├── index.html             # 單頁式應用程式主入口
├── index.css              # 明亮工業風設計系統與 UI 樣式定義
├── app.js                 # 核心狀態管理器與前端 Hash 路由控制器
├── utils.js               # 共用工具庫 (Toast 提示、FormGuard、導覽引擎、抽屜明細)
├── data/
│   ├── locales.js         # 全域語系翻譯字典對照表 (EN / ZH)
│   ├── hr.js              # 人資模擬資料庫 (員工名冊、假單、差旅單)
│   ├── finance.js         # 財務模擬資料庫 (請款單、會計日記帳)
│   ├── project.js         # 專案管理模擬資料庫 (史詩任務、Sprint、Issue)
│   ├── sales.js           # 銷售模擬資料庫 (業務專員業績、每月統計、銷售目標)
│   └── inventory.js       # 庫存模擬資料庫 (SKU 商品、進貨過帳歷史)
├── components/
│   ├── hr.js              # 人資視圖 (員工列表、薪資計算、請假審核、出差外出、通訊錄)
│   ├── finance.js         # 財務視圖 (員工報銷請款、會計日記帳)
│   ├── project.js         # 專案視圖 (看板狀態拖曳、樹狀階層清冊)
│   ├── sales.js           # 銷售視圖 (業務同仁交叉報表、業績儀表板圖表)
│   └── inventory.js       # 庫存視圖 (進貨登記表單、條碼掃描模擬、即時盤點清單)
└── README_zh.md           # 專案中文說明文件
```

---

## ⚙️ 技術實作細節

### 1. 全域命名空間模式
為了在不依赖本機 Web 伺服器 (即不觸發 `file://` CORS 限制) 的情況下維持元件模組化，本專案將公用工具與多語系方法統一命名空間在全域變數中：
```javascript
window.atomERP = {
  getLocale: () => { ... },
  t: (key) => { ... },
  translateDOM: (root) => { ... }
};
```
各功能視圖註冊於 `window.render*`，由 `app.js` 偵測 `#hash` 變化後呼叫掛載。

### 2. 資料狀態層
資料儲存在全域變數 `window.globalState` 中，啟動時會複製對應語系的初始模擬資料 `window.MOCK_DATA[locale]`。當使用者在頂部控制列擴充資料規模時，系統會動態擴充生成 5 倍筆數的大型集團測試資料。

### 3. 多語系翻譯引擎
對於靜態 Layout HTML 元素，使用 `data-i18n` 標記，並在路由載入時呼叫：
```javascript
window.atomERP.translateDOM(document.body);
```
對於 `components/*.js` 元件中動態生成的 template 字串，則直接嵌入 `window.atomERP.t('key')` 方法，實現無縫的即時切換。

### 4. 條碼模擬感應區
庫存登記模組實作了條碼與二維碼掃描模擬，開啟紅外線掃描遮罩後，隨機挑選庫存清單中的 SKU 商品，發出嗶聲提示並自動填寫至對應表單欄位。

### 5. 系統登入與路由守衛機制
在核心路由 `handleRouting()` 渲染前加入驗證：
- 透過 `getCurrentUser()` 讀取 `sessionStorage`，並內建記憶體物件暫存作為 fallback，相容於瀏覽器停用 LocalStorage 的隱私沙盒環境。
- 未登入用戶會完全隱藏 `#sidebar` 及 `.main-layout`，強制開啟單色背景的 `#login-container`，確保系統資料不會提前曝露。
- 登入表單的初始化過程中，對 DOM 查找加入了 Null-safe 預防設計，防止元素尚未渲染時呼叫事件註冊導致程式出錯。

---

## 🛠️ 開發與展示指南

### 系統需求
* 任何現代瀏覽器 (Chrome、Safari、Edge、Firefox) 即可。

### 展示操作步驟
1. 下載或複製本專案。
2. 雙擊直接開啟 [index.html](file:///Users/eric/old_backup/work-20220524/antigravity_prac/erp-frontend/index.html) 或在終端機執行：
   ```bash
   open index.html
   ```

### 測試語系與資料擴充
* 可點擊頂部 **Language** 按鈕切換語系，或直接在網址後方加上 `?lang=zh` 進入繁體中文演示模式。
* 點擊 **模擬 API 數據管理** 可將員工資料與銷售儀表板數據擴充 5 倍，向客戶展示大數據負載下的畫面呈現。

---

## 📄 授權條款
本專案採用 MIT 授權條款開放開源，僅用於 ERP 前端流程演示及原型溝通樣板。
