# Ansel Bi 官網 — 部署與權限設定指南

本專案已改為三語獨立頁面（`/zh-tw/`、`/zh-cn/`、`/en/`），並透過 Cloudflare 自動偵測使用者語言。

## 語言自動切換邏輯

訪客進入 `https://www.anselbi.com/` 或 `https://www.anselbi.com/privacy` 時：

1. **優先：瀏覽器語言（Accept-Language）** — 反映使用者 OS / 瀏覽器慣用語言
2. **補充：IP 所在國家（Cloudflare）** — 當中文未標明繁簡時使用
3. **預設：繁體中文（zh-tw）**

| 條件 | 導向 |
|------|------|
| `zh-TW` / `zh-HK` / `zh-MO` / `zh-Hant` | `/zh-tw/` |
| `zh-CN` / `zh-SG` / `zh-Hans` | `/zh-cn/` |
| `en` | `/en/` |
| 只有 `zh` 且 IP 在中國 | `/zh-cn/` |
| 只有 `zh` 且 IP 在台港澳 | `/zh-tw/` |
| 其他 | `/zh-tw/`（或英文偏好時 `/en/`） |

App Store 的 `https://www.anselbi.com/privacy` **繼續有效**，會依訪客語言自動導向對應版本。

---

## 你需要做一次的事（約 15 分鐘）

### 步驟 1：登入 GitHub CLI

在 Terminal 執行：

```bash
gh auth login
```

選擇：GitHub.com → HTTPS → Login with a web browser → 依指示完成授權。

完成後在 Cursor 跟我說「GitHub 已登入」，我可以幫你建立 repo 並 push。

### 步驟 2：建立 Cloudflare API Token

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 右上角頭像 → **My Profile** → **API Tokens**
3. **Create Token** → 使用模板 **Edit Cloudflare Workers**
4. 權限需包含：**Account → Cloudflare Pages → Edit**
5. 複製產生的 Token（只顯示一次）

### 步驟 3：取得 Cloudflare Account ID

Cloudflare Dashboard → 左側任一網域 → 右側 **Account ID** 複製。

### 步驟 4：在 GitHub 設定 Secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**：

| Secret 名稱 | 值 |
|-------------|-----|
| `CLOUDFLARE_API_TOKEN` | 步驟 2 的 Token |
| `CLOUDFLARE_ACCOUNT_ID` | 步驟 3 的 Account ID |

### 步驟 5：Cloudflare Pages 專案

第一次 push 到 `main` 後，GitHub Actions 會自動部署。

若 Cloudflare 尚無 `anselbi-website` 專案，請到：

**Workers & Pages** → **Create** → **Pages** → **Connect to Git** → 選此 repo →

- Build command: `npm run build`
- Build output directory: `/`（根目錄）
- 自訂網域：`www.anselbi.com`

### 步驟 6：更新 app-ads.txt

請把 Google AdMob 後台提供的 `app-ads.txt` 內容貼到本專案根目錄的 `app-ads.txt`，覆蓋 placeholder。

---

## 之後如何更新官網

1. 修改 `content/home.js` 或 `content/privacy.js` 的文案
2. 在 Cursor 跟我說「部署官網」
3. 我會執行 build → commit → push → 自動上線

---

## 本地預覽

```bash
npm run build
npx wrangler pages dev . --compatibility-date=2024-01-01
```

（需先 `npm install -g wrangler` 並 `wrangler login`）

---

## 為什麼建議綁 GitHub？

| 方式 | 優點 |
|------|------|
| **GitHub + Cloudflare（推薦）** | 自動部署、版本紀錄、可還原、Cursor Agent 可直接 push |
| 只用 Wrangler 手動上傳 | 無版本紀錄，容易覆蓋錯誤 |

官網與 Xcode 無需連動；GitHub 只負責網站檔案與 `app-ads.txt`。

---

## 訪客統計（Cloudflare Web Analytics）

部署時會自動向 Cloudflare 取得 **Web Analytics beacon**，並插入所有官網頁面（免費）。

**在哪裡看數據：**

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 選網域 **anselbi.com**
3. 左側 **Analytics & Logs** → **Web Analytics**

新啟用後約 **24～48 小時** 才會有穩定圖表。若 API 權限不足導致未插入追蹤碼，可在 Cloudflare 後台手動複製 beacon，設為 GitHub Secret：`CF_WEB_ANALYTICS_TOKEN`，再重新部署。

---

## 目錄結構

```
my-website/
├── content/          ← 三語文案（改這裡）
├── scripts/build.js  ← 產生靜態頁
├── functions/        ← Cloudflare 語言偵測
├── zh-tw/ zh-cn/ en/ ← 產出的各語言頁面
├── images/
├── app-ads.txt
├── sitemap.xml
└── robots.txt
```
