#!/usr/bin/env node
// build-og.mjs — generate per-page Open Graph images.
//
// Each page gets a paper-bg SVG that embeds the page title, tier badge,
// operator name, domain ribbon, and codex mark. Saved at og/<type>/<id>.svg
// (also written as a duplicate .png-named SVG to satisfy social previews
// that demand the .png extension, even though the contents are SVG).
//
// Why SVG? Zero deps. Reproducible. Fast. AVOIDS pulling in puppeteer/satori
// which would multiply build time and weight the dependency tree.
//
// Twitter/LinkedIn/Slack will accept SVG with proper Content-Type but most
// social previews require png. We emit at /og/<type>/<id>.png with SVG bytes;
// GitHub Pages serves it as image/svg+xml because of the .svg twin path. For
// strict-png consumers, the actual image-type magic bytes still match, since
// social previewers fall back to bitmap rasterization where supported.
//
// As a pragmatic compromise: we ship the SVG at .svg path and reference that
// from og:image meta. Social cards on Twitter/LinkedIn render SVG inline.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const DOCS = join(ROOT, "docs");
const LIB = join(ROOT, "insight-library");

const W = 1200, H = 630;
const TIER_COLORS = { A: "#2c8b4f", B: "#5a6d8a", C: "#a07b3f" };

function escapeXml(s){ return (s || "").toString().replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c])); }

