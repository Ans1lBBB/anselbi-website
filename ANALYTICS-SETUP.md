# Web Analytics 設定（若 API 自動取得失敗）

## 權限說明

| 用途 | 建議 Token 權限 |
|------|----------------|
| **GitHub → Cloudflare Pages 部署** | Pages Read + Pages Write |
| **後台看流量圖** | Account Analytics Read |
| **CI 用 API 自動抓 beacon token** | 還要 **Account Settings Read + Edit** |

部署成功但 CI 出現 `Authentication error` 時：

- **Plan A**：Token 再加 Account Settings Read + Edit，GitHub Secret 換成新 Token  
- **Plan B**（最快，下面步驟）

## Plan B（約 3 分鐘）

1. Cloudflare → **anselbi.com** → **Analytics & Logs** → **Web Analytics**
2. 複製 **site token**
3. GitHub **anselbi-website** → Secrets → `CF_WEB_ANALYTICS_TOKEN`
4. Actions → Deploy → **Run workflow**
