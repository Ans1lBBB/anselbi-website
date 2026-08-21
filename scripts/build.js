#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const SITE = "https://www.anselbi.com";
const LANGS = ["zh-tw", "zh-cn", "en", "ja", "ko"];

const LANG_LABELS = {
  "zh-tw": "繁中",
  "zh-cn": "簡中",
  en: "EN",
  ja: "日本語",
  ko: "한국어",
};

const OG_LOCALES = {
  "zh-tw": "zh_TW",
  "zh-cn": "zh_CN",
  en: "en_US",
  ja: "ja_JP",
  ko: "ko_KR",
};
const homeContent = require("../content/home");
const privacyContent = require("../content/privacy");
const homeCss = fs.readFileSync(path.join(ROOT, "assets/home.css"), "utf8");
const privacyCss = fs.readFileSync(path.join(ROOT, "assets/privacy.css"), "utf8");

const aiosIconPath = path.join(ROOT, "images/AIOS_icon.png");
const aiosIconSrc = `/images/AIOS_icon.png?v=${crypto
  .createHash("md5")
  .update(fs.readFileSync(aiosIconPath))
  .digest("hex")
  .slice(0, 8)}`;
const rubyIconPath = path.join(ROOT, "images/RubyDays_icon.png");
const rubyIconSrc = `/images/RubyDays_icon.png?v=${crypto
  .createHash("md5")
  .update(fs.readFileSync(rubyIconPath))
  .digest("hex")
  .slice(0, 8)}`;

const faviconHead = `    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`;

const CF_ANALYTICS_TOKEN = (() => {
  const fromEnv = process.env.CF_WEB_ANALYTICS_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  const tokenPath = path.join(ROOT, ".cf-analytics-token");
  if (fs.existsSync(tokenPath)) return fs.readFileSync(tokenPath, "utf8").trim();
  return "";
})();

const analyticsHead = CF_ANALYTICS_TOKEN
  ? `    <!-- Cloudflare Web Analytics -->
    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: CF_ANALYTICS_TOKEN })}'></script>`
  : "";

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stickerStoreBadge(appId) {
  if (!appId) return "";
  return `<div class="store-badge"><a href="https://apps.apple.com/app/id${esc(appId)}" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div>`;
}

function hreflangTags(currentLang, pageType) {
  const paths =
    pageType === "home"
      ? LANGS.map((lang) => ({ lang, href: `${SITE}${homeContent[lang].path}` }))
      : LANGS.map((lang) => ({ lang, href: `${SITE}${privacyContent[lang].path}` }));

  const canonical = paths.find((p) => p.lang === currentLang).href;
  const tags = paths
    .map(
      (p) =>
        `    <link rel="alternate" hreflang="${pageType === "home" ? homeContent[p.lang].hreflang : privacyContent[p.lang].hreflang}" href="${p.href}">`
    )
    .join("\n");

  return `${tags}
    <link rel="alternate" hreflang="x-default" href="${SITE}${pageType === "home" ? homeContent.en.path : privacyContent.en.path}">
    <link rel="canonical" href="${canonical}">`;
}

function langSwitch(currentLang, pageType) {
  const content = pageType === "home" ? homeContent : privacyContent;
  const paths = LANGS.map((lang) => ({
    lang,
    label: LANG_LABELS[lang],
    href: content[lang].path,
    hreflang: content[lang].hreflang,
  }));

  return paths
    .map((item, i) => {
      const active = item.lang === currentLang ? " active" : "";
      const divider = i < paths.length - 1 ? '<span class="lang-divider">/</span>' : "";
      return `<a href="${item.href}" class="lang-btn${active}" hreflang="${item.hreflang}">${item.label}</a>${divider}`;
    })
    .join("\n            ");
}

function nameHeading(c) {
  if (c.chinese_name) {
    return `<h1><span class="chinese-name">${esc(c.chinese_name)}</span> <span class="name-en">${esc(c.name_en)}</span></h1>`;
  }
  return `<h1>${esc(c.name_en)}</h1>`;
}

