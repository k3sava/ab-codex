#!/usr/bin/env node
// build-feeds.mjs — generate sitemap.xml, RSS, robots.txt, agent-permissions.json.
// Run after build-static.mjs so the static pages those feeds reference exist.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const LIB = join(ROOT, "insight-library");
const DOCS = join(ROOT, "docs");
const SITE_URL = "https://k3sava.github.io/ab-codex";

const escapeXml = s => (s || "").toString().replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));

async function main(){
  const INDEX = JSON.parse(await readFile(join(LIB, "INDEX.json"), "utf8"));
  const today = new Date().toISOString().slice(0, 10);

  // === sitemap.xml — every canonical URL the site exposes ===
  const urls = [];
  const push = (loc, lastmod, priority = 0.6, changefreq = "weekly") => {
    urls.push({ loc, lastmod: lastmod || today, priority, changefreq });
  };
  push(`${SITE_URL}/`, today, 1.0, "daily");
  push(`${SITE_URL}/operators/`, today, 0.8, "weekly");
  push(`${SITE_URL}/patterns/`, today, 0.8, "weekly");
  push(`${SITE_URL}/playbooks/`, today, 0.7, "weekly");
  push(`${SITE_URL}/today/`, today, 0.9, "daily");
  for (const i of INDEX.insights){
    push(`${SITE_URL}/ins/${i.id}/`, i.captured_date || i.source_date, 0.7, "monthly");
  }
  for (const o of INDEX.operators){
    push(`${SITE_URL}/o/${o.slug}/`, o.captured_first || today, 0.6, "monthly");
  }
  for (const p of INDEX.patterns){
    push(`${SITE_URL}/pat/${p.id}/`, p.captured_date || today, 0.7, "monthly");
  }
  for (const c of (INDEX.contradictions || [])){
    if (c.id) push(`${SITE_URL}/con/${c.id}/`, today, 0.6, "monthly");
  }
  for (const p of (INDEX.playbooks || [])){
    if (p.id) push(`${SITE_URL}/play/${p.id}/`, p.captured_date || today, 0.7, "monthly");
  }
  for (const d of (INDEX.daily || [])){
    push(`${SITE_URL}/today/${d.date}/`, d.date, 0.6, "monthly");
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`).join("\n")}
</urlset>
`;
  await writeFile(join(DOCS, "sitemap.xml"), sitemap);

  // === robots.txt ===
  const robots = `# https://k3sava.github.io/ab-codex/
# A primary-source library of operator insights. Cite freely with attribution.
User-agent: *
Allow: /

# AI-search agents — explicitly allowed (the corpus exists to be cited).
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Scratch / temp paths — none currently, but reserve the convention.
Disallow: /_dev/
Disallow: /tmp/

Sitemap: ${SITE_URL}/sitemap.xml

# Discoverable indexes for AI agents (Osmani's Layer 2):
# ${SITE_URL}/llms.txt
# ${SITE_URL}/.well-known/agent-permissions.json
# ${SITE_URL}/insight-library/INDEX.json
`;
  await writeFile(join(DOCS, "robots.txt"), robots);

  // === agent-permissions.json — Osmani's Layer 1 access-control declaration ===
  const agentPermissions = {
    "$schema": "https://addyosmani.com/agent-permissions/schema.json",
    "policy_version": "1.0",
    "site": SITE_URL,
    "license": "MIT",
    "attribution_required": true,
    "allowed_uses": [
      "read",
      "summarize",
      "cite",
      "answer-engine-indexing",
      "training-with-attribution",
      "embed-with-attribution"
    ],
    "disallowed_uses": [
      "republish-without-attribution",
      "synthetic-byline-attribution"
    ],
    "preferred_format": "markdown",
    "canonical_index": `${SITE_URL}/insight-library/INDEX.json`,
    "discovery": [
      `${SITE_URL}/llms.txt`,
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/insight-library/INDEX.json`,
      `${SITE_URL}/insight-library/latest.json`,
      `${SITE_URL}/rss.xml`
    ],
    "tldr_location": "main .static-tldr or first paragraph of body",
    "schema": {
      "insight_url_template": `${SITE_URL}/ins/{id}/`,
      "operator_url_template": `${SITE_URL}/o/{slug}/`,
      "pattern_url_template": `${SITE_URL}/pat/{id}/`,
      "playbook_url_template": `${SITE_URL}/play/{id}/`,
      "release_url_template": `${SITE_URL}/today/{date}/`
    },
    "contact": "https://github.com/k3sava/ab-codex/issues",
    "last_updated": today
  };
  await mkdir(join(DOCS, ".well-known"), { recursive: true });
  await writeFile(join(DOCS, ".well-known", "agent-permissions.json"), JSON.stringify(agentPermissions, null, 2));

  // === RSS — the release log ===
  const dailySorted = [...(INDEX.daily || [])].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 30);
  const items = dailySorted.map(d => `    <item>
      <title>${escapeXml(d.title || `release ${d.date}`)}</title>
      <link>${SITE_URL}/today/${d.date}/</link>
      <guid isPermaLink="true">${SITE_URL}/today/${d.date}/</guid>
      <pubDate>${new Date(d.date).toUTCString()}</pubDate>
      <description>${escapeXml(d.summary || "")}</description>
    </item>`).join("\n");
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>a builder's codex — release log</title>
    <link>${SITE_URL}/today/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>What's new in a builder's codex — daily ingests, prompted batches, depth passes.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  await writeFile(join(DOCS, "rss.xml"), rss);

  // === search-index.json — every searchable resource ===
  // Was a hand-written 3-entry stub. Now regenerated from INDEX.json so ⌘K
  // search covers the entire corpus.
  const searchIndex = [];
  for (const i of INDEX.insights){
    searchIndex.push({
      type: "insight", id: i.id, title: i.title || i.id,
      operator: i.operator || "", domain: i.domain || [],
      tier: i.tier || "C", date: i.source_date || "",
      url: `/#/ins/${i.id}`,
    });
  }
  for (const o of INDEX.operators){
    searchIndex.push({
      type: "operator", slug: o.slug, name: o.name || o.slug,
      domains: o.domains_active || [],
      url: `/#/o/${o.slug}`,
    });
  }
  for (const p of INDEX.patterns){
    if (p.id) searchIndex.push({ type: "pattern", id: p.id, title: p.title || p.id, url: `/#/pat/${p.id}` });
  }
  for (const c of (INDEX.contradictions || [])){
    if (c.id) searchIndex.push({ type: "contradiction", id: c.id, title: c.title || c.id, url: `/#/con/${c.id}` });
  }
  for (const p of (INDEX.playbooks || [])){
    if (p.id) searchIndex.push({ type: "playbook", id: p.id, title: p.title || p.id, url: `/#/play/${p.id}` });
  }
  for (const d of (INDEX.daily || [])){
    searchIndex.push({ type: "release", id: d.date, title: d.title || `release ${d.date}`, date: d.date, url: `/#/today#r-${d.date}` });
  }
  await writeFile(join(DOCS, "search-index.json"), JSON.stringify(searchIndex));

  console.log(`build-feeds: sitemap (${urls.length} urls), robots.txt, agent-permissions.json, rss.xml (${dailySorted.length} items), search-index.json (${searchIndex.length} entries).`);
}

main().catch(e => { console.error(e); process.exit(1); });
