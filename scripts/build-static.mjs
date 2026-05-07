#!/usr/bin/env node
// build-static.mjs — generate per-route static HTML for crawler / AEO surface.
//
// SPAs that hash-route are invisible to most crawlers and unreliably parsed by
// AI-search agents. This script emits a real HTML file for every canonical
// resource (insight, operator, pattern, contradiction, playbook, daily entry,
// list pages). Each page contains:
//   - Full content rendered as static HTML (no JS required to read it).
//   - Schema.org JSON-LD structured data — Article for insights, Person for
//     operators, generic for the rest.
//   - Per-route <title>, meta description, canonical URL, og:* and twitter:*.
//   - A redirect script that takes JS-enabled clients to the SPA hash route
//     for the rich interactive view.
//
// The static file lives at the path a crawler would expect, e.g.
//   docs/ins/<id>/index.html
//   docs/o/<slug>/index.html
//   docs/pat/<id>/index.html
//   docs/con/<id>/index.html
//   docs/play/<id>/index.html
//   docs/today/<date>/index.html
//
// Run after build-index.mjs so INDEX.json is current.

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const LIB = join(ROOT, "insight-library");
const DOCS = join(ROOT, "docs");
const SITE_URL = "https://codex.iamkesava.com";

// Shared Person + Organization references. Every static page's @graph cites
// these by @id so AI search agents see one canonical entity per author/org
// across the entire corpus instead of duplicate per-page Person nodes.
const PERSON_KESAVA_ID = "https://iamkesava.com/#kesava";
const ORG_CODEX_ID = SITE_URL + "/#org";
const PUBLISHER_REF = { "@id": ORG_CODEX_ID };

const escapeHtml = s => (s || "").toString().replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// YAML scalar decoder — single quotes use '' to escape ', double quotes use
// backslash escapes. Apply once per value so frontmatter strings render as
// the author wrote them (e.g. "can't" instead of "can''t").
function unyaml(v){
  if (typeof v !== "string") return v;
  if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/\\(["\\\/bfnrt])/g, (_, c) => ({n:"\n",t:"\t",r:"\r",b:"\b",f:"\f","\\":"\\","\"":"\"","\/":"/"}[c] || c));
  return v;
}
function parseFrontmatter(text){
  if (!text.startsWith("---\n")) return { fm: {}, body: text };
  const end = text.indexOf("\n---", 4);
  if (end < 0) return { fm: {}, body: text };
  const fm = text.slice(4, end);
  const body = text.slice(end + 4).trimStart();
  const obj = {};
  let lastKey = null;
  for (const line of fm.split("\n")){
    if (line.trim() === "") continue;
    const top = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (top){
      const [, k, vRaw] = top;
      lastKey = k;
      const v = vRaw.trim();
      if (v === ""){ obj[k] = []; continue; }
      if (v.startsWith("[") && v.endsWith("]")){
        obj[k] = v.slice(1, -1).split(",").map(s => unyaml(s.trim())).filter(Boolean);
      } else {
        obj[k] = unyaml(v);
      }
      continue;
    }
    if (line.startsWith("  - ") && lastKey){
      const item = unyaml(line.slice(4).trim());
      if (!Array.isArray(obj[lastKey])) obj[lastKey] = [];
      obj[lastKey].push(item);
    }
  }
  return { fm: obj, body };
}