function buildHome(lang, c) {
  const privacyPath = privacyContent[lang].path;
  return `<!DOCTYPE html>
<html lang="${c.htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${esc(c.title)}</title>
    <meta name="description" content="${esc(c.description)}">
    <meta name="keywords" content="${esc(c.keywords)}">
${hreflangTags(lang, "home")}
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE}${c.path}">
    <meta property="og:title" content="${esc(c.title)}">
    <meta property="og:description" content="${esc(c.description)}">
    <meta property="og:locale" content="${OG_LOCALES[lang]}">
    <meta property="og:image" content="${SITE}/apple-touch-icon.png">
    <meta name="twitter:card" content="summary">
${faviconHead}
${analyticsHead}
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Noto+Serif+TC:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;600&family=Noto+Sans+TC:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;600&family=Noto+Sans+KR:wght@400;500;600&display=swap" rel="stylesheet">
    <style>${homeCss}</style>
</head>
<body>
<nav class="navbar">
    <div class="container nav-bar">
        <div class="nav-menu">
            <a href="#apps-title" class="nav-link">${esc(c.nav_works)}</a>
            <a href="#stickers-title" class="nav-link">${esc(c.nav_stickers)}</a>
            <a href="#curator-title" class="nav-link">${esc(c.nav_curator)}</a>
        </div>
        <div class="lang-switch">
            ${langSwitch(lang, "home")}
        </div>
    </div>
</nav>

<main>
    <div class="container">
        <div class="hero">
            <div class="hero-photo">
                <div class="portrait-frame">
                    <img src="/images/ansel_portrait.png" alt="Ansel Bi">
                </div>
            </div>
            <div class="name-title">
                ${nameHeading(c)}
            </div>
            <div class="hero-epigraph">
                <p class="hero-slogan">${esc(c.slogan)}</p>
                <div class="hero-rule" aria-hidden="true"></div>
            </div>
        </div>

        <div id="apps-title" class="section-header">
            <h2>${esc(c.apps_title)}</h2>
        </div>
        <div class="grid-3">
            <div class="work-card"><div class="card-media"><img class="app-icon" src="/images/ProfitFairy_icon.png" alt="ProfitFairy"></div><div class="card-info"><div class="work-title">${esc(c.pf_title)}</div><div class="work-sub">${esc(c.pf_sub)}</div><div class="work-desc">${esc(c.pf_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6740332215" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" alt="App Store"></a></div></div></div>
            <div class="work-card"><div class="card-media"><img class="app-icon" src="${rubyIconSrc}" alt="${esc(c.ruby_title)}"></div><div class="card-info"><div class="work-title">${esc(c.ruby_title)}</div><div class="work-sub">${esc(c.ruby_sub)}</div><div class="work-desc">${esc(c.ruby_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6752606069" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" alt="App Store"></a></div></div></div>
            <div class="work-card"><div class="card-media"><img class="app-icon" src="${aiosIconSrc}" alt="${esc(c.aios_title)}"></div><div class="card-info"><div class="work-title">${esc(c.aios_title)}</div><div class="work-sub">${esc(c.aios_sub)}</div><div class="work-desc">${esc(c.aios_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6745821288" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" alt="App Store"></a></div></div></div>
        </div>

        <div id="stickers-title" class="section-header">
            <h2>${esc(c.sticker_title)}</h2>
        </div>
        <div class="grid-stickers">
            <div class="sticker-card"><img class="sticker-icon" src="/images/shiba_icon.png" alt="Taiwan Shiba"><div class="sticker-name-zh">${esc(c.taiger_name)}</div><div class="sticker-sub">${esc(c.taiger_sub)}</div><div class="sticker-desc">${esc(c.taiger_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6761126835" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div></div>
            <div class="sticker-card"><img class="sticker-icon" src="/images/shiba_daily_icon.png" alt="Taiwan Shiba Daily"><div class="sticker-name-zh">${esc(c.shiba_daily_name)}</div><div class="sticker-sub">${esc(c.shiba_daily_sub)}</div><div class="sticker-desc">${esc(c.shiba_daily_desc)}</div>${stickerStoreBadge(c.shiba_daily_app_id)}</div>
            <div class="sticker-card"><img class="sticker-icon" src="/images/MeowCAT-1_icon.png" alt="MeowCAT-1"><div class="sticker-name-zh">${esc(c.meow1_name)}</div><div class="sticker-sub">${esc(c.meow1_sub)}</div><div class="sticker-desc">${esc(c.meow1_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6755613138" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div></div>
            <div class="sticker-card"><img class="sticker-icon" src="/images/MeowCAT-2_icon.png" alt="MeowCAT-2"><div class="sticker-name-zh">${esc(c.meow2_name)}</div><div class="sticker-sub">${esc(c.meow2_sub)}</div><div class="sticker-desc">${esc(c.meow2_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6755665538" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div></div>
            <div class="sticker-card"><img class="sticker-icon" src="/images/MeowCAT-3_icon.png" alt="MeowCAT-3"><div class="sticker-name-zh">${esc(c.meow3_name)}</div><div class="sticker-sub">${esc(c.meow3_sub)}</div><div class="sticker-desc">${esc(c.meow3_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6755676294" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div></div>
        </div>

        <div id="curator-title" class="curator-head">
            <h3>${esc(c.curator_title)}</h3>
            <div class="sub">${esc(c.curator_sub)}</div>
        </div>
        <div class="curator-block">
            <div class="curator-inner">
                <div class="curator-text">${esc(c.curator_p1)}</div>
                <div class="curator-text">${esc(c.curator_p2)}</div>
                <div class="curator-measure">
                    <div class="measure-item">
                        <div class="stat-number">${esc(c.stat1_num)}</div>
                        <div class="stat-item">${esc(c.stat1_txt)}</div>
                    </div>
                    <div class="measure-item">
                        <div class="stat-number">${esc(c.stat2_num)}</div>
                        <div class="stat-item">${esc(c.stat2_txt)}</div>
                    </div>
                    <div class="measure-item">
                        <div class="stat-number">${esc(c.stat3_num)}</div>
                        <div class="stat-item">${esc(c.stat3_txt)}</div>
                    </div>
                </div>
                <div class="curated-list">
                    <div class="list-grid">
                        <div class="list-item"><div class="list-role">${esc(c.expo_role1)}</div><div class="list-detail">${esc(c.expo_detail1)}</div></div>
                        <div class="list-item"><div class="list-role">${esc(c.expo_role2)}</div><div class="list-detail">${esc(c.expo_detail2)}</div></div>
                        <div class="list-item"><div class="list-role">${esc(c.expo_role3)}</div><div class="list-detail"><span>${esc(c.expo_fair_note)}</span><span>${esc(c.expo_fair1)}</span><span>${esc(c.expo_fair2)}</span><span>${esc(c.expo_fair3)}</span><span>${esc(c.expo_fair4)}</span><span>${esc(c.expo_fair_more)}</span></div></div>
                        <div class="list-item"><div class="list-role">${esc(c.expo_role4)}</div><div class="list-detail">${esc(c.expo_detail4)}</div></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="contact-area">
            <a href="mailto:hi@anselbi.com" class="contact-email-link">${esc(c.contact_btn)}</a>
            <div class="contact-note">${esc(c.contact_note)}</div>
            <a href="https://www.linkedin.com/in/ansel-bi-a36120424" class="contact-linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
        </div>

        <div class="privacy-footer">
            <a href="${privacyPath}" class="privacy-link">${esc(c.privacy_link)}</a>
        </div>
    </div>
</main>

<footer>
    <div class="container">
        <p>© 2026 Ansel Bi</p>
    </div>
</footer>
</body>
</html>`;
}

