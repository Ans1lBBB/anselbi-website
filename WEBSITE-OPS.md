# 官網交給 Agent（管理層模式）

你專心做 App。官網當成問秘書：**問數據、改內容、改設計**，都由 Cursor **Agent** 處理，不必碰前後端或 Cloudflare 後台。

---

## 你可以像問秘書一樣說

### 流量與訪客（範例）

- 「今天 anselbi 有多少人來？」
- 「這週 arielglow 流量如何？」
- 「訪客主要來自哪些國家？哪國最多？」
- 「獨立訪客和頁面瀏覽差多少？」

Agent 會跑流量報告（Cloudflare API），用**中文摘要**回答你。

> 說明：獨立訪客用 Cloudflare 的「獨立 IP」近似；「回訪／新訪客」與 Web Analytics 後台最接近。
>
> **一次性（可選）**：若 Token 尚未包含 **Zone → Analytics → Read**，在 Cloudflare 編輯 Token 並更新 GitHub Secret 後，Agent 就能用 API 回答流量問題；不加也能改文案與部署，只是流量要口述或看後台。

### 改官網（範例）

- 「把首頁標題改成……」
- 「英文版 privacy 加一段……」
- 「arielglow 背景色調柔和一點」

Agent 改檔 → build → push → 自動部署。

### 一句話部署

- **部署 anselbi** / **部署 arielglow** / **兩個都部署**

---

## 你不用做的事

- 不用自己開 GitHub Actions
- 不用自己貼 API Token（已存在 GitHub Secrets）
- 不用記指令；用自然語言即可

---

## 技術對照（給 Agent）

| 需求 | 做法 |
|------|------|
| 流量報告 | `npm run stats -- --site both --period today` 或 `gh workflow run "Website traffic report"` |
| 改 anselbi 文案 | `content/home.js`、`content/privacy.js` → `npm run build` |
| 改 ariel | `index.html` |
| 部署 | push `main` 或 Deploy workflow |

| 網站 | Repo | 網域 |
|------|------|------|
| anselbi | `Ans1lBBB/anselbi-website` | www.anselbi.com |
| arielglow | `Ans1lBBB/arielglow-website` | www.arielglow.com |

App Store：`https://www.anselbi.com/`、`https://www.anselbi.com/privacy`（見 `APP-STORE-URLS.md`）。
