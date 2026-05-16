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

import { readdir, readFile, writeFile, mkdir, stat, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const LIB = join(ROOT, "insight-library");
const DOCS = join(ROOT, "docs");
const SITE_URL = "https://abcodex.iamkesava.com";

// Shared Person + Organization references. Every static page's @graph cites
// these by @id so AI search agents see one canonical entity per author/org
// across the entire corpus instead of duplicate per-page Person nodes.
const PERSON_KESAVA_ID = "https://iamkesava.com/#kesava";
const ORG_CODEX_ID = SITE_URL + "/#org";
const PUBLISHER_REF = { "@id": ORG_CODEX_ID };

// JTBD H1 + lede per domain. Falls back to "operator insights tagged X" so
// new domains don't ship as blank slates. Keep these short — they front the
// page above the index, and they read in voice search.
const DOMAIN_TITLES = {
  "pmm": "Position B2B products so the buyer self-selects",
  "gtm": "Build a go-to-market that doesn't leak in the funnel",
  "marketing": "Move the market, not just the dashboard",
  "ai-native": "Build for an AI-native operating model",
  "leadership": "Lead operators who actually shipped things",
  "growth-demand": "Generate demand the sales team can close",
  "strategy": "Make the choice that matters, then defend it",
  "product": "Ship the thing the buyer pulls out of your hand",
  "content": "Write so the right people self-identify",
  "founder-craft": "Build the company most founders skip",
  "growth": "Run growth like a system, not a stunt",
  "engineering": "Engineer for the system that actually runs",
  "sales": "Sell the way the buyer already wants to buy",
  "hiring": "Hire operators who change the slope",
  "sales-cs": "Move buyers from no-decision to expansion",
  "design": "Design so the function is obvious",
  "founder-operator": "Operate as the founder, not the manager",
  "research-discovery": "Find the problem before you sell the answer",
  "design-ux": "Design UX that earns the next click",
  "seo": "Earn pages worth ranking, in the AI-search era",
  "customer-success": "Make first-value the cheapest part of the loop",
  "aeo": "Get cited by AI search, not crawled-and-skipped",
  "content-strategy": "Plan content as a system, not a calendar",
  "research": "Research that changes the decision",
  "marketing-ops": "Wire marketing so attribution is honest",
  "strategy-bets": "Place fewer bets, fund the ones that pay back",
  "ai-ops": "Operate AI systems that actually learn",
  "ai-product": "Ship AI products people return to on Tuesday",
  "ai-tools": "Build AI tools operators reach for first",
  "ai-gtm": "Sell into a buyer who already used ChatGPT",
  "ai-engineering": "Engineer the AI system, not the prompt",
};
const DOMAIN_LEDES = {
  "pmm": "Positioning, narrative, launch, sales enablement, win/loss. Insights from named operators who ran the play and shipped the artifact.",
  "gtm": "Funnel mechanics, ICP, segmentation, sales motion, attribution. From operators who built the GTM, not the deck about it.",
  "ai-native": "How operating changes when the agent is on the team. Verification loops, evals, AI-mediated workflows, agent infrastructure.",
  "marketing": "Demand creation, brand, content, performance. Tactics that survived contact with a real budget.",
  "leadership": "Decision-making, hiring, scaling, the calls that compound. Operators who led teams that shipped.",
  "growth-demand": "Acquisition, activation, retention, expansion. Demand-gen, lifecycle, growth loops, paid + organic.",
  "strategy": "Where to play, how to win, what to refuse. Operator-grade strategy, not consultant abstractions.",
  "product": "Discovery, prototyping, scope, taste, prioritization. From PMs who shipped products people actually use.",
  "content": "Headlines, structure, voice, distribution. Writing operators use to move attention and pipeline.",
  "founder-craft": "Hard parts founders don't talk about: cofounders, hiring, cash, narrative, when to push.",
  "growth": "Loops, levers, channel economics. The systems that compound, not the campaign that spiked.",
  "engineering": "Architecture, AI codegen, evals, agents, infra. From engineers who shipped at scale.",
  "sales": "Discovery, qualification, negotiation, multi-thread. From sellers who closed real revenue.",
  "hiring": "How to source, screen, sequence, and decide. Hiring as the highest-leverage operator move.",
  "sales-cs": "Bridge between sales and CS: handoffs, expansion, retention, churn signals.",
  "design": "Information design, interaction, type, accessibility. Design that earns the click.",
  "founder-operator": "Founders as operators: what changes once you're the one paying salaries.",
  "research-discovery": "Customer interviews, JTBD, demand-side analysis, problem framing.",
  "design-ux": "UX systems, mobile, accessibility, micro-interactions, motion. From designers who shipped products.",
  "seo": "On-page, technical, content, links. SEO in the AI-search era, from operators who run real sites.",
  "customer-success": "Onboarding, activation, expansion, churn. CS as a growth function.",
  "aeo": "Answer-engine optimization: structured data, schema, llms.txt, .well-known surfaces. Designed for AI search.",
  "content-strategy": "Content as a system: taxonomy, surface, refresh cadence, internal linking.",
  "research": "User research, market research, AI research. From operators using research to ship.",
  "marketing-ops": "Attribution, lead routing, lifecycle automation, data plumbing.",
  "strategy-bets": "Portfolio bets, prioritization, kill criteria. Where to invest, what to defund.",
  "ai-ops": "Running AI in production: monitoring, evals, drift, cost, fallbacks.",
  "ai-product": "Building AI features and products: prompts, UX, evals, latency, trust.",
  "ai-tools": "Tools operators reach for: codegen, agents, copilots, research, ops.",
  "ai-gtm": "Selling into AI-aware buyers: positioning, ROI framing, anti-slop signals.",
  "ai-engineering": "Engineering AI systems: retrieval, evals, agents, observability, safety.",
};

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

// Minimal markdown → HTML for static pages. Handles headings, lists, blockquotes,
// tables, code blocks, inline bold/code/links. Tables are converted to responsive
// <div class="md-table-wrap"><table> structures.
function mdToHtml(md){
  const lines = md.split("\n");
  const out = [];
  let inList = false, inOl = false, inQuote = false, inCode = false, codeLang = "", codeBuf = [];
  let inTable = false, tableBuf = [];
  const inline = s => s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s({\[])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${escapeAttr(u)}">${t}</a>`);
  const slugify = t => t.toLowerCase().replace(/[^\w\s-]/g,"").trim().replace(/[\s_]+/g,"-").replace(/^-+|-+$/g,"");
  const usedIds = new Set();
  const makeId = text => {
    let id = slugify(text.replace(/\*\*/g,"").replace(/`[^`]+`/g,""));
    if (!id) id = "section";
    if (usedIds.has(id)){ let n=2; while(usedIds.has(id+"-"+n)) n++; id=id+"-"+n; }
    usedIds.add(id); return id;
  };
  const flushTable = () => {
    if (!tableBuf.length){ inTable=false; return; }
    const rows = tableBuf.map(r => r.replace(/^\||\|$/g,"").split("|").map(c=>c.trim()));
    const sepIdx = rows.findIndex(r => r.every(c => /^[:\- ]+$/.test(c)));
    if (sepIdx < 0){ for(const r of tableBuf) out.push(`<p>${inline(r)}</p>`); tableBuf=[]; inTable=false; return; }
    const head = rows.slice(0, sepIdx), body = rows.slice(sepIdx+1);
    let h = `<div class="md-table-wrap"><table class="md-table">`;
    if (head.length) h += "<thead>"+head.map(r=>"<tr>"+r.map(c=>`<th>${inline(c)}</th>`).join("")+"</tr>").join("")+"</thead>";
    h += "<tbody>"+body.map(r=>"<tr>"+r.map(c=>`<td>${inline(c)}</td>`).join("")+"</tr>").join("")+"</tbody>";
    h += "</table></div>"; out.push(h); tableBuf=[]; inTable=false;
  };
  const closeQuote = () => {
    if (!inQuote) return;
    out.push("</blockquote>"); inQuote = false;
  };
  for (const line of lines){
    if (line.startsWith("```")){
      if(inList){out.push("</ul>");inList=false;} if(inOl){out.push("</ol>");inOl=false;} closeQuote(); flushTable();
      if(!inCode){ codeLang=line.replace(/^```/,"").trim(); codeBuf=[]; inCode=true; }
      else { out.push(`<pre><code${codeLang?` class="language-${escapeHtml(codeLang)}"`:""} >${escapeHtml(codeBuf.join("\n"))}</code></pre>`); codeBuf=[]; codeLang=""; inCode=false; }
      continue;
    }
    if(inCode){ codeBuf.push(line); continue; }
    if (/^\|/.test(line)){
      if(inList){out.push("</ul>");inList=false;} if(inOl){out.push("</ol>");inOl=false;} closeQuote();
      tableBuf.push(line); inTable=true; continue;
    }
    if(inTable && !/^\|/.test(line)) flushTable();
    if (/^#\s+/.test(line)){ if(inList){out.push("</ul>");inList=false;} if(inOl){out.push("</ol>");inOl=false;} closeQuote(); flushTable(); const t=line.replace(/^#\s+/,""); out.push(`<h1 id="${makeId(t)}">${inline(t)}</h1>`); continue; }
    if (/^##\s+/.test(line)){ if(inList){out.push("</ul>");inList=false;} if(inOl){out.push("</ol>");inOl=false;} closeQuote(); flushTable(); const t=line.replace(/^##\s+/,""); out.push(`<h2 id="${makeId(t)}">${inline(t)}</h2>`); continue; }
    if (/^###\s+/.test(line)){
      if(inList){out.push("</ul>");inList=false;} if(inOl){out.push("</ol>");inOl=false;} closeQuote(); flushTable();
      const t=line.replace(/^###\s+/,"");
      const stepM=t.match(/^(\d+)\.\s+(.+)/);
      if(stepM){const num=String(stepM[1]).padStart(2,"0");out.push(`<h3 id="step-${num}"><span class='step-num-badge'>${num}</span> ${inline(stepM[2])}</h3>`);}
      else{out.push(`<h3 id="${makeId(t)}">${inline(t)}</h3>`);}
      continue;
    }
    if (/^>\s?/.test(line)){
      if(inList){out.push("</ul>");inList=false;} if(inOl){out.push("</ol>");inOl=false;} flushTable();
      if(!inQuote){ out.push("<blockquote>"); inQuote=true; }
      out.push(`<p>${inline(line.replace(/^>\s?/,""))}</p>`); continue;
    }
    if(inQuote && line.trim()===""){ closeQuote(); continue; }
    if(!inQuote && line.trim()===""){ if(inList){out.push("</ul>");inList=false;} if(inOl){out.push("</ol>");inOl=false;} flushTable(); out.push(""); continue; }
    if (/^[-*]\s+/.test(line)){
      if(inOl){out.push("</ol>");inOl=false;} closeQuote(); flushTable();
      if(!inList){out.push("<ul>");inList=true;} out.push(`<li>${inline(line.replace(/^[-*]\s+/,""))}</li>`); continue;
    }
    if (/^\d+\.\s+/.test(line)){
      if(inList){out.push("</ul>");inList=false;} closeQuote(); flushTable();
      if(!inOl){out.push("<ol>");inOl=true;} out.push(`<li>${inline(line.replace(/^\d+\.\s+/,""))}</li>`); continue;
    }
    if (/^---+$/.test(line.trim())){ if(inList){out.push("</ul>");inList=false;} if(inOl){out.push("</ol>");inOl=false;} closeQuote(); flushTable(); out.push("<hr>"); continue; }
    if(!inQuote) out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  if (inOl) out.push("</ol>");
  if (inQuote) out.push("</blockquote>");
  flushTable();
  return out.join("\n");
}
function wrapStepContainers(html){
  // Split at each H2/H3 boundary; wrap numbered-step H3 groups in .pb-step
  const parts = html.split(/(?=<h[23] )/);
  return parts.map(p => /^<h3 id="step-\d+"/.test(p) ? `<div class="pb-step">${p}</div>` : p).join("");
}
function markOperatorQuotes(html){
  // Blockquotes whose first paragraph starts with a quotation mark → operator attribution style
  return html.replace(/<blockquote>(\s*)<p>"/g, '<blockquote class="pb-operator-quote">$1<p>"');
}
function mergeQuoteAttributions(html){
  // In pb-operator-quote blockquotes: merge the attribution <p> and the cross-ref <p>
  // into one inline line: "— Speaker, Source · "Short title…"" (linked).
  return html.replace(
    /(<blockquote class="pb-operator-quote">)([\s\S]*?)(<\/blockquote>)/g,
    (match, open, inner, close) => {
      const pBlocks = [];
      const pRe = /<p>[\s\S]*?<\/p>/g;
      let pm;
      while ((pm = pRe.exec(inner)) !== null) pBlocks.push(pm[0]);
      if (pBlocks.length < 3) return match;
      const lastP = pBlocks[pBlocks.length - 1];
      const linkM = lastP.match(/<a class="inline-cross-ref" href="([^"]+)">([^<]+)<\/a>/);
      if (!linkM) return match;
      const href = linkM[1];
      const words = linkM[2].trim().split(/\s+/);
      const shortTitle = words.length > 4 ? words.slice(0, 4).join(" ") + "…" : linkM[2];
      const attrP = pBlocks[pBlocks.length - 2];
      const mergedAttrP = attrP
        .replace(/^<p>/, '<p class="pb-quote-attr">')
        .replace(/<\/p>$/, ` · <a class="inline-cross-ref" href="${href}">“${shortTitle}”<\/a><\/p>`);
      return open + "\n" + pBlocks.slice(0, -2).join("\n") + (pBlocks.length > 2 ? "\n" : "") + mergedAttrP + "\n" + close;
    }
  );
}
function splitVisuals(html){
  // Split a visual HTML file into individual <div class="pbv"> blocks.
  if (!html) return [];
  const visuals = [];
  let pos = 0;
  while (true){
    const start = html.indexOf('<div class="pbv"', pos);
    if (start < 0) break;
    const next = html.indexOf('<div class="pbv"', start + 1);
    visuals.push(next < 0 ? html.slice(start).trim() : html.slice(start, next).trim());
    if (next < 0) break;
    pos = next;
  }
  return visuals;
}
function injectBeforeNthStep(html, insertion, n){
  // Insert `insertion` immediately before the nth occurrence of <div class="pb-step">
  let count = 0;
  return html.replace(/<div class="pb-step">/g, m => {
    count++;
    return count === n ? insertion + m : m;
  });
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

function shell({ title, description, canonical, hashRoute, jsonLd, body, ogImage, hasVisual, extraStyle }){
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
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
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
<link rel="service-doc" href="${SITE_URL}/llms.txt">
<link rel="api-catalog" href="${SITE_URL}/.well-known/api-catalog">
<link rel="describedby" href="${SITE_URL}/.well-known/agent-permissions.json">
<link rel="me" href="https://github.com/k3sava">
<link rel="me" href="https://www.linkedin.com/in/k3sava">
<link rel="me" href="https://iamkesava.com/">
<link rel="author" href="https://iamkesava.com/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
${hasVisual ? '<link rel="stylesheet" href="/assets/css/pb-visuals.css">' : ''}
<style>
/* Static page styling — self-contained so the HTML reads cleanly without
   the SPA's stylesheet (which targets different selectors). Carries the
   codex typography palette but in a layout tuned for crawlers + readers. */
:root{--paper:#f3f5ee;--paper-2:#e6ebe0;--ink:#0d1410;--ink-2:#2a3530;--muted:#6b7868;--accent:#1f9d55;--accent-2:#15803d;--line:#0d141022;--line-2:#0d141012}
*{box-sizing:border-box;margin:0;padding:0}
*:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
body{font-family:Inter,system-ui,sans-serif;background:var(--paper);color:var(--ink);margin:0;-webkit-font-smoothing:antialiased;line-height:1.55}
.skip-link{position:fixed;top:-100px;left:8px;z-index:100;padding:10px 14px;background:var(--ink);color:var(--paper);font-family:JetBrains Mono,monospace;font-size:.74rem;text-decoration:none;border-radius:6px;transition:top .15s ease}
.skip-link:focus{top:8px;outline:2px solid var(--accent);outline-offset:2px}
main:focus{outline:none}
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
main.static h2{font-family:Newsreader,Georgia,serif;font-weight:400;font-size:1.5rem;margin:1.8em 0 .5em;line-height:1.25;color:var(--ink);scroll-margin-top:72px}
main.static h3{font-family:Newsreader,Georgia,serif;font-weight:400;font-size:1.15rem;margin:1.4em 0 .4em;color:var(--ink);scroll-margin-top:72px}
main.static p{margin:.7em 0;line-height:1.65;max-width:72ch;color:var(--ink-2)}
main.static a{color:var(--ink);border-bottom:1px solid var(--line);padding-bottom:1px;text-decoration:none;transition:color .2s,border-color .2s}
main.static a:hover{color:var(--accent);border-bottom-color:currentColor}
main.static a.inline-cross-ref{font-family:Newsreader,serif}
main.static ul,main.static ol{padding-left:1.5em;margin:.5em 0 1em 0;display:flex;flex-direction:column;gap:.45em}
main.static li{padding-left:.15em;color:var(--ink-2);line-height:1.6}
main.static blockquote{margin:1.6em 0;padding:.6em 0 .6em 20px;border-left:3px solid var(--accent);color:var(--ink-2);font-style:italic;font-family:Newsreader,Georgia,serif;font-size:1.05rem;line-height:1.55}
main.static strong{color:var(--ink);font-weight:600}
.md-table-wrap{overflow-x:auto;margin:1.6em 0;border-radius:5px;border:1px solid color-mix(in oklab,var(--accent) 20%,var(--line))}
.md-table{width:100%;border-collapse:collapse;font-size:.88rem;line-height:1.5}
.md-table thead th{background:color-mix(in oklab,var(--accent) 9%,var(--paper));color:var(--ink);font-family:JetBrains Mono,monospace;font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;padding:10px 16px;text-align:left;border-bottom:2px solid color-mix(in oklab,var(--accent) 22%,var(--paper))}
.md-table td{padding:9px 16px;border-bottom:1px solid var(--line-2);color:var(--ink-2);vertical-align:top}
.md-table tbody tr:last-child td{border-bottom:none}
.md-table tbody tr:hover{background:color-mix(in oklab,var(--accent) 4%,var(--paper))}
.md-table th:first-child,.md-table td:first-child{white-space:nowrap}
.step-num-badge{font-family:JetBrains Mono,monospace;font-size:1.9rem;line-height:1;color:var(--accent);opacity:.5;font-weight:700;flex-shrink:0;min-width:2.6ch;letter-spacing:-.02em}
.pb-step{padding:28px 0;margin:0;border-top:1px solid var(--line-2)}
.pb-step:first-of-type{border-top:none;padding-top:0}
.pb-step h3{display:flex;align-items:baseline;gap:16px;margin-top:0;margin-bottom:.65em;font-size:1.08rem;font-weight:700}
.pb-step>p:first-of-type{margin-top:0}
main.static article>h2{margin-top:2.4em}
main.static article>h2:first-child{margin-top:0}
main.static article hr{border:none;text-align:center;margin:48px 0;color:var(--muted);font-family:JetBrains Mono,monospace;font-size:.85rem;letter-spacing:.3em}
main.static article hr::after{content:"· · ·"}
main.static blockquote.pb-operator-quote{border-left:none;padding:20px 24px;background:color-mix(in oklab,var(--accent) 5%,var(--paper));border-radius:6px;font-style:normal;margin:1.8em 0}
main.static blockquote.pb-operator-quote p:first-child{font-family:Newsreader,Georgia,serif;font-size:1.1rem;font-style:italic;color:var(--ink);margin-bottom:10px;line-height:1.5}
main.static blockquote.pb-operator-quote p:not(:first-child),main.static blockquote.pb-operator-quote .pb-quote-attr{font-family:Newsreader,Georgia,serif;font-size:.85rem;font-style:normal;color:var(--muted);margin:.2em 0;line-height:1.4}
main.static blockquote.pb-operator-quote .pb-quote-attr .inline-cross-ref{font-size:inherit;color:var(--accent);font-family:inherit;border-bottom-color:transparent}
main.static blockquote.pb-operator-quote .pb-quote-attr .inline-cross-ref:hover{color:var(--accent-2);border-bottom-color:currentColor}
.pb-insight-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:.4em 0 28px}
.pb-insight-chips-label{font-family:JetBrains Mono,monospace;font-size:.6rem;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;font-weight:600;margin-right:4px;white-space:nowrap}
.pb-insight-chip{font-family:Newsreader,Georgia,serif;font-size:.85rem;color:var(--ink-2);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:2px 12px;transition:border-color .15s,color .15s;display:inline-block}
.pb-insight-chip:hover{color:var(--accent);border-color:var(--accent);border-bottom-color:var(--accent)}
.pb-toc{margin:0 0 44px;padding:20px 24px;background:var(--paper-2);border-radius:5px;border:1px solid var(--line)}
.pb-toc-label{font-family:JetBrains Mono,monospace;font-size:.6rem;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;font-weight:600;margin-bottom:14px}
.pb-toc ol{padding:0;margin:0;list-style:none;display:flex;flex-direction:column;gap:2px;counter-reset:toc}
.pb-toc li{padding:0;margin:0;display:flex;align-items:baseline;gap:10px}
.pb-toc li::before{counter-increment:toc;content:counter(toc,decimal-leading-zero);font-family:JetBrains Mono,monospace;font-size:.62rem;color:var(--muted);min-width:20px}
.pb-toc a{font-family:Newsreader,Georgia,serif;font-size:1rem;color:var(--ink-2);text-decoration:none;border-bottom:1px solid transparent;padding-bottom:1px;transition:color .15s,border-color .15s;line-height:1.45}
.pb-toc a:hover{color:var(--accent);border-bottom-color:var(--accent)}
h2#failure-modes+ul,h2#what-goes-wrong+ul{list-style:none;padding-left:0;margin-top:.8em}
h2#failure-modes+ul li,h2#what-goes-wrong+ul li{border-top:1px solid var(--line-2);padding:14px 0;padding-left:0;margin:0;color:var(--ink-2);line-height:1.5}
h2#failure-modes+ul li:first-child,h2#what-goes-wrong+ul li:first-child{border-top:none;padding-top:0}
h2#failure-modes+ul li strong:first-child,h2#what-goes-wrong+ul li strong:first-child{font-family:JetBrains Mono,monospace;font-size:.7rem;color:var(--accent);text-transform:uppercase;letter-spacing:.06em;font-weight:600;display:block;margin-bottom:2px}
h2#outputs+ol,h2#what-you-get+ol{list-style:none;padding-left:0;counter-reset:outputs;margin-top:.8em}
h2#outputs+ol li,h2#what-you-get+ol li{counter-increment:outputs;display:flex;gap:14px;align-items:baseline;padding:10px 0;border-top:1px solid var(--line-2);color:var(--ink-2);line-height:1.6;margin:0}
h2#outputs+ol li:first-child,h2#what-you-get+ol li:first-child{border-top:none;padding-top:0}
h2#outputs+ol li::before,h2#what-you-get+ol li::before{content:counter(outputs,decimal-leading-zero);font-family:JetBrains Mono,monospace;font-size:.7rem;color:var(--accent);opacity:.7;min-width:20px;flex-shrink:0}
.pb-layout{display:block}
.pb-article-col{display:block}
.pb-sidebar{display:none}
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
.static-eyebrow{font-family:JetBrains Mono,monospace;font-size:.7rem;color:var(--accent);text-transform:uppercase;letter-spacing:.12em;font-weight:600;margin-bottom:14px}
.static-lede{font-family:Newsreader,Georgia,serif;font-size:1.2rem;line-height:1.55;color:var(--ink-2);margin:0 0 28px;max-width:60ch}
.static-lede a{color:var(--accent-2)}
.static-op-index{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px 16px}
.static-op-index li{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:4px 0}
.static-op-index .static-op-count{font-family:JetBrains Mono,monospace;font-size:.68rem;color:var(--muted)}
.static-pat-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px}
.static-pat-list li{padding:8px 12px;border-radius:6px;background:color-mix(in oklab,var(--paper-2) 50%,transparent);display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.static-pat-list .static-pat-count{font-family:JetBrains Mono,monospace;font-size:.68rem;color:var(--muted);white-space:nowrap}
.static-rel-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:6px}
.static-rel-list li{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:8px 0;border-bottom:1px solid var(--line-2)}
.static-rel-list li:last-child{border-bottom:0}
.static-rel-list a{display:flex;gap:16px;align-items:baseline;flex:1;border:0}
.static-rel-list a:hover .static-rel-title{color:var(--accent-2)}
.static-rel-date{font-family:JetBrains Mono,monospace;font-size:.78rem;color:var(--muted);min-width:90px}
.static-rel-title{font-family:Newsreader,serif;font-size:1.05rem;color:var(--ink)}
.static-rel-counts{font-family:JetBrains Mono,monospace;font-size:.68rem;color:var(--muted);white-space:nowrap}
.static-related{margin-top:56px;padding-top:32px;border-top:1px solid var(--line)}
.static-related h2{font-family:Newsreader,serif;font-weight:500;font-size:1.35rem;line-height:1.25;margin:0 0 22px}
.static-related-group{margin-bottom:28px}
.static-related-group:last-child{margin-bottom:0}
.static-related-label{font-family:JetBrains Mono,monospace;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;font-weight:600}
.static-domains{display:flex;flex-wrap:wrap;gap:8px 10px;font-family:JetBrains Mono,monospace;font-size:.74rem;margin:0;padding:0}
.static-domains a{color:var(--ink-2);text-decoration:none;padding:4px 12px;border:1px solid var(--line);border-radius:999px;transition:border-color .12s,color .12s,background .12s}
.static-domains a:hover{border-color:var(--accent);color:var(--accent-2);background:color-mix(in oklab,var(--accent) 8%,transparent)}
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
@media print{
  .static-topbar,.static-footer,.static-actions,.skip-link{display:none !important}
  main.static{max-width:none;padding:0}
  main.static h1{font-size:1.8rem}
  main.static h2{font-size:1.2rem;page-break-after:avoid}
  main.static a{color:#000;border-bottom:none}
  main.static a[href^="http"]::after{content:" (" attr(href) ")";font-size:.78em;color:#555}
  .static-related-group{break-inside:avoid}
  .static-card{break-inside:avoid}
}
${extraStyle || ""}
</style>
${ld}
</head>
<body>
<a class="skip-link" href="#main">skip to content</a>
<header class="static-topbar">
  <a class="brand" href="${SITE_URL}/"><span class="dot" aria-hidden="true"></span>a builder's codex</a>
  <nav aria-label="Primary">
    <a href="${SITE_URL}/operators/">operators</a>
    <a href="${SITE_URL}/patterns/">patterns</a>
    <a href="${SITE_URL}/playbooks/">playbooks</a>
    <a href="${SITE_URL}/today/">today</a>
    <a href="${SITE_URL}/#/about">about</a>
  </nav>
</header>
<main class="static" id="main" tabindex="-1">
${body}
</main>
${hasVisual ? '<script src="/assets/js/pb-visuals.js" defer></script>' : ''}
<footer class="static-footer">
  <div class="static-feeds"><a href="${SITE_URL}/llms.txt" rel="noopener">llms.txt</a> · <a href="${SITE_URL}/sitemap.xml" rel="noopener">sitemap</a> · <a href="${SITE_URL}/rss.xml" rel="noopener">rss</a> · <a href="${SITE_URL}/insight-library/INDEX.json" rel="noopener">index.json</a></div>
  <nav aria-label="Sister sites" class="static-sister"><a href="https://apps.iamkesava.com/">apps</a> · <a href="https://tools.iamkesava.com/">tools</a> · <a href="https://toys.iamkesava.com/">toys</a> · <span aria-current="page">codex</span></nav>
  <div>made by <a href="https://iamkesava.com" rel="noopener author">kesava</a> · <a href="https://github.com/k3sava/abcodex" rel="noopener">github</a></div>
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

async function loadVisual(playbook_id){
  const p = join(ROOT, "assets/visuals", playbook_id, "animated.html");
  if (!existsSync(p)) return "";
  return await readFile(p, "utf8");
}

async function copySocialOg(playbook_id){
  const src = join(ROOT, "assets/visuals", playbook_id, "social.png");
  if (!existsSync(src)) return null;
  const dest = join(DOCS, "og", "play", `${playbook_id}.png`);
  await ensureDir(dirname(dest));
  await copyFile(src, dest);
  return `${SITE_URL}/og/play/${playbook_id}.png`;
}

async function copyVisualImages(playbook_id){
  const dir = join(ROOT, "assets/visuals", playbook_id);
  let entries;
  try { entries = await readdir(dir); } catch { return; }
  const imgs = entries.filter(f => /\.(png|jpg|webp|svg)$/.test(f) && f !== "social.png");
  if (!imgs.length) return;
  const destDir = join(DOCS, "assets", "visuals", playbook_id);
  await ensureDir(destDir);
  for (const f of imgs) await copyFile(join(dir, f), join(destDir, f));
}

async function main(){
  // Read INDEX.json (must be built first).
  const INDEX = JSON.parse(await readFile(join(LIB, "INDEX.json"), "utf8"));
  // Normalise. Patterns and contradictions store their title in `title`.
  // Operators are keyed by `slug`.
  let count = 0;

  // Reverse-lookup maps (built once). Power the "Where this connects" footer
  // on insight, operator, pattern, and playbook pages. The ≥6-outbound-link
  // floor lives or dies here.
  const opSlugify = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const cardById = new Map(INDEX.insights.map(x => [x.id, x]));
  const patternsForCard = new Map();
  for (const p of INDEX.patterns) for (const cid of (p.uses_cards || [])) {
    if (!patternsForCard.has(cid)) patternsForCard.set(cid, []);
    patternsForCard.get(cid).push(p);
  }
  const playbooksForCard = new Map();
  for (const pb of INDEX.playbooks) for (const cid of (pb.uses_cards || [])) {
    if (!playbooksForCard.has(cid)) playbooksForCard.set(cid, []);
    playbooksForCard.get(cid).push(pb);
  }
  const cardsForOperator = new Map();
  const patternsForOperator = new Map();
  const playbooksForOperator = new Map();
  for (const ins of INDEX.insights) {
    const opSlugs = new Set();
    const primary = opSlugify(ins.operator);
    if (primary) opSlugs.add(primary);
    for (const co of (ins.co_operators || [])) {
      const s = opSlugify(co);
      if (s) opSlugs.add(s);
    }
    for (const s of opSlugs) {
      if (!cardsForOperator.has(s)) cardsForOperator.set(s, []);
      cardsForOperator.get(s).push(ins);
    }
  }
  // Patterns + playbooks the operator contributes to (transitively, via their cards).
  for (const p of INDEX.patterns) {
    const ops = new Set();
    for (const cid of (p.uses_cards || [])) {
      const c = cardById.get(cid);
      if (!c) continue;
      const s = opSlugify(c.operator);
      if (s) ops.add(s);
      for (const co of (c.co_operators || [])) {
        const cs = opSlugify(co);
        if (cs) ops.add(cs);
      }
    }
    for (const s of ops) {
      if (!patternsForOperator.has(s)) patternsForOperator.set(s, []);
      patternsForOperator.get(s).push(p);
    }
  }
  for (const pb of INDEX.playbooks) {
    const ops = new Set();
    for (const cid of (pb.uses_cards || [])) {
      const c = cardById.get(cid);
      if (!c) continue;
      const s = opSlugify(c.operator);
      if (s) ops.add(s);
      for (const co of (c.co_operators || [])) {
        const cs = opSlugify(co);
        if (cs) ops.add(cs);
      }
    }
    // Also: originating_operators (named on the playbook frontmatter).
    for (const name of (pb.originating_operators || [])) {
      const s = opSlugify(name);
      if (s) ops.add(s);
    }
    for (const s of ops) {
      if (!playbooksForOperator.has(s)) playbooksForOperator.set(s, []);
      playbooksForOperator.get(s).push(pb);
    }
  }

  // Render helpers for the "Where this connects" block. Same tile shape across
  // primitive types so the visual grammar reads as one thing.
  const cardTile = (c) => `<a class="static-card" href="${SITE_URL}/ins/${c.id}/"><div class="tier">Tier ${escapeHtml(c.tier || "C")} · ${escapeHtml((c.domain||[]).slice(0,2).join(" · ") || "·")}</div><div class="static-card-title">${escapeHtml(c.title || c.id)}</div></a>`;
  const patternTile = (p) => `<a class="static-card" href="${SITE_URL}/pat/${p.id}/"><div class="tier">Pattern · ${escapeHtml((p.domains||[]).slice(0,2).join(" · ") || "·")}</div><div class="static-card-title">${escapeHtml(p.title || p.id)}</div></a>`;
  const playbookTile = (pb) => `<a class="static-card" href="${SITE_URL}/play/${pb.id}/"><div class="tier">Playbook · ${escapeHtml((Array.isArray(pb.domain) ? pb.domain : (pb.domain ? [pb.domain] : [])).slice(0,2).join(" · ") || "·")}</div><div class="static-card-title">${escapeHtml(pb.title || pb.id)}</div></a>`;
  const operatorTile = (op, count) => `<a class="static-card" href="${SITE_URL}/o/${op.slug}/"><div class="tier">Operator · ${count} insight${count === 1 ? "" : "s"}</div><div class="static-card-title">${escapeHtml(op.name || op.slug)}</div></a>`;
  const relatedGroup = (label, htmlItems) => htmlItems
    ? `<div class="static-related-group"><div class="static-related-label">${label}</div><div class="static-cards-grid">${htmlItems}</div></div>`
    : "";
  const domainStrip = (domains) => {
    const ds = (domains || []).slice(0, 6);
    if (!ds.length) return "";
    const links = ds.map(d => `<a href="${SITE_URL}/d/${d}/">${escapeHtml(d)}</a>`).join(" · ");
    return `<div class="static-related-group"><div class="static-related-label">Domains</div><p class="static-domains">${links}</p></div>`;
  };

  // Helper to write static HTML for a markdown file at canonical URL.
  const writeOne = async ({ outPath, title, description, canonical, hashRoute, jsonLd, body, ogImage, hasVisual, extraStyle }) => {
    const html = shell({ title, description, canonical, hashRoute, jsonLd, body, ogImage, hasVisual, extraStyle });
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
      <a href="https://raw.githubusercontent.com/k3sava/abcodex/main/insight-library/${i.path}" rel="noopener">Markdown source →</a>
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
    // Authors are referenced by stable @id (operator page anchor) so a graph
    // crawler can cluster every card by one operator without de-duping by name.
    const authorRefs = [
      { "@type": "Person", "@id": `${SITE_URL}/o/${opSlug}/#person`, "name": opName, "url": `${SITE_URL}/o/${opSlug}/`, ...(i.operator_role ? { "jobTitle": i.operator_role } : {}) },
      ...(Array.isArray(i.co_operators) ? i.co_operators.map(co => {
        const cs = opSlugify(co);
        return { "@type": "Person", "@id": `${SITE_URL}/o/${cs}/#person`, "name": co, "url": `${SITE_URL}/o/${cs}/` };
      }) : []),
    ];
    const isBasedOnObj = i.source_url ? {
      "@type": "CreativeWork",
      "url": i.source_url,
      ...(i.source_title ? { "name": i.source_title } : {}),
      ...(i.source_type ? { "encodingFormat": i.source_type } : {}),
      ...(i.source_date ? { "datePublished": i.source_date } : {}),
    } : undefined;
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `${SITE_URL}/ins/${i.id}/#article`,
          "headline": i.title || i.id,
          "datePublished": i.source_date || undefined,
          "dateModified": i.captured_date || i.source_date || undefined,
          "author": authorRefs,
          ...(isBasedOnObj ? { "isBasedOn": isBasedOnObj } : {}),
          "publisher": { "@id": ORG_CODEX_ID },
          "url": `${SITE_URL}/ins/${i.id}/`,
          "mainEntityOfPage": `${SITE_URL}/ins/${i.id}/`,
          "keywords": (i.domain || []).join(", "),
          "license": "https://opensource.org/licenses/MIT",
          "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".static-tldr-claim"] },
          ...(i.tier ? { "additionalType": `${SITE_URL}/tier/${i.tier}` } : {}),
        },
        { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "abcodex", "url": SITE_URL, "logo": { "@type": "ImageObject", "url": `${SITE_URL}/og.png` }, "founder": { "@id": PERSON_KESAVA_ID } },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "abcodex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "operators", "item": SITE_URL + "/operators/" },
            { "@type": "ListItem", "position": 3, "name": opName, "item": `${SITE_URL}/o/${opSlug}/` },
            { "@type": "ListItem", "position": 4, "name": i.title || i.id, "item": `${SITE_URL}/ins/${i.id}/` },
          ],
        },
        ...(faqEntries.length ? [{ "@type": "FAQPage", "mainEntity": faqEntries }] : []),
      ],
    };
    // Related block. Domain links + same-operator siblings + patterns + playbooks
    // + frontmatter `related`. Drives ≥6 outbound links per insight page.
    const siblingCards = (cardsForOperator.get(opSlug) || [])
      .filter(c => c.id !== i.id)
      .slice(0, 6);
    const patternsHere = (patternsForCard.get(i.id) || []).slice(0, 6);
    const playbooksHere = (playbooksForCard.get(i.id) || []).slice(0, 6);
    const relatedCards = (Array.isArray(i.related) ? i.related : [])
      .map(rid => cardById.get(rid))
      .filter(Boolean)
      .filter(c => c.id !== i.id)
      .slice(0, 6);
    const relatedBlock = `<section class="static-related"><h2>Where this connects</h2>
${domainStrip(i.domain)}
${relatedGroup(`More from ${escapeHtml(opName)}`, siblingCards.map(cardTile).join(""))}
${relatedGroup("Where this converges", patternsHere.map(patternTile).join(""))}
${relatedGroup("Playbooks using this card", playbooksHere.map(playbookTile).join(""))}
${relatedGroup("Related insights", relatedCards.map(cardTile).join(""))}
</section>`;
    await writeOne({
      outPath: join(DOCS, "ins", i.id, "index.html"),
      title: i.title || i.id,
      description: `${opName}: "${i.title}" (${i.source_type || "source"}, ${i.source_date || "undated"}).`,
      canonical: `${SITE_URL}/ins/${i.id}/`,
      hashRoute: `#/ins/${i.id}`,
      jsonLd,
      ogImage: `${SITE_URL}/og/ins/${i.id}.svg`,
      body: `${crumbs}<h1>${escapeHtml(i.title || i.id)}</h1>${meta}${tldr}<article>${renderedBody}</article>${relatedBlock}${cta}`,
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
    const cards = cardsForOperator.get(op.slug) || [];
    // Cards by this operator (primary + co-author) as an a11y-friendly grid.
    const cardsList = cards.length ? `<h2>Insights · ${cards.length}</h2><div class="static-cards-grid">${cards.map(cardTile).join("")}</div>` : "";
    // Reverse lookups. Patterns and playbooks the operator contributes to,
    // transitively via their cards (plus playbook frontmatter originating_operators).
    const opPatterns = (patternsForOperator.get(op.slug) || []).slice(0, 12);
    const opPlaybooks = (playbooksForOperator.get(op.slug) || []).slice(0, 12);
    const domainsForOp = [...new Set(cards.flatMap(c => c.domain || []))];
    const opRelatedBlock = (opPatterns.length || opPlaybooks.length || domainsForOp.length)
      ? `<section class="static-related"><h2>Where this operator connects</h2>
${domainStrip(domainsForOp)}
${relatedGroup("Patterns this operator contributes to", opPatterns.map(patternTile).join(""))}
${relatedGroup("Playbooks using their cards", opPlaybooks.map(playbookTile).join(""))}
</section>`
      : "";
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
          "@id": `${SITE_URL}/o/${op.slug}/#person`,
          "name": op.name || op.slug,
          "url": `${SITE_URL}/o/${op.slug}/`,
          ...(Array.isArray(op.roles) && op.roles.length ? { "description": op.roles.join("; ") } : {}),
          ...(sameAs.length ? { "sameAs": sameAs } : {}),
          "mainEntityOfPage": `${SITE_URL}/o/${op.slug}/`,
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "abcodex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "operators", "item": SITE_URL + "/operators/" },
            { "@type": "ListItem", "position": 3, "name": op.name || op.slug, "item": `${SITE_URL}/o/${op.slug}/` },
          ],
        },
      ],
    };
    await writeOne({
      outPath: join(DOCS, "o", op.slug, "index.html"),
      title: op.name || op.slug,
      description: `${op.name || op.slug} on abcodex. Operator profile, insights, primary sources.`,
      canonical: `${SITE_URL}/o/${op.slug}/`,
      hashRoute: `#/o/${op.slug}`,
      jsonLd,
      ogImage: `${SITE_URL}/og/o/${op.slug}.svg`,
      body: `${crumbs}<h1>${escapeHtml(op.name || op.slug)}</h1><article>${renderedBody}</article>${cardsList}${opRelatedBlock}${cta}`,
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
    // Convergence cards + the operators who arrived there + adjacent playbooks.
    const convergenceCards = (p.uses_cards || []).map(cid => cardById.get(cid)).filter(Boolean);
    const opsInPattern = [...new Set(convergenceCards.flatMap(c => [c.operator, ...(c.co_operators || [])]).filter(Boolean))]
      .map(name => {
        const slug = opSlugify(name);
        const opRec = INDEX.operators.find(o => o.slug === slug);
        return opRec ? { ...opRec, _cardCount: (cardsForOperator.get(slug) || []).length } : null;
      })
      .filter(Boolean)
      .slice(0, 12);
    const adjacentPlaybooks = [...new Set(
      convergenceCards.flatMap(c => (playbooksForCard.get(c.id) || []).map(pb => pb.id))
    )].map(id => INDEX.playbooks.find(pb => pb.id === id)).filter(Boolean).slice(0, 6);
    const patRelatedBlock = `<section class="static-related"><h2>Inside this convergence</h2>
${domainStrip(p.domains)}
${relatedGroup(`Cards in this pattern (${convergenceCards.length})`, convergenceCards.slice(0, 18).map(cardTile).join(""))}
${relatedGroup("Operators who arrive here", opsInPattern.map(o => operatorTile(o, o._cardCount)).join(""))}
${relatedGroup("Playbooks that use these cards", adjacentPlaybooks.map(playbookTile).join(""))}
</section>`;
    const patJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": p.title || p.id,
          "url": `${SITE_URL}/pat/${p.id}/`,
          "mainEntityOfPage": `${SITE_URL}/pat/${p.id}/`,
          ...(p.captured_date ? { "datePublished": p.captured_date } : {}),
          ...(p.last_updated ? { "dateModified": p.last_updated } : {}),
          "keywords": (p.domains || []).join(", "),
          "license": "https://opensource.org/licenses/MIT",
          "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "article p:first-of-type"] },
          "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "abcodex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } },
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "abcodex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "patterns", "item": SITE_URL + "/patterns/" },
            { "@type": "ListItem", "position": 3, "name": p.title || p.id, "item": `${SITE_URL}/pat/${p.id}/` },
          ],
        },
        ...(convergenceCards.length ? [{
          "@type": "ItemList",
          "name": `Cards in pattern: ${p.title || p.id}`,
          "numberOfItems": convergenceCards.length,
          "itemListElement": convergenceCards.map((c, idx) => ({
            "@type": "ListItem", "position": idx + 1,
            "url": `${SITE_URL}/ins/${c.id}/`,
            "name": c.title || c.id,
          })),
        }] : []),
      ],
    };
    await writeOne({
      outPath: join(DOCS, "pat", p.id, "index.html"),
      title: p.title || p.id,
      description: `Synthesis pattern: ${p.title || p.id}. Where ${convergenceCards.length} operators converge on the same idea from different angles.`,
      canonical: `${SITE_URL}/pat/${p.id}/`,
      hashRoute: `#/pat/${p.id}`,
      jsonLd: patJsonLd,
      ogImage: `${SITE_URL}/og/pat/${p.id}.svg`,
      body: `${crumbs}<h1>${escapeHtml(p.title || p.id)}</h1><article>${renderedBody}</article>${patRelatedBlock}${cta}`,
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
    // Contradictions store side A / side B card IDs in uses_cards arrays.
    const conCardIds = [
      ...(Array.isArray(c.uses_cards) ? c.uses_cards : []),
      ...(Array.isArray(c.side_a_cards) ? c.side_a_cards : []),
      ...(Array.isArray(c.side_b_cards) ? c.side_b_cards : []),
    ];
    const conCards = [...new Set(conCardIds)].map(id => cardById.get(id)).filter(Boolean);
    const conRelatedBlock = conCards.length
      ? `<section class="static-related"><h2>Where the disagreement lives</h2>
${domainStrip(c.domains)}
${relatedGroup("Cards on both sides", conCards.slice(0, 12).map(cardTile).join(""))}
</section>`
      : "";
    const conJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": c.title || c.id,
          "url": `${SITE_URL}/con/${c.id}/`,
          "mainEntityOfPage": `${SITE_URL}/con/${c.id}/`,
          ...(c.captured_date ? { "datePublished": c.captured_date } : {}),
          "license": "https://opensource.org/licenses/MIT",
          "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "article p:first-of-type"] },
          "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "abcodex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } },
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "abcodex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "patterns", "item": SITE_URL + "/patterns/" },
            { "@type": "ListItem", "position": 3, "name": c.title || c.id, "item": `${SITE_URL}/con/${c.id}/` },
          ],
        },
      ],
    };
    await writeOne({
      outPath: join(DOCS, "con", c.id, "index.html"),
      title: c.title || c.id,
      description: `Contradiction: ${c.title || c.id}. Where operators disagree on the same question.`,
      canonical: `${SITE_URL}/con/${c.id}/`,
      hashRoute: `#/con/${c.id}`,
      jsonLd: conJsonLd,
      body: `${crumbs}<h1>${escapeHtml(c.title || c.id)}</h1><article>${renderedBody}</article>${conRelatedBlock}${cta}`,
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
    const processedBody = wrapStepContainers(mergeQuoteAttributions(markOperatorQuotes(renderedBody)));
    // Split intro paragraph(s) (before first H2) from the rest of the body
    const h2idx = processedBody.indexOf("<h2 ");
    const introHtml = h2idx > 0 ? processedBody.slice(0, h2idx).trim() : "";
    const mainBody = h2idx > 0 ? processedBody.slice(h2idx) : processedBody;
    const cta = `<div class="static-actions"><a class="primary" href="${SITE_URL}/#/play/${p.id}">Open the interactive view →</a></div>`;
    const crumbs = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/playbooks/">playbooks</a> · ${escapeHtml(p.title || p.id)}</div>`;
    const visualHtml = await loadVisual(p.id);
    const socialOgUrl = await copySocialOg(p.id);
    await copyVisualImages(p.id);
    // Extract numbered H3 steps (### N. Title) as HowToStep schema objects with
    // correct #step-NN anchor URLs. Falls back to H2 sections for playbooks
    // without the numbered-step structure.
    const steps = [];
    const lines = cleaned.split("\n");
    // Capture intro paragraph (before first heading) for description + meta.
    const introTextBuf = [];
    for (const l of lines){
      if (/^#+/.test(l) || /^---+$/.test(l.trim())) break;
      const t = l.trim();
      if (t) introTextBuf.push(t);
      if (introTextBuf.length >= 3) break;
    }
    const introText = introTextBuf.join(" ").replace(/\*\*/g,"").replace(/\*([^*]+)\*/g,"$1").replace(/`[^`]+`/g,"").slice(0, 400);
    for (let i = 0; i < lines.length; i++){
      const m = lines[i].match(/^###\s+(\d+)\.\s+(.+?)\s*$/);
      if (!m) continue;
      const stepNum = String(parseInt(m[1], 10)).padStart(2, "0");
      const name = m[2].trim().replace(/\*\*/g,"").replace(/`([^`]+)`/g,"$1");
      const buf = [];
      for (let j = i + 1; j < lines.length; j++){
        if (/^#+/.test(lines[j])) break;
        if (/^---+$/.test(lines[j].trim())) break;
        if (/^[>|]/.test(lines[j])) continue;
        if (/^[-*]\s/.test(lines[j])) continue;
        const t = lines[j].trim();
        if (t) buf.push(t);
        if (buf.length >= 3) break;
      }
      const text = buf.join(" ").replace(/\*\*/g,"").replace(/\*([^*]+)\*/g,"$1").replace(/`[^`]+`/g,"").slice(0, 500);
      steps.push({ "@type": "HowToStep", "position": parseInt(m[1], 10), "name": name, "text": text || name, "url": `${SITE_URL}/play/${p.id}/#step-${stepNum}` });
    }
    // Fallback: H2 sections when no numbered steps present
    if (!steps.length){
      const skipSteps = new Set(["references", "sources", "links", "see also"]);
      for (let i = 0; i < lines.length; i++){
        const m = lines[i].match(/^##\s+(.+?)\s*$/);
        if (!m) continue;
        const name = m[1].trim();
        if (skipSteps.has(name.toLowerCase())) continue;
        const buf = [];
        for (let j = i + 1; j < lines.length; j++){
          if (/^##/.test(lines[j])) break;
          if (lines[j].trim()) buf.push(lines[j].trim());
          if (buf.length >= 4) break;
        }
        const text = buf.join(" ").slice(0, 400);
        const slugH2 = name.toLowerCase().replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").replace(/^-+|-+$/g,"");
        if (text) steps.push({ "@type": "HowToStep", "position": steps.length + 1, "name": name, "text": text, "url": `${SITE_URL}/play/${p.id}/#${slugH2}` });
      }
    }
    // Build in-article TOC from H2 headings (shown when ≥3 sections)
    const slugifyToc = t => t.toLowerCase().replace(/\*\*/g,"").replace(/`[^`]+`/g,"").replace(/[^\w\s-]/g,"").trim().replace(/[\s_]+/g,"-").replace(/^-+|-+$/g,"");
    const h2s = cleaned.split("\n").filter(l => /^##\s+/.test(l)).map(l => l.replace(/^##\s+/,"").trim()).filter(Boolean);
    const tocItems = h2s.map(h => `<li><a href="#${slugifyToc(h)}">${escapeHtml(h)}</a></li>`).join("");
    // Mobile TOC: inline, hidden on wide screens when sidebar is present
    const mobileTocHtml = h2s.length >= 3
      ? `<nav class="pb-toc pb-toc-mobile"><p class="pb-toc-label">In this playbook</p><ol>${tocItems}</ol></nav>`
      : "";
    // Sidebar TOC: sticky, shown only on wide screens (≥1160px)
    const sidebarTocHtml = h2s.length >= 3
      ? `<aside class="pb-sidebar"><nav class="pb-toc"><p class="pb-toc-label">Contents</p><ol>${tocItems}</ol></nav></aside>`
      : "";
    const cardsForPlaybook = (p.uses_cards || []).slice(0, 8).map(cid => INDEX.insights.find(i => i.id === cid)).filter(Boolean);
    const opsForPlaybook = [...new Set((p.originating_operators || []).concat(cardsForPlaybook.map(c => c.operator).filter(Boolean)))];
    // Insight chips — operator + year, full title as tooltip
    const seenChipLabels = new Set();
    const insightChips = cardsForPlaybook.length
      ? `<div class="pb-insight-chips"><span class="pb-insight-chips-label">Insights used</span>${cardsForPlaybook.map(c=>{const yr=(c.source_date||"").slice(0,4);const label=`${c.operator||c.id}${yr?" · "+yr:""}`;if(seenChipLabels.has(label))return"";seenChipLabels.add(label);return`<a class="pb-insight-chip" href="${SITE_URL}/ins/${c.id}/" title="${escapeHtml(c.title||c.id)}">${escapeHtml(label)}</a>`;}).filter(Boolean).join("")}</div>`
      : "";
    // Split visual file into individual pbv blocks and inject each at the right position.
    const [visual1, visual2, visual3, visual4] = splitVisuals(visualHtml);
    let mainBodyWithVisual = mainBody;
    if (visual1) {
      mainBodyWithVisual = mainBodyWithVisual.match(/<h2 [^>]*id="how-to-use"[^>]*>[^<]*<\/h2>/)
        ? mainBodyWithVisual.replace(/(<h2 [^>]*id="how-to-use"[^>]*>[^<]*<\/h2>)/, `$1${visual1}`)
        : mainBodyWithVisual.match(/<h2 [^>]*id="steps"[^>]*>[^<]*<\/h2>/)
          ? mainBodyWithVisual.replace(/(<h2 [^>]*id="steps"[^>]*>[^<]*<\/h2>)/, `$1${visual1}`)
          : visual1 + mainBodyWithVisual;
    }
    if (visual2) {
      mainBodyWithVisual = injectBeforeNthStep(mainBodyWithVisual, visual2, 6);
    }
    // visual3 = comparison page template pipeline, visual4 = annotated real example
    const compareBlock = [visual3, visual4].filter(Boolean).join("\n");
    if (compareBlock) {
      mainBodyWithVisual = mainBodyWithVisual.replace(
        /(<h2 [^>]*id="compare-honestly"[^>]*>[^<]*<\/h2>)/,
        `$1${compareBlock}`
      );
    }
    const howTo = {
      "@type": "HowTo",
      "name": p.title || p.id,
      "description": introText || `Playbook bundling operator-attributed insights from ${opsForPlaybook.slice(0, 6).join(", ")}.`,
      "url": `${SITE_URL}/play/${p.id}/`,
      ...(steps.length ? { "step": steps } : {}),
      "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "abcodex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } },
    };
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        howTo,
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "abcodex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "playbooks", "item": SITE_URL + "/playbooks/" },
            { "@type": "ListItem", "position": 3, "name": p.title || p.id, "item": `${SITE_URL}/play/${p.id}/` },
          ],
        },
        ...(cardsForPlaybook.length ? [{ "@type": "ItemList", "name": "Insights this playbook builds on", "itemListElement": cardsForPlaybook.map((c, i) => ({ "@type": "ListItem", "position": i + 1, "url": `${SITE_URL}/ins/${c.id}/`, "name": c.title || c.id })) }] : []),
        {
          "@type": "WebPage",
          "@id": `${SITE_URL}/play/${p.id}/#webpage`,
          "url": `${SITE_URL}/play/${p.id}/`,
          "name": p.title || p.id,
          "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".pb-step h3", ".pb-operator-quote p:first-child"] },
          "isPartOf": { "@id": ORG_CODEX_ID },
        },
      ],
    };
    // Wide layout (sidebar TOC) is added as per-playbook extra CSS only when there are sections
    const extraStyle = h2s.length >= 3
      ? `@media(min-width:1160px){main.static{max-width:1100px}.pb-layout{display:grid;grid-template-columns:1fr 196px;gap:56px;align-items:start}.pb-toc-mobile{display:none}.pb-sidebar{display:block;position:sticky;top:72px;max-height:calc(100vh - 90px);overflow-y:auto}.pb-sidebar .pb-toc{margin:0;background:transparent;border:none;padding:0 0 0 14px;border-left:2px solid var(--line)}.pb-sidebar .pb-toc li::before{display:none}.pb-sidebar .pb-toc a{font-size:.82rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:182px}}`
      : "";
    await writeOne({
      outPath: join(DOCS, "play", p.id, "index.html"),
      title: p.title || p.id,
      description: introText ? `${p.title || p.id}: ${introText.slice(0, 155)}` : `Playbook: ${p.title || p.id}. ${opsForPlaybook.slice(0, 4).join(", ")}.`,
      canonical: `${SITE_URL}/play/${p.id}/`,
      hashRoute: `#/play/${p.id}`,
      jsonLd,
      ogImage: socialOgUrl || `${SITE_URL}/og/play/${p.id}.svg`,
      hasVisual: !!(visual1 || visual2),
      extraStyle,
      body: `${crumbs}<h1>${escapeHtml(p.title || p.id)}</h1>${introHtml}${insightChips}<div class="pb-layout"><div class="pb-article-col">${mobileTocHtml}<article>${mainBodyWithVisual}</article>${cta}</div>${sidebarTocHtml}</div>`,
    });

    // Emit a stripped-slug alias for stranger-cold-click. /play/competitive-analysis/
    // would 404 because the canonical lives at /play/pb_competitive-analysis/. The
    // alias is a same-origin HTML redirect with rel=canonical pointing at the real page
    // so search engines treat it as a 301 equivalent.
    if (p.id && p.id.startsWith("pb_")){
      const aliasSlug = p.id.replace(/^pb_/, "");
      const aliasPath = join(DOCS, "play", aliasSlug, "index.html");
      const canonical = `${SITE_URL}/play/${p.id}/`;
      const aliasHtml = `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<title>${escapeHtml(p.title || p.id)} · abcodex</title>
<link rel="canonical" href="${canonical}">
<meta name="robots" content="noindex,follow">
<meta http-equiv="refresh" content="0; url=${canonical}">
<meta property="og:url" content="${canonical}">
<style>body{font-family:system-ui,sans-serif;background:#f3f5ee;color:#0d1410;margin:0;padding:48px 24px;text-align:center}a{color:#1f9d55}</style>
</head><body>
<p>Redirecting to <a href="${canonical}">${escapeHtml(p.title || p.id)}</a>.</p>
<script>location.replace(${JSON.stringify(canonical)});</script>
</body></html>`;
      await ensureDir(dirname(aliasPath));
      await writeFile(aliasPath, aliasHtml);
      count++;
    }
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
      jsonLd: { "@context": "https://schema.org", "@type": "Article", "headline": d.title || `release ${d.date}`, "datePublished": d.date, "url": `${SITE_URL}/today/${d.date}/`, "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "abcodex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } } },
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
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", "name": title, "url": `${SITE_URL}/${path}/`, "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "abcodex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } } },
    body,
  });

  // Operators index. JTBD H1, domain-counts row, then A–Z sections.
  {
    const ops = [...INDEX.operators].sort((a, b) => (a.name || a.slug).localeCompare(b.name || b.slug));
    const groups = new Map();
    for (const o of ops){
      const letter = (o.name || o.slug || "").charAt(0).toUpperCase() || "·";
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    }
    // Attach card count next to each operator so the index reads as a leaderboard,
    // not an alphabetical wall.
    const sectionEls = [...groups.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([letter, list]) => `
      <section><h2>${letter}</h2><ul class="static-op-index">${list.map(o => {
        const ct = (cardsForOperator.get(o.slug) || []).length;
        return `<li><a href="${SITE_URL}/o/${o.slug}/">${escapeHtml(o.name || o.slug)}</a>${ct ? `<span class="static-op-count">${ct}</span>` : ""}</li>`;
      }).join("")}</ul></section>
    `).join("");
    const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · operators</div>
      <p class="static-eyebrow">operators</p>
      <h1>Learn from the people who shipped it</h1>
      <p class="static-lede">${INDEX.operators.length} named operators across product, PMM, GTM, AI-native, design, engineering, leadership, sales, growth, research, and founder craft. Every claim traces back to one person and one source.</p>
      ${sectionEls}`;
    await listShell("operators", "Learn from the people who shipped it · operators", `Index of ${INDEX.operators.length} operator profiles in abcodex. Primary-source, named-author insights across product, PMM, GTM, AI-native, design, engineering, leadership, sales, growth, research, and founder craft.`, body);
  }

  // Patterns index. JTBD H1, grouped by primary domain.
  {
    const list = [...INDEX.patterns].sort((a, b) => (b.convergence_count || 0) - (a.convergence_count || 0) || (a.title || a.id).localeCompare(b.title || b.id));
    // Group by primary domain (first listed). Within group, keep convergence_count order.
    const byDomain = new Map();
    for (const p of list){
      const dom = (p.domains && p.domains[0]) || "other";
      if (!byDomain.has(dom)) byDomain.set(dom, []);
      byDomain.get(dom).push(p);
    }
    const ordered = [...byDomain.entries()].sort((a,b) => b[1].length - a[1].length);
    const groupEls = ordered.map(([dom, items]) => `
      <section><h2>${escapeHtml(dom)} · ${items.length}</h2>
        <ul class="static-pat-list">${items.map(p => `<li><a href="${SITE_URL}/pat/${p.id}/">${escapeHtml(p.title || p.id)}</a>${p.convergence_count ? ` <span class="static-pat-count">${p.convergence_count} ops</span>` : ""}</li>`).join("")}</ul>
      </section>`).join("");
    const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · patterns</div>
      <p class="static-eyebrow">patterns</p>
      <h1>See where operators converge on the same answer</h1>
      <p class="static-lede">${list.length} cross-operator convergences. When three or more people arrive at the same idea independently, from different angles, it's probably not just a hot take. Each pattern names the operators, the cards, and the implication.</p>
      ${groupEls}`;
    await listShell("patterns", "See where operators converge on the same answer · patterns", `${list.length} cross-operator convergences in abcodex. Each pattern names the operators, the cards, and the implication.`, body);
  }

  // Playbooks index. JTBD H1, taxonomy buckets, one-line "what this gets you" per playbook.
  if (INDEX.playbooks && INDEX.playbooks.length){
    const list = [...INDEX.playbooks].filter(p => p.id);
    // Group by primary domain. "other" catches multi-domain or domain-less.
    const byDomain = new Map();
    for (const p of list){
      const dom = Array.isArray(p.domain) ? (p.domain[0] || "other") : (p.domain || "other");
      if (!byDomain.has(dom)) byDomain.set(dom, []);
      byDomain.get(dom).push(p);
    }
    const ordered = [...byDomain.entries()].sort((a,b) => b[1].length - a[1].length);
    const groupEls = ordered.map(([dom, items]) => {
      const tiles = items.sort((a,b) => (a.title || a.id).localeCompare(b.title || b.id)).map(p => {
        const ops = (p.originating_operators || []).slice(0, 3).join(", ");
        const cardCount = (p.uses_cards || []).length;
        const meta = [];
        if (ops) meta.push(escapeHtml(ops));
        if (cardCount) meta.push(`${cardCount} card${cardCount===1?"":"s"}`);
        return `<a class="static-card" href="${SITE_URL}/play/${p.id}/"><div class="tier">Playbook${meta.length ? " · " + meta.join(" · ") : ""}</div><div class="static-card-title">${escapeHtml(p.title || p.id)}</div></a>`;
      }).join("");
      return `<section><h2>${escapeHtml(dom)} · ${items.length}</h2><div class="static-cards-grid">${tiles}</div></section>`;
    }).join("");
    const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · playbooks</div>
      <p class="static-eyebrow">playbooks</p>
      <h1>Run the play the operators ran</h1>
      <p class="static-lede">${list.length} methodology playbooks distilled across the corpus. Each one ties named operators to a step-by-step workflow you can run on Monday. HowTo schema attached.</p>
      ${groupEls}`;
    await listShell("playbooks", "Run the play the operators ran · playbooks", `${list.length} methodology playbooks in abcodex, grouped by domain. Each carries named operators, step-by-step workflow, and HowTo schema.`, body);
  }

  // Release log index. JTBD H1, weekly grouping.
  if (INDEX.daily && INDEX.daily.length){
    const list = [...INDEX.daily].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    // Group by ISO week (Mon-based). Each release is YYYY-MM-DD.
    const weekKey = (iso) => {
      if (!iso) return "·";
      const d = new Date(iso + "T00:00:00Z");
      // Find the Monday of this ISO week.
      const day = d.getUTCDay() || 7;
      const monday = new Date(d.getTime() - (day - 1) * 86400000);
      return monday.toISOString().slice(0, 10);
    };
    const groups = new Map();
    for (const d of list){
      const k = weekKey(d.date);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(d);
    }
    const ordered = [...groups.entries()].sort(([a],[b]) => b.localeCompare(a));
    const itemHtml = (d) => {
      const ia = (d.insights_added||[]).length;
      const oa = (d.operators_added||[]).length;
      const pa = (d.patterns_added||[]).length;
      const pba = (d.playbooks_added||[]).length;
      const counts = [];
      if (ia) counts.push(`+${ia} insight${ia===1?"":"s"}`);
      if (oa) counts.push(`+${oa} operator${oa===1?"":"s"}`);
      if (pa) counts.push(`+${pa} pattern${pa===1?"":"s"}`);
      if (pba) counts.push(`+${pba} playbook${pba===1?"":"s"}`);
      return `<li><a href="${SITE_URL}/today/${d.date}/"><span class="static-rel-date">${escapeHtml(d.date)}</span><span class="static-rel-title">${escapeHtml(d.title || "release")}</span></a>${counts.length ? `<span class="static-rel-counts">${counts.join(" · ")}</span>` : ""}</li>`;
    };
    const sectionEls = ordered.map(([wk, items]) => `
      <section><h2>Week of ${wk}</h2><ul class="static-rel-list">${items.map(itemHtml).join("")}</ul></section>
    `).join("");
    const oldestDate = list[list.length-1]?.date || "";
    const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · release log</div>
      <p class="static-eyebrow">release log</p>
      <h1>See what changed in the codex this week</h1>
      <p class="static-lede">${list.length} releases since ${oldestDate}. Daily ingests, prompted batches, depth passes. Subscribe via <a href="${SITE_URL}/rss.xml">RSS</a>.</p>
      ${sectionEls}`;
    await listShell("today", "See what changed in the codex this week · release log", `${list.length} releases in abcodex, grouped by week. Daily ingests, prompted batches, depth passes. RSS feed available.`, body);
  }

  // === static /about/ — crawler-visible mirror of the SPA about route ===
  // The SPA already serves /#/about but agents that don't execute JS see an
  // empty body. Static page carries the full prose plus stats baked in at
  // build time.
  {
    const STATS = {
      cards: INDEX.insights.length,
      operators: INDEX.operators.length,
      patterns: INDEX.patterns.length,
      contradictions: (INDEX.contradictions || []).length,
      playbooks: (INDEX.playbooks || []).length,
      tierA: INDEX.insights.filter(c => c.tier === "A").length,
      domains: new Set(INDEX.insights.flatMap(c => c.domain || [])).size,
    };
    const aboutBody = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · about</div>
      <p class="static-eyebrow">about</p>
      <h1>About a builder's codex</h1>
      <p class="static-lede">A library of usable insights from people who shipped something. Every idea attached to the person who said it, the place they said it, and the date.</p>

      <h2>What this is, in one paragraph</h2>
      <p>You are learning a craft. Product marketing. Growth. Design. Building with AI. The smart move is to read what people who have done it think. The problem is the good thinking is scattered across podcasts, posts, talks, books, and threads. By the time you find a useful idea, you have forgotten where it came from, who said it, and whether it was even theirs. So you cannot go back to verify it. You cannot cite it cleanly. You cannot tell when an idea has been re-said by ten different people (a real signal) versus invented by one (a hot take).</p>
      <p>This codex fixes that. Every insight is one idea from one named person, with a primary source URL and a date. We add three things the source usually skips. Why it works (mechanism). When it applies (conditions). When it fails (counter-evidence). So you can use it, not just read it.</p>

      <h2>How to read an insight</h2>
      <p>Every insight has the same shape. <strong>Claim</strong> states the idea in one sentence. <strong>Mechanism</strong> explains why it works. The underlying causal model. <strong>Conditions</strong> says when it applies and when it doesn't. <strong>Evidence</strong> is the operator's quote or example, with the source. <strong>Signals</strong> are the things you'd see in your own work if it's working. <strong>Counter-evidence</strong> is where it fails or who disagrees. <strong>Cross-references</strong> link to related insights.</p>
      <p>If you only have a minute, read the Claim and skip the rest. If you're considering acting on the idea, read Conditions. If you want to know whether to trust it, read Evidence and Counter-evidence.</p>

      <h2>What you can do here</h2>
      <ul>
        <li><strong>Search</strong>. From the interactive view, hit ⌘K or / from anywhere. Type a phrase, an operator's name, or a domain.</li>
        <li><strong>Find convergence</strong>. The <a href="${SITE_URL}/patterns/">patterns</a> page surfaces ideas where three or more operators independently agree.</li>
        <li><strong>Run the play</strong>. The <a href="${SITE_URL}/playbooks/">playbooks</a> page distills methodology you can run on Monday. HowTo schema attached.</li>
        <li><strong>Cite it</strong>. Every insight has copy-citation, copy-as-markdown, and the original source link.</li>
      </ul>

      <h2>The corpus right now</h2>
      <ul>
        <li><strong>${STATS.cards}</strong> insights across <strong>${STATS.domains}</strong> domains</li>
        <li><strong>${STATS.operators}</strong> operator profiles</li>
        <li><strong>${STATS.patterns}</strong> synthesis patterns (three or more operator convergences)</li>
        <li><strong>${STATS.contradictions}</strong> documented contradictions (where operators disagree)</li>
        <li><strong>${STATS.playbooks}</strong> methodology playbooks</li>
        <li><strong>${STATS.tierA}</strong> Tier A claims (the highest-confidence, best-attributed)</li>
      </ul>

      <h2>The discipline</h2>
      <p>Every claim traces to its primary source. Nothing is paraphrased without attribution. Nothing is invented. If we are not sure of a date, we say "unknown" rather than guess. Where operators disagree, we document the disagreement as a contradiction. Where multiple operators converge, we document the convergence as a synthesis pattern. The codex is opinionated about epistemics so you don't have to be.</p>

      <h2>For agents and other tools</h2>
      <p>The corpus is built to be readable by AI search engines and other automated tools. <a href="${SITE_URL}/insight-library/INDEX.json">INDEX.json</a> is the canonical machine-readable index. Every record carries id, path, operator, source_url, source_date, domain, lifecycle, and tier. <a href="${SITE_URL}/llms.txt">llms.txt</a> documents the structure. <a href="${SITE_URL}/.well-known/agent-permissions.json">agent-permissions.json</a> declares the licensing terms (MIT, attribution required).</p>
      <p>Every insight has a static URL at <code>abcodex.iamkesava.com/ins/&lt;id&gt;/</code> with full content plus Schema.org structured data, so crawlers and AI search agents can read the page without executing JavaScript.</p>

      <h2>License</h2>
      <p>Source on <a href="https://github.com/k3sava/abcodex" rel="noopener">GitHub</a>. Released MIT. Raw sources retain their original copyright. The codex archives short excerpts under fair use, always with attribution and a link to the canonical source.</p>

      <div class="static-actions"><a class="primary" href="${SITE_URL}/#/about">Open the interactive view →</a><a href="${SITE_URL}/operators/">Browse operators →</a><a href="${SITE_URL}/playbooks/">Browse playbooks →</a></div>`;
    await writeOne({
      outPath: join(DOCS, "about", "index.html"),
      title: "About a builder's codex",
      description: "About a builder's codex. A primary-source library of operator insights. Atomic claims, named operators, verifiable sources. MIT-licensed, AI-readable.",
      canonical: `${SITE_URL}/about/`,
      hashRoute: `#/about`,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "AboutPage", "name": "About a builder's codex", "url": `${SITE_URL}/about/`, "publisher": { "@id": ORG_CODEX_ID }, "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".static-lede"] } },
          { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "abcodex", "url": SITE_URL, "logo": { "@type": "ImageObject", "url": `${SITE_URL}/og.png` }, "founder": { "@id": PERSON_KESAVA_ID } },
          { "@type": "BreadcrumbList", "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "abcodex", "item": SITE_URL + "/" },
            { "@type": "ListItem", "position": 2, "name": "about", "item": `${SITE_URL}/about/` },
          ] },
        ],
      },
      ogImage: `${SITE_URL}/og.png`,
      body: aboutBody,
    });
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

      // Domain leads. A reader-facing description of what they'll learn here,
      // not just a count. Falls back to a generic line if no curated lede exists.
      const domLede = DOMAIN_LEDES[dom] || `Operator insights tagged ${dom}, from ${opsInDom.size} named operators with primary sources.`;
      const body = `<div class="static-crumbs"><a href="${SITE_URL}/">codex</a> · <a href="${SITE_URL}/browse/">browse</a> · ${dom}</div>
        <p class="static-eyebrow">domain · ${dom}</p>
        <h1>${escapeHtml(DOMAIN_TITLES[dom] || dom)}</h1>
        <p class="static-lede">${escapeHtml(domLede)}</p>
        <p class="static-meta">${cardsInDom.length} cards · ${opsInDom.size} operators · ${cardsInDom.filter(c=>c.tier==='A').length} tier-A claims · ${patsInDom.length} synthesis pattern${patsInDom.length===1?'':'s'}.</p>
        ${sectionParts.join("\n")}`;
      const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "DefinedTerm",
            "name": dom,
            "inDefinedTermSet": `${SITE_URL}/`,
            "description": `Domain in abcodex. ${cardsInDom.length} insights from ${opsInDom.size} operators.`,
            "url": `${SITE_URL}/d/${dom}/`,
          },
          {
            "@type": "CollectionPage",
            "name": `${dom} · abcodex`,
            "url": `${SITE_URL}/d/${dom}/`,
            "about": { "@type": "DefinedTerm", "name": dom },
            "publisher": { "@type": "Organization", "@id": ORG_CODEX_ID, "name": "abcodex", "url": SITE_URL, "founder": { "@id": PERSON_KESAVA_ID } },
            "hasPart": cardsInDom.slice(0, 30).map(c => ({ "@type": "Article", "url": `${SITE_URL}/ins/${c.id}/`, "name": c.title || c.id, "author": { "@type": "Person", "name": c.operator || "·" } })),
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "abcodex", "item": SITE_URL + "/" },
              { "@type": "ListItem", "position": 2, "name": "browse", "item": SITE_URL + "/browse/" },
              { "@type": "ListItem", "position": 3, "name": dom, "item": `${SITE_URL}/d/${dom}/` },
            ],
          },
        ],
      };
      await writeOne({
        outPath: join(DOCS, "d", dom, "index.html"),
        title: `${dom} · abcodex`,
        description: `${cardsInDom.length} insights from ${opsInDom.size} operators in the ${dom} domain. Tier-A claims, synthesis patterns, adjacent domains.`,
        canonical: `${SITE_URL}/d/${dom}/`,
        hashRoute: `#/d/${dom}`,
        jsonLd,
        ogImage: `${SITE_URL}/og/d/${dom}.svg`,
        body,
      });
    }
  }

  // Copy pb-visuals CSS and JS to docs/assets/ so GH Pages can serve them.
  const cssDir = join(DOCS, "assets", "css");
  const jsDir = join(DOCS, "assets", "js");
  await ensureDir(cssDir);
  await ensureDir(jsDir);
  await copyFile(join(ROOT, "assets/css/pb-visuals.css"), join(cssDir, "pb-visuals.css"));
  await copyFile(join(ROOT, "assets/js/pb-visuals.js"), join(jsDir, "pb-visuals.js"));

  console.log(`build-static: emitted ${count} static HTML files under docs/`);
}

main().catch(e => { console.error(e); process.exit(1); });