function buildPrivacySection(section, contactBtn) {
  let html = `<h2>${esc(section.title)}</h2>`;
  if (section.body) {
    html += `<p>${esc(section.body)}</p>`;
  }
  if (section.paragraphs) {
    html += section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
  }
  if (section.link) {
    html += `<p>${esc(section.link.prefix)}<a href="${section.link.href}" target="_blank" rel="noopener" class="inline-link">${esc(section.link.text)}</a></p>`;
  }
  if (section.title.startsWith("5.")) {
    html += `<p><a href="mailto:hi@anselbi.com" class="contact-btn">${esc(contactBtn)}</a></p>`;
  }
  return html;
}

function buildPrivacy(lang, c) {
  const sections = c.sections.map((s) => buildPrivacySection(s, c.contactBtn)).join("\n            ");
  return `<!DOCTYPE html>
<html lang="${c.htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${esc(c.title)}</title>
    <meta name="description" content="${esc(c.description)}">
${hreflangTags(lang, "privacy")}
${faviconHead}
${analyticsHead}
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Noto+Serif+TC:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;600&family=Noto+Sans+TC:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;600&family=Noto+Sans+KR:wght@400;500;600&display=swap" rel="stylesheet">
    <style>${privacyCss}</style>
</head>
<body>
<div class="container">
    <div class="header">
        <div>
            <h1>${esc(c.pageTitle)}</h1>
            <p>${esc(c.updateDate)}</p>
        </div>
        <div class="lang-switch">
            ${langSwitch(lang, "privacy")}
        </div>
    </div>

    <a href="${c.homePath}" class="back-link">${esc(c.backLink)}</a>

    <div id="content">
            ${sections}
    </div>

    <hr>
    <div class="privacy-footer-note">${esc(c.footerNote)}</div>
    <footer>© 2026 Ansel Bi</footer>
</div>
</body>
</html>`;
}

function writeFile(relPath, content) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`  wrote ${relPath}`);
}

function buildSitemap() {
  const urls = [];
  for (const lang of LANGS) {
    urls.push({ loc: `${SITE}${homeContent[lang].path}`, lang: homeContent[lang].hreflang });
    urls.push({ loc: `${SITE}${privacyContent[lang].path}`, lang: privacyContent[lang].hreflang });
  }

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <xhtml:link rel="alternate" hreflang="${u.lang}" href="${u.loc}"/>
    <changefreq>monthly</changefreq>
    <priority>${u.loc.includes("/privacy/") ? "0.5" : "1.0"}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>`;
}

console.log("Building multilingual pages...");
for (const lang of LANGS) {
  writeFile(`${lang}/index.html`, buildHome(lang, homeContent[lang]));
  writeFile(`${lang}/privacy/index.html`, buildPrivacy(lang, privacyContent[lang]));
}

writeFile("sitemap.xml", buildSitemap());
writeFile(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`
);

const securityTxt = `Contact: mailto:hi@anselbi.com
Expires: 2027-06-17T00:00:00.000Z
Preferred-Languages: zh-TW, en
Canonical: ${SITE}/.well-known/security.txt
`;
writeFile(".well-known/security.txt", securityTxt);

console.log("Done.");
