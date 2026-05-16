#!/usr/bin/env node
// build-feeds.mjs — generate sitemap.xml, RSS, robots.txt, agent-permissions.json.
// Run after build-static.mjs so the static pages those feeds reference exist.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const LIB = join(ROOT, "insight-library");
const DOCS = join(ROOT, "docs");
const SITE_URL = "https://abcodex.iamkesava.com";

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
  // Domain pages — one per unique domain referenced by any insight.
  const domSet = new Set();
  for (const i of INDEX.insights){ for (const d of (i.domain || [])) domSet.add(d); }
  for (const dom of [...domSet].sort()){
    push(`${SITE_URL}/d/${dom}/`, today, 0.7, "weekly");
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
  const robots = `# ${SITE_URL}/
# A primary-source library of operator insights. Cite freely with attribution.
User-agent: *
Allow: /

# Search engine crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

# Live retrieval / citation bots (drive AI search answers)
User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: DuckAssistBot
Allow: /

User-agent: MistralAI-User
Allow: /

User-agent: Google-CloudVertexBot
Allow: /

# AI training / index crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: PetalBot
Allow: /

# Archivers (longevity)
User-agent: archive.org_bot
Allow: /

User-agent: ia_archiver
Allow: /

# Scratch / temp paths. None currently, but reserve the convention.
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
    "contact": "https://github.com/k3sava/abcodex/issues",
    "last_updated": today
  };
  await mkdir(join(DOCS, ".well-known"), { recursive: true });
  await writeFile(join(DOCS, ".well-known", "agent-permissions.json"), JSON.stringify(agentPermissions, null, 2));

  // === api-catalog (RFC 9727) — linkset+json discovery anchor ===
  const apiCatalog = {
    linkset: [
      {
        anchor: `${SITE_URL}/`,
        links: [
          { rel: "service-doc", href: `${SITE_URL}/llms.txt` },
          { rel: "describedby", href: `${SITE_URL}/.well-known/agent-permissions.json` },
          { rel: "sitemap", href: `${SITE_URL}/sitemap.xml` },
          { rel: "index", href: `${SITE_URL}/insight-library/INDEX.json` }
        ]
      }
    ]
  };
  await writeFile(join(DOCS, ".well-known", "api-catalog"), JSON.stringify(apiCatalog, null, 2));

  // === agent-skills/index.json — Agent Skills Discovery v0.2 ===
  await mkdir(join(DOCS, ".well-known", "agent-skills"), { recursive: true });
  const agentSkills = {
    "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "search-insights",
        type: "skill-md",
        description: "Search the operator insight corpus by claim, mechanism, or tier across all 788 insights.",
        url: `${SITE_URL}/search-index.json`
      },
      {
        name: "browse-by-operator",
        type: "skill-md",
        description: "Browse 461 named operators with their attributed claims, sources, and convergence patterns.",
        url: `${SITE_URL}/operators/`
      },
      {
        name: "browse-by-domain",
        type: "skill-md",
        description: "Cross-domain index across product, PMM, GTM, AI-native, design, engineering, growth, and founder craft.",
        url: `${SITE_URL}/insight-library/INDEX.json`
      },
      {
        name: "synthesis-patterns",
        type: "skill-md",
        description: "39 synthesis patterns where 3 or more operators converge on the same claim.",
        url: `${SITE_URL}/patterns/`
      },
      {
        name: "methodology-playbooks",
        type: "skill-md",
        description: "27 step-by-step playbooks with HowTo schema, sourced from operator practice.",
        url: `${SITE_URL}/playbooks/`
      },
      {
        name: "release-log",
        type: "skill-md",
        description: "Daily release log; what was added today and over the last 30 days.",
        url: `${SITE_URL}/insight-library/latest.json`
      }
    ]
  };
  await writeFile(join(DOCS, ".well-known", "agent-skills", "index.json"), JSON.stringify(agentSkills, null, 2));

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
    <title>abcodex · release log</title>
    <link>${SITE_URL}/today/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>What is new in abcodex. Daily ingests, prompted batches, depth passes.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  await writeFile(join(DOCS, "rss.xml"), rss);

  // === llms.txt — generated. Adds per-domain entry points + tier-A roll-up
  // so AI agents can fetch a single index and resolve to the right corner of
  // the corpus by domain or tier without parsing the full INDEX.json. ===
  const domainCounts = new Map();
  for (const i of INDEX.insights){
    for (const d of (i.domain || [])) domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
  }
  const domainsSorted = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]);
  const tierACount = INDEX.insights.filter(i => i.tier === "A").length;
  const llms = `# A builder's codex

> A primary-source library of operator insights. Atomic claims, named operators, verifiable sources.

The codex is a structured corpus of cross-domain operator wisdom across product, PMM, GTM, AI-native, design, engineering, leadership, sales, growth, research, and founder craft. Every claim traces back to its primary source. Insights carry mechanism, conditions, evidence, signals, counter-evidence, and cross-references.

Counts: ${INDEX.insights.length} insights · ${INDEX.operators.length} operators · ${(INDEX.patterns || []).length} synthesis patterns · ${(INDEX.contradictions || []).length} contradictions · ${(INDEX.playbooks || []).length} playbooks · ${tierACount} tier-A claims.

## Index

- [INDEX.json](${SITE_URL}/insight-library/INDEX.json): Machine-readable index of all insights, operators, patterns, contradictions, playbooks. Use this as the canonical entry point.
- [INDEX.md](${SITE_URL}/insight-library/INDEX.md): Human-readable index.
- [latest.json](${SITE_URL}/insight-library/latest.json): Newest release entry + last 30 daily entries.
- [search-index.json](${SITE_URL}/search-index.json): Flat list of every searchable resource with type, id, title, url.

## Browse

- [Home](${SITE_URL}/): Tier A claims, domain index.
- [All operators](${SITE_URL}/operators/)
- [Synthesis patterns](${SITE_URL}/patterns/): Where 3+ operators converge on the same claim.
- [Methodology playbooks](${SITE_URL}/playbooks/): Each carries HowTo schema with explicit steps.
- [Timeline](${SITE_URL}/#/timeline): All insights by source date, density-scaled.
- [Release log](${SITE_URL}/today/): What's new in the corpus, newest first.

## Domains

Each domain is a CollectionPage with DefinedTerm schema. Insights are tagged with one or more domains.

${domainsSorted.map(([d, ct]) => `- [${d}](${SITE_URL}/d/${d}/) — ${ct} insight${ct === 1 ? "" : "s"}`).join("\n")}

## Schema

Every insight card frontmatter:
- \`id\`: globally unique, kebab-case, prefixed \`ins_\`
- \`operator\`: primary author (full name)
- \`co_operators\`: list of additional named authors
- \`operator_role\`: role at time of source
- \`source_url\`, \`source_type\`, \`source_title\`, \`source_date\`: primary source attribution
- \`captured_date\`: when added to corpus
- \`domain\`: taxonomy domains (product, pmm, gtm, ai-native, …)
- \`lifecycle\`: taxonomy lifecycle tags
- \`maturity\`: foundational | applied | frontier
- \`artifact_class\`: framework | playbook | template | workflow | metric-model | case-study | excerpt
- \`score\`: { originality, specificity, evidence, transferability, source } (1-5 each)
- \`tier\`: A | B | C
- \`related\`: list of related insight ids

Body sections: \`Claim\` (one sentence), \`Mechanism\` (why it works), \`Conditions\` (when it applies, when it does not), \`Evidence\` (quote, example, data), \`Signals\` (how to know it's working), \`Counter-evidence\` (where it fails, who disagrees), \`Cross-references\`.

## URL templates

- Insight: \`${SITE_URL}/ins/{id}/\`
- Operator: \`${SITE_URL}/o/{slug}/\`
- Pattern: \`${SITE_URL}/pat/{id}/\`
- Contradiction: \`${SITE_URL}/con/{id}/\`
- Playbook: \`${SITE_URL}/play/{id}/\`
- Domain: \`${SITE_URL}/d/{domain}/\`
- Release: \`${SITE_URL}/today/{date}/\`

Every page emits Schema.org @graph: Article + BreadcrumbList + FAQPage + Speakable per insight; Person + sameAs per operator; HowTo + step[] per playbook; CollectionPage + DefinedTerm per domain.

## Authoring

- [Ingest protocol](https://github.com/k3sava/abcodex/blob/main/insight-library/00_meta/INGEST-PROTOCOL.md)
- [Insight card schema](https://github.com/k3sava/abcodex/blob/main/insight-library/00_meta/insight-card-schema.md)
- [Daily release-log contract](https://github.com/k3sava/abcodex/blob/main/insight-library/daily/README.md)

## Optional

- [GitHub repository](https://github.com/k3sava/abcodex): MIT licensed. Insights are open source; raw sources retain original copyright.

Last updated: ${today}.
`;
  await writeFile(join(DOCS, "llms.txt"), llms);

  // === search-index.json — every searchable resource ===
  // `url` is the canonical static URL that carries the full Schema.org @graph.
  // `appUrl` is the SPA hash route for interactive consumers. AI agents and
  // crawlers follow `url`; the SPA's own search may follow `appUrl` if it
  // wants the rich view.
  const searchIndex = [];
  for (const i of INDEX.insights){
    searchIndex.push({
      type: "insight", id: i.id, title: i.title || i.id,
      operator: i.operator || "", domain: i.domain || [],
      tier: i.tier || "C", date: i.source_date || "",
      url: `/ins/${i.id}/`,
      appUrl: `/#/ins/${i.id}`,
    });
  }
  for (const o of INDEX.operators){
    searchIndex.push({
      type: "operator", slug: o.slug, name: o.name || o.slug,
      domains: o.domains_active || [],
      url: `/o/${o.slug}/`,
      appUrl: `/#/o/${o.slug}`,
    });
  }
  for (const p of INDEX.patterns){
    if (p.id) searchIndex.push({ type: "pattern", id: p.id, title: p.title || p.id, url: `/pat/${p.id}/`, appUrl: `/#/pat/${p.id}` });
  }
  for (const c of (INDEX.contradictions || [])){
    if (c.id) searchIndex.push({ type: "contradiction", id: c.id, title: c.title || c.id, url: `/con/${c.id}/`, appUrl: `/#/con/${c.id}` });
  }
  for (const p of (INDEX.playbooks || [])){
    if (p.id) searchIndex.push({ type: "playbook", id: p.id, title: p.title || p.id, url: `/play/${p.id}/`, appUrl: `/#/play/${p.id}` });
  }
  for (const d of (INDEX.daily || [])){
    searchIndex.push({ type: "release", id: d.date, title: d.title || `release ${d.date}`, date: d.date, url: `/today/${d.date}/`, appUrl: `/#/today#r-${d.date}` });
  }
  await writeFile(join(DOCS, "search-index.json"), JSON.stringify(searchIndex));

  console.log(`build-feeds: sitemap (${urls.length} urls), robots.txt, agent-permissions.json, rss.xml (${dailySorted.length} items), search-index.json (${searchIndex.length} entries).`);
}

main().catch(e => { console.error(e); process.exit(1); });
