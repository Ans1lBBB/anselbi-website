# 官網交給 Agent 維護

你專心做 App 即可。官網（anselbi.com、arielglow.com）由 Cursor **Agent 模式**處理。

## 你只要說

- **「部署 anselbi」** / **「部署 arielglow」** / **「兩個官網都部署」**
- **「改官網文案：……」**（繁中／簡中／英文）
- **「檢查官網是否正常」**

不必再自己開 Cloudflare 或 GitHub Actions（除非 Token 過期）。

## 已設定好的（不用重做）

- GitHub：`gh` 已登入 `Ans1lBBB`
- 兩個 repo 的 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`
- push `main` → 自動部署到 Cloudflare Pages

## 技術細節（給 Agent，你可略過）

| 項目 | 說明 |
|------|------|
| anselbi 文案 | `content/home.js`、`content/privacy.js` → `npm run build` |
| ariel 文案 | `index.html` |
| 統計 | CI 用 API 自動插入；失敗也不影響網站上線 |
| 進階 DNS | ariel 的「Cloudflare hardening」workflow 可選 |

## App Store 網址（維持不變）

- 官網：`https://www.anselbi.com/`
- 隱私權：`https://www.anselbi.com/privacy`

詳見 `APP-STORE-URLS.md`。
