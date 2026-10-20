#!/usr/bin/env node
// Read-only site check in headless Chrome. For every page (from the site's sitemap by default) at
// desktop and phone width it records: HTTP status, how long the main heading takes to become
// visible, console errors, failed requests, content that never appears after scrolling, and
// sideways overflow on phones. It saves screenshots, then checks every internal link (and anchor).
// It only loads pages and scrolls: it never clicks, types, submits forms or touches the cart.
//
// Usage: node site-check.mjs [--base http://localhost:8080] [--out <dir>] [--pages /,/about]
//                            [--external] [--no-full]
// Needs Node 22+ (built-in fetch/WebSocket) and Chrome or Edge (or set CHROME_PATH).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const base = String(args.base ?? "http://localhost:8080").replace(/\/$/, "");
const origin = new URL(base).origin;
const out = resolve(String(args.out ?? join(tmpdir(), `site-check-${Date.now()}`)));
const shotsDir = join(out, "screenshots");
mkdirSync(shotsDir, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];
const SLOW_HEADING_MS = 2500;
const MISSING_PATH = "/__site-check-missing-page";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const firstLine = (s) =>
  String(s ?? "")
    .split("\n")[0]
    .slice(0, 220);

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    o[key] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  }
  return o;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error("Chrome/Edge not found. Set CHROME_PATH to the browser executable.");
  return found;
}

// Git Bash on Windows rewrites "/about" into "C:/Program Files/Git/about"; undo that and allow "about".
const normPath = (p) => {
  const q = p.trim().match(/^[A-Za-z]:\/.*?\/Git(\/.*)$/)?.[1] ?? p.trim();
  return q.startsWith("/") ? q : `/${q}`;
};

async function pagesToCheck() {
  if (typeof args.pages === "string")
    return args.pages
      .split(",")
      .filter((p) => p.trim())
      .map(normPath);
  try {
    const xml = await (await fetch(`${base}/sitemap.xml`)).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1].trim()).pathname,
    );
    if (paths.length) return [...new Set(paths)];
  } catch {}
  return ["/"];
}

// Minimal Chrome DevTools Protocol client over the built-in WebSocket.
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else if (m.method) {
      for (const fn of listeners.get(m.method) ?? []) fn(m.params);
    }
  });
  return {
    send(method, params = {}) {
      return new Promise((res, rej) => {
        pending.set(++id, (m) =>
          m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result),
        );
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
    on(method, fn) {
      listeners.set(method, [...(listeners.get(method) ?? []), fn]);
    },
    once(method, timeoutMs) {
      return new Promise((res) => {
        const timer = setTimeout(() => res(null), timeoutMs);
        this.on(method, (p) => {
          clearTimeout(timer);
          res(p);
        });
      });
    },
    close: () => ws.close(),
  };
}

async function evaluate(cdp, expression) {
  const r = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return r.result?.value;
}

// Effective opacity = product of opacities up the ancestor chain (a parent at 0 hides its children).
const OPACITY_FN = `const eff = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };`;

const HEADING_STATE = `(() => { ${OPACITY_FN}
  const h = document.querySelector("main h1, h1") || document.querySelector("h2");
  if (!h) return "none";
  const r = h.getBoundingClientRect();
  return r.height > 0 && eff(h) >= 0.95 ? "visible" : "hidden"; })()`;

const NEVER_APPEARED = `(() => { ${OPACITY_FN}
  const out = [];
  for (const el of document.body.querySelectorAll("*")) {
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!ownText && !["IMG", "BUTTON", "INPUT"].includes(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || el.closest("[aria-hidden=true],[hidden]")) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (eff(el) < 0.1) out.push(el.tagName.toLowerCase() + ": " + (el.textContent || el.alt || "").trim().slice(0, 60));
  }
  return out; })()`;

const PAGE_FACTS = `(() => ({
  title: document.title,
  overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
  links: [...document.querySelectorAll("a[href]")].map((a) => a.href),
}))()`;

async function checkPage(port, path, vp) {
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })
  ).json();
  const cdp = await connect(target.webSocketDebuggerUrl);
  const result = {
    path,
    viewport: vp.name,
    status: null,
    serverMs: null,
    headingMs: null,
    heading: "none",
    errors: [],
    failedRequests: [],
    neverAppeared: [],
    overflowPx: 0,
    title: "",
    links: [],
  };
  const urls = new Map();
  cdp.on("Network.requestWillBeSent", (p) => urls.set(p.requestId, p.request.url));
  cdp.on("Network.responseReceived", (p) => {
    if (p.type === "Document" && result.status === null) {
      result.status = p.response.status;
      result.serverMs = p.response.timing ? Math.round(p.response.timing.receiveHeadersEnd) : null;
    } else if (p.response.status >= 400)
      result.failedRequests.push(`${p.response.status} ${p.response.url}`);
  });
  cdp.on("Network.loadingFailed", (p) => {
    if (!p.canceled && p.type !== "Document")
      result.failedRequests.push(`${p.errorText} ${urls.get(p.requestId) ?? ""}`);
  });
  cdp.on("Runtime.exceptionThrown", (p) =>
    result.errors.push(
      "exception: " +
        firstLine(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text),
    ),
  );
  cdp.on("Runtime.consoleAPICalled", (p) => {
    if (p.type === "error")
      result.errors.push(
        "console.error: " + firstLine(p.args.map((a) => a.value ?? a.description ?? "").join(" ")),
      );
  });

  try {
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    });
    if (vp.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });

    const navigated = cdp.once("Page.frameNavigated", 20000);
    const loaded = cdp.once("Page.loadEventFired", 30000);
    const t0 = Date.now();
    await cdp.send("Page.navigate", { url: base + path });
    await navigated;
    while (Date.now() - t0 < 10000) {
      const state = await evaluate(cdp, HEADING_STATE).catch(() => "none");
      result.heading = state;
      if (state === "visible") {
        result.headingMs = Date.now() - t0;
        break;
      }
      await sleep(100);
    }
    await loaded;
    await sleep(1000);

    // Scroll like a visitor so scroll-triggered content gets its chance to appear.
    const height = (await evaluate(cdp, "document.documentElement.scrollHeight")) ?? 0;
    for (let y = 0; y < height; y += Math.round(vp.height * 0.6)) {
      await evaluate(cdp, `window.scrollTo(0, ${y})`);
      await sleep(200);
    }
    await sleep(900);
    result.neverAppeared = (await evaluate(cdp, NEVER_APPEARED)) ?? [];
    await evaluate(cdp, "window.scrollTo(0, 0)");
    await sleep(400);

    const facts = (await evaluate(cdp, PAGE_FACTS)) ?? {};
    Object.assign(result, {
      title: facts.title ?? "",
      overflowPx: facts.overflowPx ?? 0,
      links: facts.links ?? [],
    });

    const slug = path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-");
    const save = async (name, full) => {
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: full,
      });
      const file = join(shotsDir, `${slug}-${vp.name}${name}.png`);
      writeFileSync(file, Buffer.from(shot.data, "base64"));
      return file;
    };
    result.screenshot = await save("", false);
    if (!args["no-full"]) result.screenshotFull = await save("-full", true);
  } catch (e) {
    result.errors.push("check failed: " + firstLine(e.message));
  } finally {
    cdp.close();
    await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {});
  }
  return result;
}

