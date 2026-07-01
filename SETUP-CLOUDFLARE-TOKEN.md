# Cloudflare API Token（讓本機腳本能自動套用 Security Insights 修正）

目前預設的 Pages 部署 Token **無法**改 DNS、Bot Fight、DMARC。請建立一支 **Hardening Token**（約 2 分鐘）：

1. [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token** → **Create Custom Token**
2. 權限（資源選 **Account** 下所有 Zone，或個別 `anselbi.com` / `arielglow.com`）：

| 權限 | 等級 |
|------|------|
| Zone → DNS | Edit |
| Zone → SSL and Certificates | Edit |
| Zone → Zone Settings | Edit |
| Zone → Bot Management | Edit |
| Zone → Email Security | Edit |
| Zone → Page Rules / Redirect Rules | Edit |
| Account → Cloudflare Pages | Edit |
| Account → Turnstile | Edit |

3. 複製 Token → 本機 `.env`：
   ```
   CLOUDFLARE_HARDENING_TOKEN=貼上這裡
   ```
4. 本機執行：`bash scripts/harden-security.sh`

**帳號 MFA** 請至 [Profile → Authentication](https://dash.cloudflare.com/profile/authentication) 開啟 2FA。