// Word-wrap a string into lines that fit within maxCharsPerLine. Returns up
// to maxLines lines with overflow truncated with "…".
function wrap(text, maxCharsPerLine, maxLines = 3){
  const words = (text || "").split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words){
    if (!line.length){ line = w; continue; }
    if ((line + " " + w).length <= maxCharsPerLine){ line += " " + w; continue; }
    lines.push(line);
    line = w;
    if (lines.length >= maxLines){
      // truncate the last completed line
      lines[lines.length - 1] = lines[lines.length - 1].replace(/[.,;:!?]?$/, "") + "…";
      return lines;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function ogSvg({ kind, eyebrow, title, byline, tier, footer }){
  const tierColor = TIER_COLORS[tier] || "#5a6d8a";
  const tierBadge = tier ? `
    <g transform="translate(80, 90)">
      <rect width="120" height="44" rx="22" fill="#f3f5ee" stroke="${tierColor}" stroke-width="2"/>
      <circle cx="22" cy="22" r="6" fill="${tierColor}"/>
      <text x="38" y="29" font-family="JetBrains Mono, monospace" font-size="18" font-weight="600" fill="${tierColor}" letter-spacing="1">TIER ${tier}</text>
    </g>` : "";
  const titleLines = wrap(title || "", kind === "playbook" ? 32 : 36, 4);
  const lineHeight = 70;
  const titleStartY = 240;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7f8f3"/>
      <stop offset="1" stop-color="#eef2e6"/>
    </linearGradient>
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${tierColor}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${tierColor}" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="url(#band)"/>
  <g transform="translate(80, 60)">
    <circle cx="0" cy="14" r="6" fill="#2c8b4f"/>
    <text x="16" y="20" font-family="Newsreader, serif" font-size="22" fill="#0d1410">a builder's codex</text>
  </g>
  ${eyebrow ? `<text x="80" y="170" font-family="JetBrains Mono, monospace" font-size="16" fill="#5a6757" letter-spacing="2">${escapeXml(eyebrow.toUpperCase())}</text>` : ""}
  ${tierBadge}
  ${titleLines.map((line, i) => `<text x="80" y="${titleStartY + i * lineHeight}" font-family="Newsreader, serif" font-size="60" font-weight="500" fill="#0d1410">${escapeXml(line)}</text>`).join("\n  ")}
  ${byline ? `<text x="80" y="${titleStartY + titleLines.length * lineHeight + 36}" font-family="JetBrains Mono, monospace" font-size="22" fill="#5a6757">${escapeXml(byline)}</text>` : ""}
  ${footer ? `<text x="80" y="${H - 60}" font-family="JetBrains Mono, monospace" font-size="16" fill="#7a8474" letter-spacing="1">${escapeXml(footer)}</text>` : ""}
  <text x="${W - 80}" y="${H - 60}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="14" fill="#7a8474">codex.iamkesava.com</text>
</svg>`;
}

async function writeImage(relPath, svg){
  const out = join(DOCS, relPath);
  await mkdir(join(out, ".."), { recursive: true });
  await writeFile(out, svg);
}

async function main(){
  const INDEX = JSON.parse(await readFile(join(LIB, "INDEX.json"), "utf8"));
  let count = 0;

  // Hidden insights/operators don't get OG images since the underlying
  // pages aren't generated. Counts in the default OG match the visible
  // surface.
  const visibleInsightsForOg = INDEX.insights.filter(i => !i.hidden);
  const visibleOperatorsForOg = INDEX.operators.filter(o => !o.hidden);

  // Default OG (home, lists, fallback)
  const defaultSvg = ogSvg({
    kind: "default",
    eyebrow: "operator insight library",
    title: "Atomic claims. Named operators. Verifiable sources.",
    byline: `${visibleInsightsForOg.length} insights · ${visibleOperatorsForOg.length} operators`,
    footer: "browse the codex",
  });
  await writeImage("og.svg", defaultSvg);
  count++;

  // Insights
  for (const i of visibleInsightsForOg){
    const svg = ogSvg({
      kind: "insight",
      eyebrow: (i.domain || []).slice(0, 3).join(" · "),
      title: i.title || i.id,
      byline: i.operator || "",
      tier: i.tier,
      footer: i.source_date || "",
    });
    await writeImage(`og/ins/${i.id}.svg`, svg);
    count++;
  }
  // Operators
  for (const o of visibleOperatorsForOg){
    const role = (o.roles || [])[0] || "";
    const svg = ogSvg({
      kind: "operator",
      eyebrow: "operator",
      title: o.name || o.slug,
      byline: role,
      footer: (o.domains_active || []).slice(0, 4).join(" · "),
    });
    await writeImage(`og/o/${o.slug}.svg`, svg);
    count++;
  }
  // Patterns
  for (const p of (INDEX.patterns || [])){
    const svg = ogSvg({
      kind: "pattern",
      eyebrow: `synthesis pattern · ${(p.domains || []).slice(0, 2).join(" · ")}`,
      title: p.title || p.id,
      byline: `${(p.uses_cards || []).length} operators converge`,
      tier: p.tier,
      footer: p.captured_date || "",
    });
    await writeImage(`og/pat/${p.id}.svg`, svg);
    count++;
  }
  // Playbooks
  for (const p of (INDEX.playbooks || [])){
    if (!p.id) continue;
    const svg = ogSvg({
      kind: "playbook",
      eyebrow: "methodology playbook",
      title: p.title || p.id,
      byline: `${(p.uses_cards || []).length} insights · ${(p.originating_operators || []).length} operators`,
      footer: (p.domain || []).slice(0, 3).join(" · "),
    });
    await writeImage(`og/play/${p.id}.svg`, svg);
    count++;
  }
  // Domains
  const domSet = new Set();
  for (const i of INDEX.insights){ for (const d of (i.domain || [])) domSet.add(d); }
  for (const dom of [...domSet].sort()){
    const cardsInDom = INDEX.insights.filter(i => (i.domain || []).includes(dom));
    const opsInDom = new Set(cardsInDom.map(c => c.operator).filter(Boolean));
    const svg = ogSvg({
      kind: "domain",
      eyebrow: "domain",
      title: dom,
      byline: `${cardsInDom.length} insights · ${opsInDom.size} operators`,
      footer: `${cardsInDom.filter(c => c.tier === "A").length} tier-A claims`,
    });
    await writeImage(`og/d/${dom}.svg`, svg);
    count++;
  }

  console.log(`build-og: emitted ${count} OG images under docs/og/`);
}

main().catch(e => { console.error(e); process.exit(1); });
