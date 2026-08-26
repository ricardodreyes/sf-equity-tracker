// Holds the built site to the design standards a browser can assert. Same rows
// against a local preview or production:  node verify.mjs http://localhost:4173
// Playwright resolves from ./node_modules, then $PLAYWRIGHT_PKG. Exit 1 on any fail.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PKG ?? "playwright");
const base = (process.argv[2] ?? "http://localhost:4173").replace(/\/$/, "");
const origin = new URL(base).origin;

const PAGES = [
  ["/", { rows: "#ledger tbody tr", h2min: 0 }],
  ["/evidence.html", { rows: "#district-table tbody tr", h2min: 4 }],
  ["/obligation.html?id=ch124-shelter-equity-analysis", { rows: "dl.kv dd", h2min: 3 }],
  ["/methodology.html", { rows: "main.page p", h2min: 5 }],
];
const VIEWPORTS = { mobile: { width: 375, height: 812 }, desktop: { width: 1280, height: 900 } };
const MAX_MS = 300;
const OK_PROPS = new Set(["color", "background-color", "border-color", "text-decoration-color", "outline-color", "opacity", "transform", "translate", "box-shadow"]);

const results = [];
const check = (where, id, ok, detail = "") => results.push({ where, id, ok, detail });

function luminance([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const PAGE_PROBE = `(() => {
  const rgb = (s) => (s.match(/[\\d.]+/g) || []).slice(0, 3).map(Number);
  const cs = (el, p) => getComputedStyle(el).getPropertyValue(p).trim();
  const bodyBg = rgb(cs(document.body, "background-color"));
  const signal = rgb(cs(document.documentElement, "--signal").length ? getComputedStyle(document.documentElement).getPropertyValue("--signal") : "");
  const out = {
    h1: document.querySelectorAll("h1").length,
    lang: document.documentElement.lang,
    title: document.title,
    description: !!document.querySelector('meta[name="description"]')?.content,
    favicon: !!document.querySelector('link[rel="icon"]'),
    current: document.querySelectorAll('header.site nav a[aria-current="page"]').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    fonts: ["Newsreader", "Plex"].map((f) => document.fonts.check("16px " + f)),
    imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
    svgUnlabeled: [...document.querySelectorAll("main svg")].filter((s) => !(s.getAttribute("aria-label") || s.querySelector("title") || s.getAttribute("aria-hidden") === "true")).length,
    scrollRegions: [...document.querySelectorAll("*")].filter((el) => { const s = getComputedStyle(el); return el !== document.documentElement && el !== document.body && ((/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) || (/(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth)); }).map((el) => ({ cls: el.className, focusable: el.tabIndex >= 0 })),
    bodyBg,
    textColors: [["body", document.body], ["note", document.querySelector(".note")], ["over", document.querySelector("td.days.over")], ["nav", document.querySelector("header.site nav a")]].filter(([, el]) => el).map(([k, el]) => [k, rgb(cs(el, "color"))]),
    signalOnWords: [...document.querySelectorAll("main *")].filter((el) => el.children.length === 0 && el.textContent.trim() && JSON.stringify(rgb(cs(el, "color"))) === JSON.stringify(rgb(getComputedStyle(document.documentElement).getPropertyValue("--signal")))).map((el) => el.tagName.toLowerCase() + "." + el.className).filter((s) => s !== "td.days over"),
    transitions: [...document.querySelectorAll("*")].map((el) => { const s = getComputedStyle(el); return { p: s.transitionProperty, d: s.transitionDuration, a: s.animationName }; }).filter((t) => (t.p !== "all" || t.d !== "0s") && (t.d !== "0s" || t.a !== "none")),
    tabular: [document.querySelector("td.days"), document.querySelector("table.data"), document.querySelector(".standfirst .figure")].filter(Boolean).map((el) => cs(el, "font-variant-numeric").includes("tabular-nums")),
    textWrap: [document.querySelector(".standfirst .caption"), document.querySelector("main.page > p")].filter(Boolean).map((el) => cs(el, "text-wrap")),
    navHeights: [...document.querySelectorAll("header.site nav a")].map((a) => Math.round(a.getBoundingClientRect().height)),
    links: [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin)),
  };
  return out;
})()`;

const browser = await chromium.launch();
try {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    for (const [path, expect] of PAGES) {
      const where = `${path.replace(/\?.*/, "") || "/"}@${vpName}`;
      const ctx = await browser.newContext({ viewport });
      const page = await ctx.newPage();
      const errors = [], failed = [], foreign = [];
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 120)); });
      page.on("requestfailed", (r) => failed.push(r.url()));
      page.on("request", (r) => { if (new URL(r.url()).origin !== origin) foreign.push(r.url()); });
      await page.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.waitForSelector(expect.rows, { timeout: 8000 }).catch(() => {});
      const p = await page.evaluate(PAGE_PROBE);
      const rows = await page.locator(expect.rows).count();
      const h2s = await page.locator("main h2").count();
      const cls = await page.evaluate(() => window.__cls);

      check(where, "no-console-errors", errors.length === 0, errors.join(" | "));
      check(where, "no-failed-requests", failed.length === 0, failed.join(" "));
      check(where, "same-origin-only", foreign.length === 0, foreign.slice(0, 3).join(" "));
      check(where, "data-rendered", rows > 0 && h2s >= expect.h2min, `${rows} rows, ${h2s} h2`);
      check(where, "one-h1", p.h1 === 1, `${p.h1} h1`);
      check(where, "metadata", p.lang === "en" && p.title.length > 0 && p.description && p.favicon, `${p.lang} "${p.title}"`);
      check(where, "nav-current", p.current === 1, `${p.current} aria-current`);
      check(where, "no-horizontal-overflow", p.overflow <= 1, `${p.overflow}px`);
      check(where, "fonts-loaded", p.fonts.every(Boolean), `Newsreader ${p.fonts[0]}, Plex ${p.fonts[1]}`);
      check(where, "images-labelled", p.imgNoAlt === 0 && p.svgUnlabeled === 0, `${p.imgNoAlt} img, ${p.svgUnlabeled} svg without a label`);
      check(where, "scroll-regions-focusable", p.scrollRegions.every((r) => r.focusable), p.scrollRegions.map((r) => r.cls).join(","));
      for (const [k, fg] of p.textColors) check(where, `contrast-${k}`, contrast(fg, p.bodyBg) >= 4.5, contrast(fg, p.bodyBg).toFixed(2) + ":1");
      check(where, "signal-not-on-words", p.signalOnWords.length === 0, p.signalOnWords.slice(0, 4).join(","));
      const badT = p.transitions.filter((t) => t.p === "all" || t.p.split(",").some((x) => !OK_PROPS.has(x.trim())) || t.d.split(",").some((x) => parseFloat(x) * (x.includes("ms") ? 1 : 1000) > MAX_MS));
      check(where, "transitions-sane", badT.length === 0, JSON.stringify(badT.slice(0, 2)));
      check(where, "tabular-nums", p.tabular.every(Boolean), p.tabular.join(","));
      check(where, "text-wrap-set", p.textWrap.length > 0 && p.textWrap.every((w) => w === "pretty" || w === "balance"), p.textWrap.join(","));
      check(where, "cls-under-0.1", cls < 0.1, cls.toFixed(3));
      if (vpName === "mobile") check(where, "nav-touch-target-44", p.navHeights.every((h) => h >= 44), p.navHeights.join(","));
      if (vpName === "desktop") {
        await page.keyboard.press("Tab");
        const focus = await page.evaluate(() => { const el = document.activeElement; const s = getComputedStyle(el); return { tag: el.tagName, outline: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0 }; });
        check(where, "focus-visible", focus.outline, `${focus.tag}`);
        const bad = [];
        for (const href of [...new Set(p.links)].slice(0, 40)) {
          const r = await page.request.get(href).catch(() => null);
          if (!r || r.status() >= 400) bad.push(`${href} ${r ? r.status() : "ERR"}`);
        }
        check(where, "internal-links-resolve", bad.length === 0, bad.slice(0, 3).join(" "));
      }
      await ctx.close();
    }
  }

  // reduced motion, dark mode, print, and the failure state, on the ledger
  const reduced = await browser.newContext({ reducedMotion: "reduce", viewport: VIEWPORTS.desktop });
  const rp = await reduced.newPage();
  await rp.goto(base + "/", { waitUntil: "networkidle" });
  const moving = await rp.evaluate(() => [...document.querySelectorAll("*")].filter((el) => { const s = getComputedStyle(el); return s.animationName !== "none" || s.transitionDuration.split(",").some((d) => parseFloat(d) > 0); }).length);
  check("/@reduced-motion", "nothing-moves", moving === 0, `${moving} elements still animate`);
  await reduced.close();

  const dark = await browser.newContext({ colorScheme: "dark", viewport: VIEWPORTS.desktop });
  const dp = await dark.newPage();
  await dp.goto(base + "/", { waitUntil: "networkidle" });
  const d = await dp.evaluate(PAGE_PROBE);
  check("/@dark", "dark-tokens-applied", luminance(d.bodyBg) < 0.1, `bg rgb(${d.bodyBg})`);
  for (const [k, fg] of d.textColors) check("/@dark", `contrast-${k}`, contrast(fg, d.bodyBg) >= 4.5, contrast(fg, d.bodyBg).toFixed(2) + ":1");
  await dark.close();

  const print = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const pp = await print.newPage();
  await pp.goto(base + "/", { waitUntil: "networkidle" });
  await pp.emulateMedia({ media: "print" });
  const pr = await pp.evaluate(() => ({
    nav: getComputedStyle(document.querySelector("header.site nav")).display,
    bg: getComputedStyle(document.body).backgroundColor,
    mark: getComputedStyle(document.querySelector("tr.is-missing .row-title"), "::before").content,
  }));
  check("/@print", "print-stylesheet", pr.nav === "none" && /255, 255, 255/.test(pr.bg) && pr.mark.includes("!"), JSON.stringify(pr));
  await print.close();

  for (const [path, data] of [["/", "obligations.json"], ["/evidence.html", "rollup_districts.json"], ["/obligation.html?id=ch124-shelter-equity-analysis", "obligations.json"]]) {
    const broken = await browser.newContext({ viewport: VIEWPORTS.desktop });
    const bp = await broken.newPage();
    await bp.route(`**/data/${data}`, (r) => r.abort());
    await bp.goto(base + path, { waitUntil: "networkidle" }).catch(() => {});
    const text = await bp.evaluate(() => document.querySelector("main")?.innerText ?? "");
    const stuck = /loading/i.test(text) && !/could not|couldn't|failed|unavailable|try again|reload/i.test(text);
    check(`${path.replace(/\?.*/, "")}@fetch-failure`, "error-state-shown", !stuck && /could not|couldn't|failed|unavailable|try again|reload/i.test(text), text.slice(0, 80).replace(/\n/g, " "));
    await broken.close();
  }
  const nf = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const np = await nf.newPage();
  await np.goto(base + "/obligation.html?id=does-not-exist", { waitUntil: "networkidle" });
  const nft = await np.evaluate(() => document.querySelector("main")?.innerText ?? "");
  check("/obligation.html@unknown-id", "not-found-state", /not found/i.test(nft) && /back to the ledger/i.test(nft), nft.slice(0, 60).replace(/\n/g, " "));
  await nf.close();
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "pass" : "FAIL"}  ${r.where.padEnd(34)} ${r.id.padEnd(26)} ${r.detail}`);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed against ${base}`);
process.exit(failed.length ? 1 : 0);