async function checkLink(url) {
  const u = new URL(url);
  const hash = decodeURIComponent(u.hash.slice(1));
  u.hash = "";
  try {
    const res = await fetch(u, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "Mozilla/5.0 site-check" },
    });
    let anchorMissing = false;
    if (hash && res.ok && (res.headers.get("content-type") ?? "").includes("html")) {
      const html = await res.text();
      anchorMissing = !html.includes(`id="${hash}"`);
    }
    return { url, status: res.status, anchorMissing };
  } catch (e) {
    return { url, status: 0, error: firstLine(e.message) };
  }
}

const pages = await pagesToCheck();
const profile = join(out, ".chrome-profile");
const port = 9200 + Math.floor(Math.random() * 700);
const chrome = spawn(
  findChrome(),
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let ready = false;
for (let i = 0; i < 75 && !ready; i++) {
  ready = await fetch(`http://127.0.0.1:${port}/json/version`).then(
    (r) => r.ok,
    () => false,
  );
  if (!ready) await sleep(200);
}
if (!ready) {
  chrome.kill();
  throw new Error("Headless Chrome did not start.");
}

const results = [];
for (const path of [...pages, MISSING_PATH]) {
  for (const vp of path === MISSING_PATH ? VIEWPORTS.slice(0, 1) : VIEWPORTS) {
    process.stderr.write(`checking ${path} (${vp.name})\n`);
    results.push(await checkPage(port, path, vp));
  }
}
chrome.kill();
await sleep(500);
try {
  rmSync(profile, { recursive: true, force: true });
} catch {}

// Link check: every internal link found on any page, plus external ones with --external.
const linkPages = new Map();
for (const r of results) {
  if (r.path === MISSING_PATH) continue;
  for (const l of r.links) {
    if (!/^https?:/.test(l)) continue;
    if (!linkPages.has(l)) linkPages.set(l, new Set());
    linkPages.get(l).add(r.path);
  }
}
const internal = [...linkPages.keys()].filter((l) => new URL(l).origin === origin);
const external = [...linkPages.keys()].filter((l) => new URL(l).origin !== origin);
const linkResults = [];
for (const l of [...internal, ...(args.external ? external : [])])
  linkResults.push({ ...(await checkLink(l)), foundOn: [...linkPages.get(l)] });
const brokenLinks = linkResults.filter((l) => l.status === 0 || l.status >= 400 || l.anchorMissing);

// Report
const missing = results.find((r) => r.path === MISSING_PATH);
const main = results.filter((r) => r.path !== MISSING_PATH);
// Lovable serves uploaded images from /__l5e/ on its hosting only, so they 404 on localhost.
const isLocal = ["localhost", "127.0.0.1"].includes(new URL(base).hostname);
const lovableAssetFailures = new Set();
for (const r of main) {
  r.failedRequests = r.failedRequests.filter(
    (f) => !(isLocal && f.includes("/__l5e/") && lovableAssetFailures.add(f.split(" ").pop())),
  );
}
const problems = [];
for (const r of main) {
  const where = `${r.path} (${r.viewport})`;
  if (r.status !== 200) problems.push(`${where}: HTTP ${r.status}`);
  if (r.headingMs === null)
    problems.push(
      `${where}: main heading ${r.heading === "none" ? "not found" : "still invisible after 10s"}`,
    );
  else if (r.headingMs > SLOW_HEADING_MS)
    problems.push(
      `${where}: main heading took ${r.headingMs}ms to appear` +
        (r.serverMs > r.headingMs * 0.6
          ? ` (the server took ${r.serverMs}ms to respond, so this is server time, often a cold start; re-check)`
          : ""),
    );
  for (const e of r.errors) problems.push(`${where}: ${e}`);
  for (const f of r.failedRequests) problems.push(`${where}: failed request ${f}`);
  if (r.neverAppeared.length)
    problems.push(
      `${where}: ${r.neverAppeared.length} element(s) never became visible, e.g. ${r.neverAppeared.slice(0, 3).join(" | ")}`,
    );
  if (r.overflowPx > 0)
    problems.push(`${where}: page is ${r.overflowPx}px wider than the screen (sideways scroll)`);
}
if (missing && missing.status !== 404)
  problems.push(`Unknown URL ${MISSING_PATH} returned HTTP ${missing.status} instead of 404`);
for (const l of brokenLinks)
  problems.push(
    `Broken link ${l.url} (${l.anchorMissing ? "anchor not found" : (l.error ?? "HTTP " + l.status)}) on ${l.foundOn.join(", ")}`,
  );

const fmtMs = (r) => (r ? (r.headingMs === null ? "never" : `${r.headingMs}ms`) : "-");
const rows = pages.map((p) => {
  const d = main.find((r) => r.path === p && r.viewport === "desktop");
  const m = main.find((r) => r.path === p && r.viewport === "mobile");
  const issues = main
    .filter((r) => r.path === p)
    .reduce(
      (n, r) =>
        n +
        r.errors.length +
        r.failedRequests.length +
        (r.neverAppeared.length ? 1 : 0) +
        (r.overflowPx ? 1 : 0),
      0,
    );
  const server = [d, m].map((r) => (r?.serverMs == null ? "-" : `${r.serverMs}ms`)).join(" / ");
  return `| \`${p}\` | ${d?.status ?? "-"} | ${server} | ${fmtMs(d)} | ${fmtMs(m)} | ${issues || "✓"} | ${(d?.title ?? "").replace(/\|/g, "/")} |`;
});
const report = [
  `# Site check: ${base}`,
  ``,
  `${new Date().toISOString()} · ${pages.length} pages × desktop (1440×900) + phone (390×844) · read-only (no clicks, forms or cart)`,
  ``,
  `| Page | HTTP | Server response (desktop / phone) | Heading visible (desktop) | Heading visible (phone) | Issues | Title |`,
  `|---|---|---|---|---|---|---|`,
  ...rows,
  ``,
  `Unknown URL test: ${MISSING_PATH} → HTTP ${missing?.status ?? "?"} ("${missing?.title ?? ""}")`,
  `Links: ${internal.length} internal checked${args.external ? `, ${external.length} external checked` : `, ${external.length} external not checked (use --external)`}, ${brokenLinks.length} broken`,
  ``,
  problems.length
    ? `## Problems (${problems.length})\n\n${problems.map((p) => `- ${p}`).join("\n")}`
    : `## Problems\n\nNone found.`,
  ``,
  ...(lovableAssetFailures.size
    ? [
        `Note: ${lovableAssetFailures.size} Lovable-hosted image(s) (/__l5e/…) didn't load. Expected on localhost; they are served on the live site.`,
        ``,
      ]
    : []),
  `Screenshots: ${shotsDir}`,
  `(Full-page screenshots may show the fixed nav bar part-way down the page; that is a capture artefact, not a bug.)`,
].join("\n");

writeFileSync(join(out, "report.md"), report);
writeFileSync(
  join(out, "report.json"),
  JSON.stringify({ base, pages, results, links: linkResults, problems }, null, 2),
);
console.log(report);
console.log(`\nFull results: ${join(out, "report.json")}`);
