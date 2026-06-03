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
    periodDays: days,
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

const OVERVIEW_QUERY = `
query ZoneOverview($zoneTag: string, $since: Date, $until: Date) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      days: httpRequests1dGroups(
        filter: { date_geq: $since, date_lt: $until }
        limit: 31
      ) {
        sum { requests pageViews }
        uniq { uniques }
      }
    }
  }
}`;

const COUNTRIES_QUERY = `
query ZoneCountries($zoneTag: string, $start: Time, $end: Time) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      countries: httpRequestsAdaptiveGroups(
        limit: 25
        orderBy: [count_DESC]
        filter: {
          datetime_geq: $start
          datetime_lt: $end
          requestSource: "eyeball"
        }
      ) {
        count
        sum { visits }
        dimensions { clientCountryName }
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
  const overviewData = await graphql(OVERVIEW_QUERY, {
    zoneTag,
    since: range.since,
    until: range.until,
  });
  const zone = overviewData?.viewer?.zones?.[0];
  if (!zone) throw new Error(`GraphQL 無資料：${zoneName}`);

  const days = zone.days || [];
  let requests = 0;
  let pageViews = 0;
  let uniques = 0;
  for (const d of days) {
    requests += d.sum?.requests ?? 0;
    pageViews += d.sum?.pageViews ?? 0;
    uniques += d.uniq?.uniques ?? 0;
  }

  let countries = [];
  const countryEnd = range.until;
  const countryStart = range.periodDays === 1 ? range.since : range.until;
  if (range.periodDays === 1) {
    try {
      const countryData = await graphql(COUNTRIES_QUERY, {
        zoneTag,
        start: `${countryStart}T00:00:00Z`,
        end: `${countryEnd}T00:00:00Z`,
      });
      countries = countryData?.viewer?.zones?.[0]?.countries || [];
    } catch (err) {
      console.warn(`Country breakdown skipped for ${zoneName}:`, err.message);
    }
  } else {
    console.warn(
      `Country breakdown only for period=today (Free plan adaptive limit). Use today for 國家排行.`
    );
  }
  countries = countries
    .filter((g) => g.dimensions?.clientCountryName)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  const lines = [
    `## ${label}`,
    `期間：${range.label}（${range.since} ～ ${range.until}，UTC）`,
    "",
    "| 指標 | 數字 | 說明 |",
    "|------|------|------|",
    `| 請求次數 | ${requests.toLocaleString()} | 經 Cloudflare 的 HTTP 請求 |`,
    `| 頁面瀏覽 | ${pageViews.toLocaleString()} | 近似 PV |`,
    `| 獨立訪客（IP） | ${uniques.toLocaleString()} | 約略「多少人」${range.periodDays > 1 ? "（多日加總，同一人可能重複計）" : ""} |`,
    "",
  ];

  if (countries.length) {
    lines.push("### 國家／地區（依請求次數排序）", "");
    lines.push("| 排名 | 國家 | 請求 | 造訪次數 |");
    lines.push("|------|------|------|----------|");
    countries.slice(0, 15).forEach((g, i) => {
      const code = g.dimensions.clientCountryName;
      const reqs = g.count ?? g.sum?.visits ?? 0;
      lines.push(
        `| ${i + 1} | ${countryLabel(code)} | ${reqs.toLocaleString()} | ${(g.sum?.visits ?? 0).toLocaleString()} |`
      );
    });
    const top = countries[0];
    const topReqs = top.count ?? top.sum?.visits ?? 0;
    lines.push(
      "",
      `**目前最多流量來自：** ${countryLabel(top.dimensions.clientCountryName)}（${topReqs.toLocaleString()} 次請求）`
    );
  } else if (range.periodDays > 1) {
    lines.push(
      "_國家排行僅支援「今天」查詢（Cloudflare 免費方案 API 限制）。若要國家分布，請問「今天流量」即可。_"
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
  if (/analytics\.read/i.test(String(err.message))) {
    console.error(
      "\n請在 Cloudflare API Token 加上：Zone → Analytics → Read（兩個網域或所有區域）。" +
        "\n加完後更新 GitHub Secret，之後 Agent 即可回答「今天多少人、哪國最多」等問題。" +
        "\n暫時也可看：Cloudflare 後台 → 各網域 → Analytics & Logs → Web Analytics。"
    );
  } else {
    console.error(
      "\n若為權限問題：API Token 需包含 Zone Analytics Read。"
    );
  }
  process.exit(1);
});