// Minimal markdown → HTML, mirroring the SPA's mdToHtml just enough for static.
// Returns sanitized HTML; markdown is trusted because it comes from the repo.
function mdToHtml(md){
  let html = md;
  html = html.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${escapeHtml(c)}</code></pre>`);
  const lines = html.split("\n");
  const out = [];
  let inList = false, inQuote = false;
  const inline = s => s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s({\[])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${escapeAttr(u)}">${t}</a>`);
  for (const line of lines){
    if (/^#\s+/.test(line)){ if(inList){out.push("</ul>");inList=false;} if(inQuote){out.push("</blockquote>");inQuote=false;} out.push(`<h1>${inline(line.replace(/^#\s+/, ""))}</h1>`); continue; }
    if (/^##\s+/.test(line)){ if(inList){out.push("</ul>");inList=false;} if(inQuote){out.push("</blockquote>");inQuote=false;} out.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`); continue; }
    if (/^###\s+/.test(line)){ if(inList){out.push("</ul>");inList=false;} if(inQuote){out.push("</blockquote>");inQuote=false;} out.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`); continue; }
    if (/^>\s?/.test(line)){ if(!inQuote){out.push("<blockquote>");inQuote=true;} out.push(`<p>${inline(line.replace(/^>\s?/, ""))}</p>`); continue; } else if (inQuote){ out.push("</blockquote>"); inQuote = false; }
    if (/^[-*]\s+/.test(line)){ if(!inList){out.push("<ul>");inList=true;} out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`); continue; }
    if (inList && line.trim() === ""){ out.push("</ul>"); inList = false; out.push(""); continue; }
    if (line.trim() === ""){ out.push(""); continue; }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  if (inQuote) out.push("</blockquote>");
  return out.join("\n");
}
function escapeAttr(s){ return s.replace(/"/g, "&quot;"); }

// Map a markdown-relative path inside body to its canonical SPA route, so links
// in static pages route to other static pages (via the canonical /<route>/ URL).
// Also: promote inline <code>ins_X</code> cross-references to clickable links
// pointing to the relevant static page, with the resource's full title as the
// link text so readers see meaning, not slugs.
function rewriteBodyLinks(html, INDEX){
  // 1. Markdown link href rewriting (path → canonical URL).
  html = html.replace(/href="([^"]+)"/g, (m, href) => {
    if (href.startsWith("#") || /^https?:/.test(href) || href.startsWith("mailto:")) return m;
    const norm = href.replace(/^\.\//, "").replace(/^insight-library\//, "").toLowerCase();
    const ins = INDEX.insights.find(c => (c.path || "").toLowerCase() === norm);
    if (ins) return `href="${SITE_URL}/ins/${ins.id}/"`;
    const op = INDEX.operators.find(o => (o.path || "").toLowerCase() === norm);
    if (op) return `href="${SITE_URL}/o/${op.slug}/"`;
    const pat = INDEX.patterns.find(p => (p.path || "").toLowerCase() === norm);
    if (pat && pat.id) return `href="${SITE_URL}/pat/${pat.id}/"`;
    const con = INDEX.contradictions.find(c => (c.path || "").toLowerCase() === norm);
    if (con && con.id) return `href="${SITE_URL}/con/${con.id}/"`;
    const pb = INDEX.playbooks.find(p => (p.path || "").toLowerCase() === norm);
    if (pb && pb.id) return `href="${SITE_URL}/play/${pb.id}/"`;
    return m;
  });

  // 2. Markdown link text rewriting — if the rendered link text matches the
  //    resource id/slug/filename, replace with the resource's title so
  //    static-page readers see meaning, not slugs.
  html = html.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, (m, href, text) => {
    const t = (text || "").trim().toLowerCase();
    if (!t) return m;
    const swap = title => `<a href="${href}">${escapeHtml(title)}</a>`;
    let mm;
    if ((mm = href.match(/\/ins\/([^/]+)\/?$/))){
      const ins = INDEX.insights.find(i => i.id === mm[1]);
      if (ins && (t === ins.id.toLowerCase() || t === mm[1].toLowerCase())){
        return swap(ins.title || ins.id);
      }
    }
    if ((mm = href.match(/\/o\/([^/]+)\/?$/))){
      const op = INDEX.operators.find(o => o.slug === mm[1]);
      if (op && t === op.slug.toLowerCase()){
        return swap(op.name || op.slug);
      }
    }
    if ((mm = href.match(/\/pat\/([^/]+)\/?$/))){
      const p = INDEX.patterns.find(x => x.id === mm[1]);
      if (p && t === p.id.toLowerCase()){
        return swap(p.title || p.id);
      }
    }
    return m;
  });

  // 3. Inline <code>ins_X</code> / <code>pat_X</code> / <code>con_X</code>
  //    that map to a known resource → wrap in an <a> with the resource title.
  html = html.replace(/<code>([^<]+)<\/code>/g, (m, text) => {
    const t = (text || "").trim();
    const lower = t.toLowerCase();
    const wrap = (route, title) =>
      `<a class="inline-cross-ref" href="${route}">${escapeHtml(title)}</a>`;
    if (lower.startsWith("ins_")){
      const ins = INDEX.insights.find(i => i.id && i.id.toLowerCase() === lower);
      if (ins) return wrap(`${SITE_URL}/ins/${ins.id}/`, ins.title || ins.id);
    } else if (lower.startsWith("pat_")){
      const p = INDEX.patterns.find(x => x.id && x.id.toLowerCase() === lower);
      if (p) return wrap(`${SITE_URL}/pat/${p.id}/`, p.title || p.id);
    } else if (lower.startsWith("con_")){
      const c = INDEX.contradictions.find(x => x.id && x.id.toLowerCase() === lower);
      if (c) return wrap(`${SITE_URL}/con/${c.id}/`, c.title || c.id);
    }
    return m;
  });

  return html;
}

function shell({ title, description, canonical, hashRoute, jsonLd, body, ogImage }){
  const fullTitle = title ? `${escapeHtml(title)} · a builder's codex` : "a builder's codex";
  const desc = escapeHtml(description || "A primary-source library of operator insights. Atomic claims, named operators, verifiable sources.");
  const url = canonical;
  const og = ogImage || `${SITE_URL}/og.svg`;
  const ld = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${escapeAttr(url)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta property="og:type" content="article">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${escapeAttr(url)}">
<meta property="og:image" content="${escapeAttr(og)}">
<meta property="og:site_name" content="a builder's codex">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${fullTitle}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${escapeAttr(og)}">
<link rel="alternate" type="application/rss+xml" title="a builder's codex · release log" href="${SITE_URL}/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* Static page styling — self-contained so the HTML reads cleanly without
   the SPA's stylesheet (which targets different selectors). Carries the
   codex typography palette but in a layout tuned for crawlers + readers. */
:root{--paper:#f3f5ee;--paper-2:#e6ebe0;--ink:#0d1410;--ink-2:#2a3530;--muted:#6b7868;--accent:#1f9d55;--accent-2:#15803d;--line:#0d141022;--line-2:#0d141012}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;background:var(--paper);color:var(--ink);margin:0;-webkit-font-smoothing:antialiased;line-height:1.55}
.static-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--line-2);background:color-mix(in oklab,var(--paper) 92%,transparent);backdrop-filter:blur(8px);position:sticky;top:0;z-index:10}
.static-topbar .brand{font-family:Newsreader,Georgia,serif;font-weight:500;font-size:1.05rem;letter-spacing:-.01em;color:var(--ink);text-decoration:none;display:flex;align-items:center;gap:8px}
.static-topbar .brand:hover{color:var(--accent-2)}
.static-topbar .brand .dot{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px color-mix(in oklab,var(--accent) 60%,transparent)}
.static-topbar nav{display:flex;gap:18px;font-family:JetBrains Mono,monospace;font-size:.72rem}
.static-topbar nav a{color:var(--muted);text-decoration:none}
.static-topbar nav a:hover{color:var(--ink)}
main.static{max-width:880px;margin:0 auto;padding:48px 24px 120px}
.static-crumbs{font-family:JetBrains Mono,monospace;font-size:.7rem;color:var(--muted);margin-bottom:18px}
.static-crumbs a{color:var(--ink-2);text-decoration:none;border-bottom:1px solid transparent;padding-bottom:1px;transition:color .2s,border-color .2s}
.static-crumbs a:hover{color:var(--accent);border-bottom-color:currentColor}
main.static h1{font-family:Newsreader,Georgia,serif;font-weight:400;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.02em;line-height:1.12;margin-bottom:18px;color:var(--ink)}
main.static h2{font-family:Newsreader,Georgia,serif;font-weight:400;font-size:1.5rem;margin:1.8em 0 .5em;line-height:1.25;color:var(--ink)}
main.static h3{font-family:Newsreader,Georgia,serif;font-weight:400;font-size:1.15rem;margin:1.4em 0 .4em;color:var(--ink)}
main.static p{margin:.7em 0;line-height:1.65;max-width:72ch;color:var(--ink-2)}
main.static a{color:var(--ink);border-bottom:1px solid var(--line);padding-bottom:1px;text-decoration:none;transition:color .2s,border-color .2s}
main.static a:hover{color:var(--accent);border-bottom-color:currentColor}
main.static a.inline-cross-ref{font-family:Newsreader,serif}
main.static ul{margin:.5em 0 1em 1.4em;display:flex;flex-direction:column;gap:.4em}
main.static li{padding-left:.2em;color:var(--ink-2)}
main.static blockquote{margin:1em 0;padding:.4em 0 .4em 16px;border-left:2px solid var(--accent);color:var(--ink-2);font-style:italic}
main.static strong{color:var(--ink);font-weight:500}
main.static code{font-family:JetBrains Mono,monospace;font-size:.85em;background:color-mix(in oklab,var(--ink) 6%,transparent);padding:1px 6px;border-radius:3px}
main.static pre{background:color-mix(in oklab,var(--ink) 4%,transparent);padding:14px 16px;border-radius:6px;overflow-x:auto;margin:1em 0}
main.static pre code{background:transparent;padding:0}
.static-meta{font-family:JetBrains Mono,monospace;font-size:.78rem;color:var(--muted);margin:0 0 8px;padding:8px 0;border-bottom:1px solid var(--line-2)}
.static-meta a{font-family:inherit;color:var(--ink-2);border-bottom:0}
.static-meta a:hover{color:var(--accent)}
.static-tldr{margin:28px 0 32px;padding:20px 24px;border-left:3px solid var(--accent);background:var(--paper-2);border-radius:0 8px 8px 0}
.static-tldr-label{font-family:JetBrains Mono,monospace;font-size:.62rem;letter-spacing:.12em;color:var(--accent-2);text-transform:uppercase;margin-bottom:10px;font-weight:600}
.static-tldr-claim{font-family:Newsreader,serif;font-size:1.2rem;line-height:1.4;color:var(--ink);font-weight:500}
.static-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:40px;padding-top:24px;border-top:1px solid var(--line)}
.static-actions a,.static-actions button{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:1px solid var(--line);border-radius:999px;color:var(--ink-2);text-decoration:none;font-family:JetBrains Mono,monospace;font-size:.72rem;background:transparent;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.static-actions a:hover,.static-actions button:hover{border-color:var(--accent);color:var(--accent-2);background:color-mix(in oklab,var(--accent) 8%,transparent)}
.static-actions .primary{background:var(--accent);border-color:var(--accent);color:#fff}
.static-actions .primary:hover{background:var(--accent-2);border-color:var(--accent-2);color:#fff}
.static-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin:18px 0}
.static-card{padding:14px 16px;border:1px solid var(--line);border-radius:6px;text-decoration:none;color:var(--ink);transition:border-color .15s,transform .15s}
.static-card:hover{border-color:var(--accent);transform:translateY(-1px)}
.static-card .tier{font-family:JetBrains Mono,monospace;font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.static-card-title{font-family:Newsreader,serif;font-size:1rem;line-height:1.3}
.static-footer{max-width:880px;margin:0 auto;padding:32px 24px 64px;border-top:1px solid var(--line-2);font-family:JetBrains Mono,monospace;font-size:.72rem;color:var(--muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px}
.static-footer a{color:var(--ink-2);text-decoration:none;border-bottom:1px solid transparent}
.static-footer a:hover{color:var(--accent);border-bottom-color:currentColor}
@media (prefers-color-scheme:dark){
  :root{--paper:#0a0e0a;--paper-2:#0d1410;--ink:#e6ecdf;--ink-2:#c5cbbe;--muted:#7a8174;--accent:#3aaf6d;--accent-2:#52c084;--line:#ffffff22;--line-2:#ffffff10}
}
@media (max-width:680px){
  .static-topbar nav{display:none}
  main.static{padding:32px 18px 80px}
  .static-actions{flex-direction:column;align-items:stretch}
  .static-actions a,.static-actions button{justify-content:center}
}
</style>
${ld}
</head>
<body>
<header class="static-topbar">
  <a class="brand" href="${SITE_URL}/"><span class="dot" aria-hidden="true"></span>a builder's codex</a>
  <nav>
    <a href="${SITE_URL}/operators/">operators</a>
    <a href="${SITE_URL}/patterns/">patterns</a>
    <a href="${SITE_URL}/playbooks/">playbooks</a>
    <a href="${SITE_URL}/today/">today</a>
    <a href="${SITE_URL}/#/about">about</a>
  </nav>
</header>
<main class="static">
${body}
</main>
<footer class="static-footer">
  <div>made by <a href="https://apps.iamkesava.com" rel="noopener">Kesava</a> · <a href="https://github.com/k3sava/ab-codex" rel="noopener">GitHub</a> · MIT</div>
  <div><a href="${SITE_URL}/llms.txt" rel="noopener">llms.txt</a> · <a href="${SITE_URL}/sitemap.xml" rel="noopener">sitemap</a> · <a href="${SITE_URL}/rss.xml" rel="noopener">RSS</a></div>
</footer>
</body>
</html>`;
}

function tldrFor(card){
  return `<div class="static-tldr">
    <div class="static-tldr-label">Tier ${escapeHtml(card.tier || "C")} · TL;DR</div>
    <div class="static-tldr-claim">${escapeHtml(card.claim || card.title || card.id)}</div>
  </div>`;
}

async function ensureDir(p){ await mkdir(p, { recursive: true }); }

async function main(){
  // Read INDEX.json (must be built first).
  const INDEX = JSON.parse(await readFile(join(LIB, "INDEX.json"), "utf8"));
  // Normalise — patterns and contradictions store their title in `title`.
  // Operators are keyed by `slug`.
  let count = 0;

  // Helper to write static HTML for a markdown file at canonical URL.
  const writeOne = async ({ outPath, title, description, canonical, hashRoute, jsonLd, body, ogImage }) => {
    const html = shell({ title, description, canonical, hashRoute, jsonLd, body, ogImage });
    await ensureDir(dirname(outPath));
    await writeFile(outPath, html);
    count++;
  };

  // === insights ===
  for (const i of INDEX.insights){
    const filePath = join(LIB, i.path);
    if (!existsSync(filePath)) continue;
    const text = await readFile(filePath, "utf8");
    const { body } = parseFrontmatter(text);
    // Strip leading H1 (we render our own header).
    const cleaned = body.replace(/^#\s+[^\n]+\n+/, "");
    const renderedBody = rewriteBodyLinks(mdToHtml(cleaned), INDEX);
    const tldr = tldrFor({ tier: i.tier, claim: i.title || i.id });
    const opName = i.operator || "unknown";
    const opSlug = (opName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const sourceLink = i.source_url ? `<a href="${escapeAttr(i.source_url)}" rel="external nofollow">${escapeHtml(i.source_title || i.source_url)}</a>` : "·";
    // Co-authors as a "with X, Y" line in the byline.
    const coAuthors = (Array.isArray(i.co_operators) && i.co_operators.length)
      ? ` with ${i.co_operators.map(co => `<a href="${SITE_URL}/o/${(co||"").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/">${escapeHtml(co)}</a>`).join(", ")}`
      : "";
    const meta = `<p class="static-meta">By <a href="${SITE_URL}/o/${opSlug}/">${escapeHtml(opName)}</a>${coAuthors}${i.operator_role ? ` · ${escapeHtml(i.operator_role)}` : ""} · ${escapeHtml(i.source_date || "undated")} · ${escapeHtml(i.source_type || "source")} · ${sourceLink}</p>`;
    // Action row — interactive view + cite + view source. Mirrors SPA actions
    // and applies the corpus's own UX-bridge guidance (Osmani Layer 6).
    const cta = `<div class="static-actions">
      <a class="primary" href="${SITE_URL}/#/ins/${i.id}">Open the interactive view →</a>
      <a href="${escapeAttr(i.source_url || "#")}" rel="external nofollow">View original source →</a>
      <a href="https://raw.githubusercontent.com/k3sava/ab-codex/main/insight-library/${i.path}" rel="noopener">Markdown source →</a>
    </div>`;
    const crumbs = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/operators/">operators</a> · <a href="${SITE_URL}/o/${opSlug}/">${escapeHtml(opName)}</a> · ${i.id}</div>`;
    // Pull ## Section bodies out of the markdown for FAQPage extraction.
    // Treats the card as Q (section name) + A (section body) so AI search /
    // Google FAQ rich snippets can lift Mechanism, Conditions, Evidence, etc.
    const sectionsForFaq = ["Mechanism", "Conditions", "Evidence", "Signals", "Counter-evidence"];
    const faqEntries = [];
    for (const sec of sectionsForFaq){
      const re = new RegExp(`(^|\\n)##\\s+${sec}\\s*\\n([\\s\\S]+?)(?=\\n##\\s+|$)`, "m");
      const m = body.match(re);
      if (m && m[2]){
        // Strip markdown markup for clean schema text + cap length.
        const answer = m[2].trim()
          .replace(/^[-*]\s+/gm, "")
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/\s+/g, " ")
          .slice(0, 1200);
        if (answer.length > 40){
          faqEntries.push({ "@type": "Question", "name": sec, "acceptedAnswer": { "@type": "Answer", "text": answer } });
        }
      }
    }
    // Schema.org graph: Article + BreadcrumbList + FAQPage (when sections exist) +
    // Speakable so voice assistants pick up the title and the claim section first.
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": i.title || i.id,
          "datePublished": i.source_date || undefined,
          "dateModified": i.captured_date || i.source_date || undefined,
          "author": [{ "@type": "Person", "name": opName, ...(i.operator_role ? { "jobTitle": i.operator_role } : {}) },
            ...(Array.isArray(i.co_operators) ? i.co_operators.map(co => ({ "@type": "Person", "name": co })) : [])],
          "isBasedOn": i.source_url || undefined,
          "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "a builder's codex", "url": SITE_URL, "logo": { "@type": "ImageObject", "url": `${SITE_URL}/og.png` }, "founder": { "@id": PERSON_KESAVA_ID } },
          "url": `${SITE_URL}/ins/${i.id}/`,
          "mainEntityOfPage": `${SITE_URL}/ins/${i.id}/`,
          "keywords": (i.domain || []).join(", "),
          "license": "https://opensource.org/licenses/MIT",
          "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".static-tldr-claim"] },
          ...(i.tier ? { "additionalType": `${SITE_URL}/tier/${i.tier}` } : {}),
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "a builder's codex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "operators", "item": SITE_URL + "/operators/" },
            { "@type": "ListItem", "position": 3, "name": opName, "item": `${SITE_URL}/o/${opSlug}/` },
            { "@type": "ListItem", "position": 4, "name": i.title || i.id, "item": `${SITE_URL}/ins/${i.id}/` },
          ],
        },
        ...(faqEntries.length ? [{ "@type": "FAQPage", "mainEntity": faqEntries }] : []),
      ],
    };
    await writeOne({
      outPath: join(DOCS, "ins", i.id, "index.html"),
      title: i.title || i.id,
      description: `${opName}: "${i.title}" (${i.source_type || "source"}, ${i.source_date || "undated"}).`,
      canonical: `${SITE_URL}/ins/${i.id}/`,
      hashRoute: `#/ins/${i.id}`,
      jsonLd,
      ogImage: `${SITE_URL}/og/ins/${i.id}.svg`,
      body: `${crumbs}<h1>${escapeHtml(i.title || i.id)}</h1>${meta}${tldr}<article>${renderedBody}</article>${cta}`,
    });
  }

  // === operators ===
  for (const op of INDEX.operators){
    const filePath = join(LIB, op.path);
    if (!existsSync(filePath)) continue;
    const text = await readFile(filePath, "utf8");
    const { body } = parseFrontmatter(text);
    const cleaned = body.replace(/^#\s+[^\n]+\n+/, "");
    const renderedBody = rewriteBodyLinks(mdToHtml(cleaned), INDEX);
    const cards = INDEX.insights.filter(i => (i.operator || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === op.slug || (Array.isArray(i.co_operators) && i.co_operators.some(co => co.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === op.slug)));
    // Cards by this operator (primary + co-author) as an a11y-friendly grid.
    const cardsList = cards.length ? `<h2>Insights · ${cards.length}</h2><div class="static-cards-grid">${cards.map(c => `<a class="static-card" href="${SITE_URL}/ins/${c.id}/"><div class="tier">Tier ${c.tier || "C"} · ${(c.domain||[]).slice(0,2).join(" · ") || "·"}</div><div class="static-card-title">${escapeHtml(c.title || c.id)}</div></a>`).join("")}</div>` : "";
    const externalLinks = (op.external && typeof op.external === "object")
      ? Object.entries(op.external).filter(([,v]) => v && typeof v === "string").map(([k,v]) => `<a href="${escapeAttr(v)}" rel="external nofollow">${k}</a>`).join(" · ")
      : "";
    const cta = `<div class="static-actions">
      <a class="primary" href="${SITE_URL}/#/o/${op.slug}">Open the interactive profile →</a>
      ${externalLinks ? `<span style="font-family:JetBrains Mono,monospace;font-size:.72rem;color:var(--muted);align-self:center">${externalLinks}</span>` : ""}
    </div>`;
    const crumbs = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/operators/">operators</a> · ${escapeHtml(op.name || op.slug)}</div>`;
    // Person + BreadcrumbList graph. sameAs covers every external profile we have.
    const sameAs = (op.external && typeof op.external === "object")
      ? Object.values(op.external).filter(v => typeof v === "string" && /^https?:\/\//.test(v))
      : [];
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "name": op.name || op.slug,
          "url": `${SITE_URL}/o/${op.slug}/`,
          ...(Array.isArray(op.roles) && op.roles.length ? { "description": op.roles.join("; ") } : {}),
          ...(sameAs.length ? { "sameAs": sameAs } : {}),
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "a builder's codex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "operators", "item": SITE_URL + "/operators/" },
            { "@type": "ListItem", "position": 3, "name": op.name || op.slug, "item": `${SITE_URL}/o/${op.slug}/` },
          ],
        },
      ],
    };
    await writeOne({
      outPath: join(DOCS, "o", op.slug, "index.html"),
      title: op.name || op.slug,
      description: `${op.name || op.slug} on a builder's codex. Operator profile, insights, primary sources.`,
      canonical: `${SITE_URL}/o/${op.slug}/`,
      hashRoute: `#/o/${op.slug}`,
      jsonLd,
      ogImage: `${SITE_URL}/og/o/${op.slug}.svg`,
      body: `${crumbs}<h1>${escapeHtml(op.name || op.slug)}</h1><article>${renderedBody}</article>${cardsList}${cta}`,
    });
  }

  // === patterns ===
  for (const p of INDEX.patterns){
    const filePath = join(LIB, p.path);
    if (!existsSync(filePath)) continue;
    const text = await readFile(filePath, "utf8");
    const { body } = parseFrontmatter(text);
    const cleaned = body.replace(/^#\s+[^\n]+\n+/, "");
    const renderedBody = rewriteBodyLinks(mdToHtml(cleaned), INDEX);
    const cta = `<div class="static-actions"><a class="primary" href="${SITE_URL}/#/pat/${p.id}">Open the interactive view →</a></div>`;
    const crumbs = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/patterns/">patterns</a> · ${escapeHtml(p.title || p.id)}</div>`;
    await writeOne({
      outPath: join(DOCS, "pat", p.id, "index.html"),
      title: p.title || p.id,
      description: `Synthesis pattern: ${p.title || p.id}. Where multiple operators converge on the same idea from different angles.`,
      canonical: `${SITE_URL}/pat/${p.id}/`,
      hashRoute: `#/pat/${p.id}`,
      jsonLd: { "@context": "https://schema.org", "@type": "Article", "headline": p.title || p.id, "url": `${SITE_URL}/pat/${p.id}/`, "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "a builder's codex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } } },
      ogImage: `${SITE_URL}/og/pat/${p.id}.svg`,
      body: `${crumbs}<h1>${escapeHtml(p.title || p.id)}</h1><article>${renderedBody}</article>${cta}`,
    });
  }

  // === contradictions ===
  for (const c of (INDEX.contradictions || [])){
    const filePath = join(LIB, c.path);
    if (!existsSync(filePath)) continue;
    const text = await readFile(filePath, "utf8");
    const { body } = parseFrontmatter(text);
    const cleaned = body.replace(/^#\s+[^\n]+\n+/, "");
    const renderedBody = rewriteBodyLinks(mdToHtml(cleaned), INDEX);
    const cta = `<div class="static-actions"><a class="primary" href="${SITE_URL}/#/con/${c.id}">Open the interactive view →</a></div>`;
    const crumbs = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/patterns/">patterns</a> · ${escapeHtml(c.title || c.id)}</div>`;
    await writeOne({
      outPath: join(DOCS, "con", c.id, "index.html"),
      title: c.title || c.id,
      description: `Contradiction: ${c.title || c.id}. Where operators disagree on the same question.`,
      canonical: `${SITE_URL}/con/${c.id}/`,
      hashRoute: `#/con/${c.id}`,
      jsonLd: { "@context": "https://schema.org", "@type": "Article", "headline": c.title || c.id, "url": `${SITE_URL}/con/${c.id}/`, "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "a builder's codex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } } },
      body: `${crumbs}<h1>${escapeHtml(c.title || c.id)}</h1><article>${renderedBody}</article>${cta}`,
    });
  }

  // === playbooks ===
  for (const p of (INDEX.playbooks || [])){
    if (!p.id) continue;
    const filePath = join(LIB, p.path);
    if (!existsSync(filePath)) continue;
    const text = await readFile(filePath, "utf8");
    const { body } = parseFrontmatter(text);
    const cleaned = body.replace(/^#\s+[^\n]+\n+/, "");
    const renderedBody = rewriteBodyLinks(mdToHtml(cleaned), INDEX);
    const cta = `<div class="static-actions"><a class="primary" href="${SITE_URL}/#/play/${p.id}">Open the interactive view →</a></div>`;
    const crumbs = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/playbooks/">playbooks</a> · ${escapeHtml(p.title || p.id)}</div>`;
    // Extract H2 sections from the body as HowTo steps. Each step gets the
    // section heading as name and the first paragraph after it as text.
    // Skip generic wrappers like "References" or "Sources".
    const skipSteps = new Set(["references", "sources", "links", "see also"]);
    const steps = [];
    const lines = cleaned.split("\n");
    for (let i = 0; i < lines.length; i++){
      const m = lines[i].match(/^##\s+(.+?)\s*$/);
      if (!m) continue;
      const name = m[1].trim();
      if (skipSteps.has(name.toLowerCase())) continue;
      // Gather subsequent non-heading lines until next heading or blank gap.
      const buf = [];
      for (let j = i + 1; j < lines.length; j++){
        if (/^##/.test(lines[j])) break;
        if (lines[j].trim()) buf.push(lines[j].trim());
        if (buf.length >= 4) break;
      }
      const text = buf.join(" ").slice(0, 400);
      if (text) steps.push({ "@type": "HowToStep", "position": steps.length + 1, "name": name, "text": text, "url": `${SITE_URL}/play/${p.id}/#step-${steps.length + 1}` });
    }
    const cardsForPlaybook = (p.uses_cards || []).slice(0, 8).map(cid => INDEX.insights.find(i => i.id === cid)).filter(Boolean);
    const opsForPlaybook = [...new Set((p.originating_operators || []).concat(cardsForPlaybook.map(c => c.operator).filter(Boolean)))];
    const howTo = {
      "@type": "HowTo",
      "name": p.title || p.id,
      "description": `Playbook bundling operator-attributed insights from ${opsForPlaybook.slice(0, 6).join(", ")}.`,
      "url": `${SITE_URL}/play/${p.id}/`,
      ...(steps.length ? { "step": steps } : {}),
      "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "a builder's codex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } },
    };
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        howTo,
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "a builder's codex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "playbooks", "item": SITE_URL + "/playbooks/" },
            { "@type": "ListItem", "position": 3, "name": p.title || p.id, "item": `${SITE_URL}/play/${p.id}/` },
          ],
        },
        ...(cardsForPlaybook.length ? [{ "@type": "ItemList", "name": "Insights this playbook builds on", "itemListElement": cardsForPlaybook.map((c, i) => ({ "@type": "ListItem", "position": i + 1, "url": `${SITE_URL}/ins/${c.id}/`, "name": c.title || c.id })) }] : []),
      ],
    };
    await writeOne({
      outPath: join(DOCS, "play", p.id, "index.html"),
      title: p.title || p.id,
      description: `Playbook: ${p.title || p.id}. ${opsForPlaybook.slice(0, 4).join(", ")}.`,
      canonical: `${SITE_URL}/play/${p.id}/`,
      hashRoute: `#/play/${p.id}`,
      jsonLd,
      ogImage: `${SITE_URL}/og/play/${p.id}.svg`,
      body: `${crumbs}<h1>${escapeHtml(p.title || p.id)}</h1><article>${renderedBody}</article>${cta}`,
    });
  }

  // === daily / release log ===
  for (const d of (INDEX.daily || [])){
    const filePath = join(LIB, d.path);
    if (!existsSync(filePath)) continue;
    const text = await readFile(filePath, "utf8");
    const { body } = parseFrontmatter(text);
    const cleaned = body.replace(/^#\s+[^\n]+\n+/, "");
    const renderedBody = rewriteBodyLinks(mdToHtml(cleaned), INDEX);
    const cta = `<div class="static-actions"><a class="primary" href="${SITE_URL}/#/today">Open the full release log →</a></div>`;
    const crumbs = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/today/">release log</a> · ${escapeHtml(d.date || "")}</div>`;
    // Counts pill row matching the SPA's release-log style.
    const ia = (d.insights_added || []).length;
    const oa = (d.operators_added || []).length;
    const pa = (d.patterns_added || []).length;
    const pba = (d.playbooks_added || []).length;
    const counts = [];
    if (ia) counts.push(`+${ia} insight${ia===1?"":"s"}`);
    if (oa) counts.push(`+${oa} operator${oa===1?"":"s"}`);
    if (pa) counts.push(`+${pa} pattern${pa===1?"":"s"}`);
    if (pba) counts.push(`+${pba} playbook${pba===1?"":"s"}`);
    const meta = `<p class="static-meta">${escapeHtml(d.date)}${counts.length ? ` · ${counts.join(" · ")}` : ""}</p>`;
    await writeOne({
      outPath: join(DOCS, "today", d.date, "index.html"),
      title: `${d.title || "release"} (${d.date})`,
      description: d.summary || `Release notes for ${d.date}.`,
      canonical: `${SITE_URL}/today/${d.date}/`,
      hashRoute: `#/today#r-${d.date}`,
      jsonLd: { "@context": "https://schema.org", "@type": "Article", "headline": d.title || `release ${d.date}`, "datePublished": d.date, "url": `${SITE_URL}/today/${d.date}/`, "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "a builder's codex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } } },
      body: `${crumbs}<h1>${escapeHtml(d.title || `release ${d.date}`)}</h1>${meta}<article>${renderedBody}</article>${cta}`,
    });
  }

  // === list pages — operators, patterns, playbooks, today ===
  // These are crawler entry points. The SPA already handles them, but a static
  // version with full link lists makes the corpus walkable without JS.
  const listShell = (path, title, description, body) => writeOne({
    outPath: join(DOCS, path, "index.html"),
    title, description,
    canonical: `${SITE_URL}/${path}/`,
    hashRoute: path === "" ? "" : `#/${path === "today" ? "today" : path}`,
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", "name": title, "url": `${SITE_URL}/${path}/`, "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "a builder's codex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } } },
    body,
  });

  // Operators index
  {
    const ops = [...INDEX.operators].sort((a, b) => (a.name || a.slug).localeCompare(b.name || b.slug));
    const groups = new Map();
    for (const o of ops){
      const letter = (o.name || o.slug || "").charAt(0).toUpperCase() || "·";
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    }
    const sectionEls = [...groups.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([letter, list]) => `
      <section><h2>${letter}</h2><ul>${list.map(o => `<li><a href="${SITE_URL}/o/${o.slug}/">${escapeHtml(o.name || o.slug)}</a></li>`).join("")}</ul></section>
    `).join("");
    const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · operators</div>
      <h1>${INDEX.operators.length} operators</h1>
      <p class="static-meta">Each profile carries the operator's bio, operating themes, attributed cards, and primary sources.</p>
      ${sectionEls}`;
    await listShell("operators", "operators", `Index of ${INDEX.operators.length} operator profiles in a builder's codex. Primary-source, named-author insights.`, body);
  }

  // Patterns index
  {
    const list = [...INDEX.patterns].sort((a, b) => (b.convergence_count || 0) - (a.convergence_count || 0) || (a.title || a.id).localeCompare(b.title || b.id));
    const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · patterns</div>
      <h1>${list.length} synthesis patterns</h1>
      <p class="static-meta">Where 3+ operators converge on the same idea from different angles. Each pattern names the operators, the cards, and the implication.</p>
      <ul>${list.map(p => `<li><a href="${SITE_URL}/pat/${p.id}/">${escapeHtml(p.title || p.id)}</a>${p.convergence_count ? ` <span style="color:var(--muted);font-family:JetBrains Mono,monospace;font-size:.75em">(${p.convergence_count} ops)</span>` : ""}</li>`).join("")}</ul>`;
    await listShell("patterns", "patterns", `${list.length} cross-operator convergences in a builder's codex.`, body);
  }

  // Playbooks index
  if (INDEX.playbooks && INDEX.playbooks.length){
    const list = [...INDEX.playbooks].filter(p => p.id).sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id));
    const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · playbooks</div>
      <h1>${list.length} playbooks</h1>
      <p class="static-meta">Methodology playbooks distilled across the corpus.</p>
      <ul>${list.map(p => `<li><a href="${SITE_URL}/play/${p.id}/">${escapeHtml(p.title || p.id)}</a></li>`).join("")}</ul>`;
    await listShell("playbooks", "playbooks", `${list.length} methodology playbooks in a builder's codex.`, body);
  }

  // Release log index
  if (INDEX.daily && INDEX.daily.length){
    const list = [...INDEX.daily].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · release log</div>
      <h1>release log</h1>
      <p class="static-meta">${list.length} releases since ${list[list.length-1]?.date}. Newest first.</p>
      <ul>${list.map(d => {
        const ia = (d.insights_added||[]).length;
        const oa = (d.operators_added||[]).length;
        const counts = [];
        if (ia) counts.push(`+${ia} insight${ia===1?"":"s"}`);
        if (oa) counts.push(`+${oa} operator${oa===1?"":"s"}`);
        return `<li><a href="${SITE_URL}/today/${d.date}/">${escapeHtml(d.date)} · ${escapeHtml(d.title || "release")}</a>${counts.length ? ` <span style="color:var(--muted);font-family:JetBrains Mono,monospace;font-size:.75em">(${counts.join(" · ")})</span>` : ""}</li>`;
      }).join("")}</ul>`;
    await listShell("today", "release log", `${list.length} releases in a builder's codex. Daily ingests, prompted batches, depth passes.`, body);
  }

  // === domain pages — one per unique domain across the corpus ===
  // Each is a CollectionPage + DefinedTerm so AI agents and crawlers can
  // resolve domain names to definitions and a curated list of insights.
  {
    const domSet = new Set();
    for (const i of INDEX.insights){ for (const d of (i.domain || [])) domSet.add(d); }
    const domains = [...domSet].sort();
    for (const dom of domains){
      const cardsInDom = INDEX.insights.filter(i => (i.domain || []).includes(dom));
      const opsInDom = new Set(cardsInDom.map(c => c.operator).filter(Boolean));
      const patsInDom = (INDEX.patterns || []).filter(p => (p.domains || []).includes(dom));
      const adj = new Map();
      for (const c of cardsInDom){
        for (const od of (c.domain || [])){
          if (od !== dom) adj.set(od, (adj.get(od) || 0) + 1);
        }
      }
      const adjacent = [...adj.entries()].sort((a,b) => b[1] - a[1]).slice(0, 8);
      const tierA = cardsInDom.filter(c => c.tier === "A").slice(0, 6);
      const sectionParts = [];
      if (tierA.length){
        sectionParts.push(`<h2>Strongest claims</h2><ol class="static-strongs">${tierA.map(c => `<li><a href="${SITE_URL}/ins/${c.id}/"><strong>${escapeHtml(c.title || c.id)}</strong> <em style="color:var(--muted);font-style:normal">${escapeHtml(c.operator || "")}</em></a></li>`).join("")}</ol>`);
      }
      if (adjacent.length){
        sectionParts.push(`<h2>Adjacent domains</h2><ul>${adjacent.map(([od, ct]) => `<li><a href="${SITE_URL}/d/${od}/">${od}</a> · ${ct} co-occurrences</li>`).join("")}</ul>`);
      }
      if (patsInDom.length){
        sectionParts.push(`<h2>Synthesis patterns in ${dom}</h2><ul>${patsInDom.map(p => `<li><a href="${SITE_URL}/pat/${p.id}/">${escapeHtml(p.title || p.id)}</a></li>`).join("")}</ul>`);
      }
      sectionParts.push(`<h2>${cardsInDom.length} insights in ${dom}</h2><ul class="static-card-list">${cardsInDom.slice(0, 60).map(c => `<li><a href="${SITE_URL}/ins/${c.id}/">${escapeHtml(c.title || c.id)}</a> · <span style="color:var(--muted)">${escapeHtml(c.operator || "·")}</span></li>`).join("")}</ul>`);

      const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/browse/">browse</a> · ${dom}</div>
        <p class="static-eyebrow" style="font-family:JetBrains Mono,monospace;font-size:.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:.1em">domain</p>
        <h1>${dom}</h1>
        <p class="static-meta">${cardsInDom.length} cards · ${opsInDom.size} operators · ${cardsInDom.filter(c=>c.tier==='A').length} tier-A claims · ${patsInDom.length} synthesis pattern${patsInDom.length===1?'':'s'}.</p>
        ${sectionParts.join("\n")}`;
      const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "DefinedTerm",
            "name": dom,
            "inDefinedTermSet": `${SITE_URL}/`,
            "description": `Domain in a builder's codex. ${cardsInDom.length} insights from ${opsInDom.size} operators.`,
            "url": `${SITE_URL}/d/${dom}/`,
          },
          {
            "@type": "CollectionPage",
            "name": `${dom} · a builder's codex`,
            "url": `${SITE_URL}/d/${dom}/`,
            "about": { "@type": "DefinedTerm", "name": dom },
            "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "a builder's codex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } },
            "hasPart": cardsInDom.slice(0, 30).map(c => ({ "@type": "Article", "url": `${SITE_URL}/ins/${c.id}/`, "name": c.title || c.id, "author": { "@type": "Person", "name": c.operator || "·" } })),
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "a builder's codex", "item": SITE_URL + "/" },
              { "@type": "ListItem", "position": 2, "name": "browse", "item": SITE_URL + "/browse/" },
              { "@type": "ListItem", "position": 3, "name": dom, "item": `${SITE_URL}/d/${dom}/` },
            ],
          },
        ],
      };
      await writeOne({
        outPath: join(DOCS, "d", dom, "index.html"),
        title: `${dom} · a builder's codex`,
        description: `${cardsInDom.length} insights from ${opsInDom.size} operators in the ${dom} domain. Tier-A claims, synthesis patterns, adjacent domains.`,
        canonical: `${SITE_URL}/d/${dom}/`,
        hashRoute: `#/d/${dom}`,
        jsonLd,
        ogImage: `${SITE_URL}/og/d/${dom}.svg`,
        body,
      });
    }
  }

  console.log(`build-static: emitted ${count} static HTML files under docs/`);
}

main().catch(e => { console.error(e); process.exit(1); });
