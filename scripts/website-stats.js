#!/usr/bin/env node
/**
 * Manager-style traffic report via Cloudflare Zone Analytics (GraphQL).
 * Usage: node scripts/website-stats.js [--site anselbi|ariel|both] [--period today|7d|30d]
 * Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 */
const SITES = {
  anselbi: { zoneName: "anselbi.com", label: "anselbi.com（個人官網）" },
  ariel: { zoneName: "arielglow.com", label: "arielglow.com（女兒官網）" },
};

const COUNTRY_ZH = {
  TW: "台灣",
  CN: "中國",
  HK: "香港",
  MO: "澳門",
  US: "美國",
  JP: "日本",
  KR: "韓國",
  SG: "新加坡",
  GB: "英國",
  DE: "德國",
  FR: "法國",
  CA: "加拿大",
  AU: "澳洲",
  IN: "印度",
  TH: "泰國",
  MY: "馬來西亞",
  VN: "越南",
  PH: "菲律賓",
  NL: "荷蘭",
  IT: "義大利",
  ES: "西班牙",
  BR: "巴西",
  RU: "俄羅斯",
  ID: "印尼",
};

function parseArgs(argv) {
  let site = "both";
  let period = "today";
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--site" && argv[i + 1]) site = argv[++i];
    else if (argv[i] === "--period" && argv[i + 1]) period = argv[++i];
  }
  return { site, period };
}

function dateRange(period) {
  const now = new Date();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 1;
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);
  return {
    since: start.toISOString().slice(0, 10),
    until: end.toISOString().slice(0, 10),
    label:
      period === "today"
        ? "今天（UTC 日曆日）"
        : period === "7d"
          ? "過去 7 天"
          : "過去 30 天",
  };
}

async function cfFetch(path, options = {}) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("缺少 CLOUDFLARE_API_TOKEN");
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!data.success) {
    const msg = data.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(msg);
  }
  return data;
}

async function getZoneId(zoneName) {
  const data = await cfFetch(`/zones?name=${encodeURIComponent(zoneName)}`);
  const zone = data.result?.[0];
  if (!zone) throw new Error(`找不到 zone：${zoneName}（Token 可能缺 Zone:Read）`);
  return zone.id;
}

async function graphql(query, variables) {
  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors?.length) {
    throw new Error(data.errors.map((e) => e.message).join("; "));
  }
  return data.data;
}

const STATS_QUERY = `
query ZoneStats($zoneTag: string, $since: Date, $until: Date) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      overview: httpRequests1dGroups(
        filter: { date_geq: $since, date_lt: $until }
        limit: 1
      ) {
        sum { requests pageViews }
        uniq { uniques }
      }
      countries: httpRequests1dGroups(
        filter: { date_geq: $since, date_lt: $until }
        limit: 25
        orderBy: [sum_requests_DESC]
      ) {
        dimensions { clientCountryName }
        sum { requests pageViews }
        uniq { uniques }
      }
    }
  }
}`;

function countryLabel(code) {
  if (!code || code === "NONE" || code === "T1") return "未知／其他";
  return `${COUNTRY_ZH[code] || code}（${code}）`;
}

async function reportSite(key, range) {
  const { zoneName, label } = SITES[key];
  const zoneTag = await getZoneId(zoneName);
  const data = await graphql(STATS_QUERY, {
    zoneTag,
    since: range.since,
    until: range.until,
  });
  const zone = data?.viewer?.zones?.[0];
  if (!zone) throw new Error(`GraphQL 無資料：${zoneName}`);

  const overview = zone.overview?.[0];
  const requests = overview?.sum?.requests ?? 0;
  const pageViews = overview?.sum?.pageViews ?? 0;
  const uniques = overview?.uniq?.uniques ?? 0;
  const countries = (zone.countries || []).filter(
    (g) => g.dimensions?.clientCountryName
  );

  const lines = [
    `## ${label}`,
    `期間：${range.label}（${range.since} ～ ${range.until}，UTC）`,
    "",
    "| 指標 | 數字 | 說明 |",
    "|------|------|------|",
    `| 請求次數 | ${requests.toLocaleString()} | 經 Cloudflare 的 HTTP 請求 |`,
    `| 頁面瀏覽 | ${pageViews.toLocaleString()} | 近似 PV |`,
    `| 獨立訪客（IP） | ${uniques.toLocaleString()} | 約略「多少人」，非精確登入用戶 |`,
    "",
  ];

  if (countries.length) {
    lines.push("### 國家／地區（依請求次數排序）", "");
    lines.push("| 排名 | 國家 | 請求 | 獨立 IP |");
    lines.push("|------|------|------|---------|");
    countries.slice(0, 15).forEach((g, i) => {
      const code = g.dimensions.clientCountryName;
      lines.push(
        `| ${i + 1} | ${countryLabel(code)} | ${(g.sum?.requests ?? 0).toLocaleString()} | ${(g.uniq?.uniques ?? 0).toLocaleString()} |`
      );
    });
    const top = countries[0];
    lines.push(
      "",
      `**目前最多流量來自：** ${countryLabel(top.dimensions.clientCountryName)}（${(top.sum?.requests ?? 0).toLocaleString()} 次請求）`
    );
  } else {
    lines.push("_此期間尚無國家細分資料（或流量極少）。_");
  }

  lines.push(
    "",
    "_「回訪／新訪客」比例請看 Cloudflare → Web Analytics；此報告用 Zone 流量 API，與 beacon 圖表可能略有差異。_",
    ""
  );
  return lines.join("\n");
}

async function main() {
  const { site, period } = parseArgs(process.argv);
  const range = dateRange(period);
  const keys =
    site === "both" ? ["anselbi", "ariel"] : site === "ariel" ? ["ariel"] : ["anselbi"];

  const out = [
    `# 官網流量摘要`,
    `產生時間：${new Date().toISOString()}`,
    "",
  ];

  for (const key of keys) {
    try {
      out.push(await reportSite(key, range));
    } catch (err) {
      out.push(`## ${SITES[key].label}`, `錯誤：${err.message}`, "");
    }
  }

  const text = out.join("\n");
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = require("fs");
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + "\n");
  }
}

main().catch((err) => {
  console.error(err.message);
  console.error(
    "\n若為權限問題：API Token 需包含 Zone Analytics Read（或 Analytics:Read）。"
  );
  process.exit(1);
});
