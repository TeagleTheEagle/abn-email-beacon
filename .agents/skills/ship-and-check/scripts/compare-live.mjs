#!/usr/bin/env node
// Tells whether the live site is running the same code as the local checkout. It fetches each page
// from both (server-rendered HTML, no browser needed), reduces the <body> to a list of
// "tag + classes + inline style + internal href" and visible-text lines, and diffs them. That catches
// copy changes and styling/layout changes, while ignoring things that legitimately differ between
// the dev server and the production build (asset URLs, scripts, dev-only attributes).
//
// Usage: node compare-live.mjs [--local http://localhost:8080] [--live https://www.teagueindustries.com.au]
//                              [--pages /,/about]
// The local server must be serving the commit you expect to be live, with no uncommitted changes.
import { spawnSync } from "node:child_process";

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--"))
    args[a.slice(2)] =
      process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : true;
}
const local = String(args.local ?? "http://localhost:8080").replace(/\/$/, "");
const live = String(args.live ?? "https://www.teagueindustries.com.au").replace(/\/$/, "");

const git = (...a) => spawnSync("git", a, { encoding: "utf8" }).stdout?.trim() ?? "";
const dirty = git("status", "--porcelain", "--untracked-files=no");
const head = git("log", "-1", "--format=%h %s");
const ahead = git("rev-list", "--count", "origin/main..HEAD");

// Git Bash on Windows rewrites "/about" into "C:/Program Files/Git/about"; undo that and allow "about".
const normPath = (p) => {
  const q = p.trim().match(/^[A-Za-z]:\/.*?\/Git(\/.*)$/)?.[1] ?? p.trim();
  return q.startsWith("/") ? q : `/${q}`;
};

async function pages() {
  if (typeof args.pages === "string")
    return args.pages
      .split(",")
      .filter((p) => p.trim())
      .map(normPath);
  const xml = await (await fetch(`${local}/sitemap.xml`)).text();
  return [
    ...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].trim()).pathname)),
  ];
}

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function signature(html) {
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  let body = html.slice(html.indexOf("<body"));
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const lines = [`title: ${title}`, `description: ${description}`];
  for (const m of body.matchAll(/<\/[^>]*>|<([a-z][a-z0-9-]*)([^>]*)>|([^<]+)/gi)) {
    if (!m[1] && !m[3]) continue; // closing tag
    if (m[3]) {
      const text = decode(m[3]).replace(/\s+/g, " ").trim();
      if (text) lines.push(`text: ${text}`);
      continue;
    }
    const tag = m[1].toLowerCase();
    if (["script", "style", "link", "meta"].includes(tag)) continue;
    const attrs = m[2];
    const cls = (attrs.match(/\sclass="([^"]*)"/)?.[1] ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join(" ");
    const style = attrs.match(/\sstyle="([^"]*)"/)?.[1] ?? "";
    const href = attrs.match(/\shref="(\/[^"]*|mailto:[^"]*|https?:[^"]*)"/)?.[1] ?? "";
    const keepHref =
      href && !/^\/(assets|src|@|node_modules)\//.test(href) ? ` href=${decode(href)}` : "";
    lines.push(`<${tag}${cls ? ` .${cls}` : ""}${style ? ` style=${style}` : ""}${keepHref}>`);
  }
  return lines;
}

function diff(a, b) {
  const count = (arr) => arr.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());
  const ca = count(a);
  const cb = count(b);
  const only = (x, y) =>
    [...x].flatMap(([k, n]) => Array(Math.max(0, n - (y.get(k) ?? 0))).fill(k));
  return { onlyLocal: only(ca, cb), onlyLive: only(cb, ca) };
}

// The live host can take several seconds to wake from a cold start, so one slow
// answer gets a second try with a longer wait instead of aborting the whole run.
const fetchHtml = async (url) => {
  for (const [attempt, timeoutMs] of [
    [1, 20000],
    [2, 60000],
  ]) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 compare-live" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      return { status: res.status, html: await res.text() };
    } catch (err) {
      if (attempt === 2) return { status: `error (${err.name ?? err})`, html: "" };
      console.log(`  … ${url} did not answer within ${timeoutMs / 1000}s, trying once more`);
    }
  }
};

console.log(
  `Local: ${local}  (HEAD ${head}${dirty ? ", UNCOMMITTED CHANGES — results include them" : ""}${+ahead ? `, ${ahead} commit(s) not pushed to GitHub` : ""})`,
);
console.log(`Live:  ${live}\n`);

let differing = 0;
for (const path of await pages()) {
  const [l, r] = await Promise.all([fetchHtml(local + path), fetchHtml(live + path)]);
  if (l.status !== r.status) {
    differing++;
    console.log(`✗ ${path}: HTTP ${l.status} locally vs ${r.status} live`);
    continue;
  }
  const { onlyLocal, onlyLive } = diff(signature(l.html), signature(r.html));
  if (!onlyLocal.length && !onlyLive.length) {
    console.log(`✓ ${path}: same`);
    continue;
  }
  differing++;
  console.log(
    `✗ ${path}: ${onlyLocal.length} line(s) only in local code, ${onlyLive.length} only on live site`,
  );
  for (const x of onlyLocal.slice(0, 8)) console.log(`    + local: ${x.slice(0, 160)}`);
  for (const x of onlyLive.slice(0, 8)) console.log(`    - live:  ${x.slice(0, 160)}`);
}
console.log(
  differing
    ? `\n${differing} page(s) differ. If the local code is what was just pushed, the live site hasn't been republished yet (Lovable: Publish → Update).`
    : `\nAll pages match: the live site is running this code.`,
);
