# anselbi.com 官網

**本機入口：`~/Projects/anselbi-website`**（Cursor 開這個資料夾就好）

你專心做 App；官網用自然語言叫 Agent 改內容、查流量、部署。

---

## 你可以這樣說

- 「今天有多少人來？」
- 「把首頁標題改成……」
- 「部署官網」

---

## 技術對照（給 Agent）

| 需求 | 做法 |
|------|------|
| 流量 | `npm run stats -- --period today` |
| 改文案 | `content/home.js`、`content/privacy.js` → `npm run build` |
| 部署 | push `main` |

網域：www.anselbi.com · Repo：`Ans1lBBB/anselbi-website`

App Store 連結見 `APP-STORE-URLS.md`。
