# Web Analytics 設定（若 API 自動取得失敗）

部署成功但 CI 出現 `Authentication error` 時，用 **Plan B**（約 3 分鐘）：

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
