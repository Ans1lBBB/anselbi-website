#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://www.anselbi.com";
const LANGS = ["zh-tw", "zh-cn", "en"];
const homeContent = require("../content/home");
const privacyContent = require("../content/privacy");
const homeCss = fs.readFileSync(path.join(ROOT, "assets/home.css"), "utf8");
const privacyCss = fs.readFileSync(path.join(ROOT, "assets/privacy.css"), "utf8");

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
    <link rel="alternate" hreflang="x-default" href="${SITE}${pageType === "home" ? homeContent["zh-tw"].path : privacyContent["zh-tw"].path}">
    <link rel="canonical" href="${canonical}">`;
}

function langSwitch(currentLang, pageType) {
  const paths =
    pageType === "home"
      ? LANGS.map((lang) => ({ lang, label: lang === "en" ? "EN" : lang === "zh-cn" ? "簡中" : "繁中", href: homeContent[lang].path }))
      : LANGS.map((lang) => ({ lang, label: lang === "en" ? "EN" : lang === "zh-cn" ? "簡中" : "繁中", href: privacyContent[lang].path }));

  return paths
    .map((item, i) => {
      const active = item.lang === currentLang ? " active" : "";
      const divider = i < paths.length - 1 ? '<span class="lang-divider">/</span>' : "";
      return `<a href="${item.href}" class="lang-btn${active}" hreflang="${item.lang === "en" ? "en" : item.lang === "zh-cn" ? "zh-Hans" : "zh-Hant"}">${item.label}</a>${divider}`;
    })
    .join("\n            ");
}

function nameHeading(c) {
  if (c.chinese_name) {
    return `<h1><span class="chinese-name">${esc(c.chinese_name)}</span> <span>${esc(c.name_en)}</span></h1>`;
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
    <meta property="og:locale" content="${lang === "en" ? "en_US" : lang === "zh-cn" ? "zh_CN" : "zh_TW"}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap" rel="stylesheet">
    <style>${homeCss}</style>
</head>
<body>
<nav class="navbar">
    <div class="container nav-flex">
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
            <div class="hero-slogan">${esc(c.slogan)}</div>
            <div class="name-title">
                ${nameHeading(c)}
                <div class="title-role">${esc(c.role)}</div>
            </div>
            <div class="hero-desc">${esc(c.hero_desc)}</div>
            <div class="stat-row">
                <div><div class="stat-number">${esc(c.stat1_num)}</div><div class="stat-item">${esc(c.stat1_txt)}</div></div>
                <div><div class="stat-number">${esc(c.stat2_num)}</div><div class="stat-item">${esc(c.stat2_txt)}</div></div>
                <div><div class="stat-number">${esc(c.stat3_num)}</div><div class="stat-item">${esc(c.stat3_txt)}</div></div>
            </div>
        </div>

        <div id="apps-title" class="section-header">
            <h2>${esc(c.apps_title)}</h2>
        </div>
        <div class="grid-3">
            <div class="work-card"><div class="card-media"><img class="app-icon" src="/images/ProfitFairy_icon.png" alt="ProfitFairy"></div><div class="card-info"><div class="work-title">${esc(c.pf_title)}</div><div class="work-sub">${esc(c.pf_sub)}</div><div class="work-desc">${esc(c.pf_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6740332215" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" alt="App Store"></a></div></div></div>
            <div class="work-card"><div class="card-media"><img class="app-icon" src="/images/RubyDays_icon.png" alt="RubyDays"></div><div class="card-info"><div class="work-title">${esc(c.ruby_title)}</div><div class="work-sub">${esc(c.ruby_sub)}</div><div class="work-desc">${esc(c.ruby_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6752606069" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" alt="App Store"></a></div></div></div>
            <div class="work-card"><div class="card-media"><img class="app-icon" src="/images/AIOS_icon.png" alt="AIOS Realm"></div><div class="card-info"><div class="work-title">${esc(c.aios_title)}</div><div class="work-sub">${esc(c.aios_sub)}</div><div class="work-desc">${esc(c.aios_desc)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6745821288" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" alt="App Store"></a></div></div></div>
        </div>

        <div id="stickers-title" class="section-header">
            <h2>${esc(c.sticker_title)}</h2>
        </div>
        <div class="grid-4">
            <div class="sticker-card"><img class="sticker-icon" src="/images/shiba_icon.png" alt="Taiger Shiba"><div class="sticker-name-zh">${esc(c.taiger_name)}</div><div class="sticker-sub">${esc(c.taiger_sub)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6761126835" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div></div>
            <div class="sticker-card"><img class="sticker-icon" src="/images/MeowCAT-1_icon.png" alt="MeowCAT-1"><div class="sticker-name-zh">${esc(c.meow1_name)}</div><div class="sticker-sub">${esc(c.meow1_sub)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6755613138" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div></div>
            <div class="sticker-card"><img class="sticker-icon" src="/images/MeowCAT-2_icon.png" alt="MeowCAT-2"><div class="sticker-name-zh">${esc(c.meow2_name)}</div><div class="sticker-sub">${esc(c.meow2_sub)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6755665538" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div></div>
            <div class="sticker-card"><img class="sticker-icon" src="/images/MeowCAT-3_icon.png" alt="MeowCAT-3"><div class="sticker-name-zh">${esc(c.meow3_name)}</div><div class="sticker-sub">${esc(c.meow3_sub)}</div><div class="store-badge"><a href="https://apps.apple.com/app/id6755676294" target="_blank" rel="noopener"><img src="/images/Download_on_the_App_Store_Badge.png" style="height:36px;" alt="App Store"></a></div></div>
        </div>

        <div id="curator-title" class="curator-head">
            <h3>${esc(c.curator_title)}</h3>
            <div class="sub">${esc(c.curator_sub)}</div>
        </div>
        <div class="curator-block">
            <div class="curator-inner">
                <div class="curator-text">${esc(c.curator_p1)}</div>
                <div class="curator-text">${esc(c.curator_p2)}</div>
                <div class="curated-list">
                    <div class="list-grid">
                        <div class="list-item"><div class="list-role">${esc(c.expo_role1)}</div><div class="list-detail">${esc(c.expo_detail1)}</div></div>
                        <div class="list-item"><div class="list-role">${esc(c.expo_role2)}</div><div class="list-detail">${esc(c.expo_detail2)}</div></div>
                        <div class="list-item"><div class="list-role">${esc(c.expo_role3)}</div><div class="list-detail"><span>${esc(c.expo_fair_note)}</span><span>${esc(c.expo_fair1)}</span><span>${esc(c.expo_fair2)}</span><span>${esc(c.expo_fair3)}</span><span>${esc(c.expo_fair4)}</span><span>${esc(c.expo_fair_more)}</span></div></div>
                        <div class="list-item"><div class="list-role">${esc(c.expo_role4)}</div><div class="list-detail">${esc(c.expo_detail4)}</div></div>
                    </div>
                    <div class="list-note">${esc(c.expo_note)}</div>
                </div>
            </div>
        </div>

        <div class="contact-area">
            <a href="mailto:hi@anselbi.com" class="contact-email-link">${esc(c.contact_btn)}</a>
            <div class="contact-note">${esc(c.contact_note)}</div>
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap" rel="stylesheet">
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

console.log("Done.");
