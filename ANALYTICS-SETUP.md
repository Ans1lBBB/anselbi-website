# Web Analytics 設定（若 API 自動取得失敗）

## 權限說明（容易搞混）

| 用途 | 建議 Token 權限 |
|------|----------------|
| **GitHub → Cloudflare Pages 部署** | Pages Read + Pages Write |
| **後台看流量圖** | Account Analytics Read |
| **CI 用 API 自動抓 beacon token** | 還要 **Account Settings Read + Edit**（僅 Analytics Read 常會 `Authentication error`） |

你截圖裡的 Token（Pages + Account Analytics Read）**足夠部署網站**，但 **不夠** 呼叫 `rum/site_info` API。這不是 GitHub 壞掉，也不是改版把 Pages 拿掉。

部署成功但 CI 出現 `Authentication error` 時，可二選一：

- **Plan A**：Token 再加 Account Settings Read + Edit，兩個 repo 的 Secrets 都換成新 Token  
- **Plan B**（最快，下面步驟）：

## Plan B（約 3 分鐘）

## 每個網域各做一次

### anselbi.com

1. Cloudflare → **anselbi.com** → **Analytics & Logs** → **Web Analytics**
2. 新增／管理網站 → 複製 **site token**
3. GitHub **anselbi-website** → Settings → Secrets → **New repository secret**
   - Name: `CF_WEB_ANALYTICS_TOKEN`
   - Value: 貼上 token
4. Actions → Deploy → **Run workflow**

### arielglow.com

1. Cloudflare → **arielglow.com** → **Web Analytics** → 複製 **site token**
2. GitHub **arielglow-website** → Secrets → `CF_WEB_ANALYTICS_TOKEN`
3. Run workflow

不需改 `CLOUDFLARE_API_TOKEN`；有 `CF_WEB_ANALYTICS_TOKEN` 就會插入追蹤碼。
