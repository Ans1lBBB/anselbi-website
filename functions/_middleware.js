/**
 * Cloudflare Pages middleware — auto language detection for root and legacy URLs.
 *
 * Priority:
 * 1. Accept-Language (browser / OS preference) — zh variants only
 * 2. CF-IPCountry (when Chinese is ambiguous)
 * 3. Default: en (all non-Chinese locales)
 */
const LANG_PATHS = {
  "zh-tw": "/zh-tw/",
  "zh-cn": "/zh-cn/",
  en: "/en/",
};

const TRADITIONAL_REGIONS = new Set(["TW", "HK", "MO"]);

function parseAcceptLanguage(header) {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [langRaw, ...params] = part.trim().split(";");
      const lang = langRaw.trim().toLowerCase();
      let q = 1;
      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key === "q" && value) q = parseFloat(value) || 0;
      }
      return { lang, q };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q);
}

function resolveChineseVariant(country) {
  if (country === "CN") return "zh-cn";
  if (TRADITIONAL_REGIONS.has(country)) return "zh-tw";
  return "zh-tw";
}

function detectLanguage(request) {
  const country = request.cf?.country || "";
  const preferences = parseAcceptLanguage(request.headers.get("Accept-Language"));

  for (const { lang } of preferences) {
    if (lang.startsWith("zh-tw") || lang.startsWith("zh-hk") || lang.startsWith("zh-mo") || lang.includes("hant")) {
      return "zh-tw";
    }
    if (lang.startsWith("zh-cn") || lang.startsWith("zh-sg") || lang.includes("hans")) {
      return "zh-cn";
    }
    if (lang === "zh" || lang.startsWith("zh-")) {
      return resolveChineseVariant(country);
    }
  }

  if (country === "CN") return "zh-cn";
  if (TRADITIONAL_REGIONS.has(country)) return "zh-tw";

  return "en";
}

function shouldAutoRedirect(pathname) {
  if (pathname === "/" || pathname === "/index.html") return "home";
  if (pathname === "/privacy" || pathname === "/privacy/" || pathname === "/privacy.html") return "privacy";
  return null;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = shouldAutoRedirect(url.pathname);

  if (target) {
    const lang = detectLanguage(context.request);
    const suffix = target === "privacy" ? "privacy/" : "";
    const destination = `${url.origin}${LANG_PATHS[lang]}${suffix}`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: destination,
        "Cache-Control": "private, no-cache",
        Vary: "Accept-Language",
      },
    });
  }

  return context.next();
}
