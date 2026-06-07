# App Store Connect 網址指南

部署完成後，請依下列網址填寫 App Store Connect。

## 通用原則

| 用途 | 建議填寫 | 原因 |
|------|---------|------|
| **隱私權政策 URL** | `https://www.anselbi.com/privacy` | 單一 URL，依使用者語言自動導向繁中/簡中/英文 |
| **行銷 / 支援 / 官網** | `https://www.anselbi.com/` | 同上，自動語言偵測 |
| **app-ads.txt（AdMob）** | `https://www.anselbi.com/app-ads.txt` | 必須在 App Store 所列網域的根目錄 |

若 App Store Connect 有**分語言**的隱私權欄位，可填各語言直連：

| 語言 | 隱私權 URL |
|------|-----------|
| 繁體中文 | `https://www.anselbi.com/zh-tw/privacy/` |
| 簡體中文 | `https://www.anselbi.com/zh-cn/privacy/` |
| 英文 | `https://www.anselbi.com/en/privacy/` |

---

## 各 App 送審建議

### 小主私密日記（RubyDays）— 正在改版送審

| 欄位 | 填寫 |
|------|------|
| 隱私權政策 URL | `https://www.anselbi.com/privacy` |
| 行銷 URL（選填） | `https://www.anselbi.com/` |
| 支援 URL | `https://www.anselbi.com/` |

**名稱／副標題／關鍵字（ASO）**：見 [`APP-STORE-ASO.md`](./APP-STORE-ASO.md)。

### ProfitFairy — 尚未改版（App 內仍為舊網址）

- **現況**：App 內可能仍指向舊 GitHub Pages 網址
- **送審前不必改**（除非這次一併更新 App）
- **下次改版時改為**：`https://www.anselbi.com/privacy` 與 `https://www.anselbi.com/`
- AdMob：確認 App Store 主網域為 `anselbi.com`，`app-ads.txt` 已在根目錄

### 艾奧斯（AIOS Realm）— 同上

- 下次改版：`https://www.anselbi.com/privacy`、`https://www.anselbi.com/`

### iMessage 貼圖（台客柴、MeowCAT 等）

| 欄位 | 填寫 |
|------|------|
| 隱私權 URL | `https://www.anselbi.com/privacy` |
| 行銷 URL | `https://www.anselbi.com/` |

---

## AdMob app-ads.txt

檔案位置：`https://www.anselbi.com/app-ads.txt`

內容已從原 `ans1lbbb.github.io` repo 遷移至此。請在 AdMob 後台確認驗證狀態；若仍綁舊網域，改為 `anselbi.com` 後重新驗證。

---

## 舊 GitHub repo 處理（勿刪）

| Repo | 建議 |
|------|------|
| `ProfitFairy` | **保留**，加 README 指向 anselbi.com；等 App 改版後可 Archive |
| `AIOS` | 同上 |
| `RubyDays` | 同上 |
| `stickers` | 同上 |
| `ans1lbbb.github.io` | **保留**至 AdMob 完全遷移；之後可 Archive |

刪除會導致舊 App 內連結失效、AdMob 驗證中斷。
