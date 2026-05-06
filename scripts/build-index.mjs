#!/usr/bin/env node
// build-index.mjs — Generate INDEX.md and INDEX.json from insight card frontmatter.
// Walks insights/ + operators/ + raw/ + synthesis/{patterns,contradictions} + playbooks/
// and emits a machine-readable index for the UI agent.

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "insight-library");

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.isFile() && e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end < 0) return null;
  const fm = text.slice(4, end);
  const obj = {};
  let lastKey = null;
  let nestedKey = null; // when a top-level key has a nested mapping (indented `key: value` lines)
  for (const line of fm.split("\n")) {
    if (line.trim() === "") continue;
    // Top-level: `key: value`
    const top = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (top) {
      const [, k, vRaw] = top;
      lastKey = k;
      nestedKey = null;
      const v = vRaw.trim();
      if (v === "") {
        // Could be nested map OR nested list — defer; default to empty object,
        // resolved when we see indented lines on the next iteration
        obj[k] = {};
        nestedKey = k;
        continue;
      }
      if (v.startsWith("[") && v.endsWith("]")) {
        obj[k] = v.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      } else if (v.startsWith("{")) {
        obj[k] = v;
      } else {
        // Strip wrapping quotes — YAML treats quoted and unquoted scalars as the same value
        obj[k] = v.replace(/^["'](.*)["']$/, "$1");
      }
      continue;
    }
    // Indented list item: `  - value`
    if (line.startsWith("  - ") && lastKey) {
      const item = line.slice(4).trim().replace(/^["'](.*)["']$/, "$1");
      if (!Array.isArray(obj[lastKey])) obj[lastKey] = [];
      obj[lastKey].push(item);
      // If lastKey was previously assigned an empty object (from "key:"), upgrade to array
      if (nestedKey === lastKey && Array.isArray(obj[lastKey]) === false) {
        obj[lastKey] = [item];
      }
      continue;
    }
    // Indented nested map: `  subkey: value`
    const nested = line.match(/^\s{2,}([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (nested && nestedKey){
      const [, sk, svRaw] = nested;
      const sv = svRaw.trim();
      // Promote to object map if currently empty / wrong type
      if (typeof obj[nestedKey] !== "object" || Array.isArray(obj[nestedKey])){
        obj[nestedKey] = {};
      }
      obj[nestedKey][sk] = sv;
      continue;
    }
  }
  // Clean: empty objects revert to "" so INDEX.json doesn't get a bunch of `{}`
  for (const k of Object.keys(obj)){
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k]) && Object.keys(obj[k]).length === 0){
      obj[k] = "";
    }
  }
  const bodyStart = end + 4;
  return { fm: obj, body: text.slice(bodyStart).trimStart() };
}

function firstHeading(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

async function main() {
  const insightFiles = await walk(join(ROOT, "insights"));
  const operatorFiles = (await walk(join(ROOT, "operators"))).filter(f => f.endsWith("README.md"));
  const rawFiles = await walk(join(ROOT, "raw"));
  const patternFiles = await walk(join(ROOT, "synthesis", "patterns"));
  const contradictionFiles = await walk(join(ROOT, "synthesis", "contradictions"));
  const playbookFiles = (await walk(join(ROOT, "playbooks"))).filter(f => !f.endsWith("README.md"));
  const dailyFiles = (await walk(join(ROOT, "daily"))).filter(f => /\d{4}-\d{2}-\d{2}\.md$/.test(f));

  const insights = [];
  for (const f of insightFiles) {
    const text = await readFile(f, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) continue;
    insights.push({
      path: relative(ROOT, f),
      title: firstHeading(parsed.body) ?? parsed.fm.id,
      ...parsed.fm,
    });
  }

  const operators = [];
  for (const f of operatorFiles) {
    const text = await readFile(f, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) continue;
    operators.push({
      path: relative(ROOT, f),
      title: firstHeading(parsed.body) ?? parsed.fm.name,
      ...parsed.fm,
    });
  }

  const raw = [];
  for (const f of rawFiles) {
    if (f.endsWith("README.md")) continue;
    const text = await readFile(f, "utf8");
    const parsed = parseFrontmatter(text);
    raw.push({
      path: relative(ROOT, f),
      ...(parsed?.fm ?? {}),
    });
  }

  const patterns = [];
  for (const f of patternFiles) {
    if (f.endsWith("README.md")) continue;
    const text = await readFile(f, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) continue;
    patterns.push({
      path: relative(ROOT, f),
      title: firstHeading(parsed.body) ?? parsed.fm.title ?? parsed.fm.id,
      ...parsed.fm,
    });
  }

  const contradictions = [];
  for (const f of contradictionFiles) {
    if (f.endsWith("README.md")) continue;
    const text = await readFile(f, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) continue;
    contradictions.push({
      path: relative(ROOT, f),
      title: firstHeading(parsed.body) ?? parsed.fm.title ?? parsed.fm.id,
      ...parsed.fm,
    });
  }

  const playbooks = [];
  for (const f of playbookFiles) {
    const text = await readFile(f, "utf8");
    const parsed = parseFrontmatter(text);
    playbooks.push({
      path: relative(ROOT, f),
      title: firstHeading(parsed?.body ?? text) ?? f,
      ...(parsed?.fm ?? {}),
    });
  }

  const daily = [];
  for (const f of dailyFiles) {
    const text = await readFile(f, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) continue;
    daily.push({
      path: relative(ROOT, f),
      ...parsed.fm,
    });
  }
  // newest date first
  daily.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const latest_daily = daily[0] ?? null;

  const json = {
    generated_at: new Date().toISOString(),
    counts: {
      insights: insights.length,
      operators: operators.length,
      raw_sources: raw.length,
      patterns: patterns.length,
      contradictions: contradictions.length,
      playbooks: playbooks.length,
      daily: daily.length,
    },
    latest_daily,
    insights,
    operators,
    raw_sources: raw,
    patterns,
    contradictions,
    playbooks,
    daily,
  };

  await writeFile(join(ROOT, "INDEX.json"), JSON.stringify(json, null, 2));

  // Markdown index
  const lines = [];
  lines.push("# Codex Index");
  lines.push("");
  lines.push(`_Generated ${new Date().toISOString().slice(0, 10)}. Auto-built from frontmatter — do not edit by hand._`);
  lines.push("");
  lines.push(`## Counts`);
  lines.push(`- ${insights.length} insight cards`);
  lines.push(`- ${operators.length} operator profiles`);
  lines.push(`- ${raw.length} raw source files`);
  lines.push(`- ${patterns.length} synthesis patterns`);
  lines.push(`- ${contradictions.length} contradictions`);
  lines.push(`- ${playbooks.length} playbooks`);
  lines.push("");

  // Insights by tier
  const byTier = { A: [], B: [], C: [] };
  for (const i of insights) (byTier[i.tier] ?? []).push(i);
  lines.push("## Insights by tier");
  for (const t of ["A", "B", "C"]) {
    if (byTier[t].length === 0) continue;
    lines.push("");
    lines.push(`### Tier ${t} (${byTier[t].length})`);
    for (const i of byTier[t].sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))) {
      lines.push(`- [\`${i.id}\`](${i.path}) — ${i.title} _(${i.operator})_`);
    }
  }
  lines.push("");

  // Operators
  lines.push("## Operators");
  for (const o of operators.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))) {
    lines.push(`- [${o.name}](${o.path})`);
  }
  lines.push("");

  // Raw sources by type
  lines.push("## Raw sources by type");
  const byType = {};
  for (const r of raw) {
    const t = r.source_type || "unknown";
    (byType[t] ??= []).push(r);
  }
  for (const t of Object.keys(byType).sort()) {
    lines.push(`- **${t}**: ${byType[t].length}`);
  }
  lines.push("");

  // Synthesis patterns
  if (patterns.length > 0) {
    lines.push("## Synthesis patterns");
    for (const p of patterns.sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))) {
      const tier = p.tier ? ` [Tier ${p.tier}]` : "";
      const conv = p.convergence_count ? ` (${p.convergence_count} ops)` : "";
      lines.push(`- [\`${p.id ?? p.title}\`](${p.path}) — ${p.title}${conv}${tier}`);
    }
    lines.push("");
  }

  // Contradictions
  if (contradictions.length > 0) {
    lines.push("## Contradictions");
    for (const c of contradictions.sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))) {
      lines.push(`- [\`${c.id ?? c.title}\`](${c.path}) — ${c.title}`);
    }
    lines.push("");
  }

  // Playbooks
  if (playbooks.length > 0) {
    lines.push("## Playbooks");
    for (const p of playbooks.sort((a, b) => (a.path).localeCompare(b.path))) {
      lines.push(`- [${p.title}](${p.path})`);
    }
    lines.push("");
  }

  await writeFile(join(ROOT, "INDEX.md"), lines.join("\n"));

  // README hello-bar + counts splice
  const REPO_ROOT = join(ROOT, "..");
  const readmePath = join(REPO_ROOT, "README.md");
  let readme = await readFile(readmePath, "utf8").catch(() => "");
  if (readme) {
    const countsBlock = [
      `- **${insights.length}** insight cards`,
      `- **${operators.length}** operator profiles`,
      `- **${patterns.length}** synthesis patterns (cross-operator convergences)`,
      `- **${contradictions.length}** documented contradictions`,
      `- **${playbooks.length}** methodology playbooks`,
      `- **${raw.length}** archived raw sources (podcasts, essays, threads, research)`,
    ].join("\n");
    readme = spliceMarkers(readme, "COUNTS", countsBlock);

    if (latest_daily) {
      const ld = latest_daily;
      const insightsAdded = (ld.insights_added ?? []).length;
      const operatorsAdded = (ld.operators_added ?? []).length;
      const patternsAdded = (ld.patterns_added ?? []).length;
      const playbooksAdded = (ld.playbooks_added ?? []).length;
      const bits = [];
      if (insightsAdded) bits.push(`${insightsAdded} insight${insightsAdded === 1 ? "" : "s"}`);
      if (operatorsAdded) bits.push(`${operatorsAdded} operator${operatorsAdded === 1 ? "" : "s"}`);
      if (patternsAdded) bits.push(`${patternsAdded} pattern${patternsAdded === 1 ? "" : "s"}`);
      if (playbooksAdded) bits.push(`${playbooksAdded} playbook${playbooksAdded === 1 ? "" : "s"}`);
      const counted = bits.length ? bits.join(" · ") : "no new entries";
      const latestPath = ld.path; // e.g. "daily/2026-05-06.md"
      const latestBlock = [
        `### Latest — ${ld.date} · ${counted}`,
        ``,
        `**${ld.title ?? "What's new"}** — ${ld.summary ?? ""}`,
        ``,
        `[Read what landed →](insight-library/${latestPath}) · [See on the site →](https://k3sava.github.io/ab-codex/#/today)`,
      ].join("\n");
      readme = spliceMarkers(readme, "LATEST", latestBlock);
    }
    // Replace stale prose counts in the browse table — e.g. "All 272 profiles".
    // The COUNTS block stays the canonical source; this just keeps the prose
    // honest so a casual reader doesn't see numbers off by hundreds.
    readme = readme.replace(/All\s+\d{2,4}\s+profiles/, `All ${operators.length} profiles`);
    await writeFile(readmePath, readme);
  }

  // emit latest.json at insight-library root for cheap fetch from the SPA
  await writeFile(
    join(ROOT, "latest.json"),
    JSON.stringify({ generated_at: new Date().toISOString(), latest_daily, recent_daily: daily.slice(0, 30) }, null, 2)
  );

  console.log(`Built INDEX.md and INDEX.json — ${insights.length} insights, ${operators.length} operators, ${raw.length} raw, ${patterns.length} patterns, ${contradictions.length} contradictions, ${playbooks.length} playbooks, ${daily.length} daily.`);
}

// Replace content between <!-- KEY:START --> and <!-- KEY:END --> markers (inclusive).
function spliceMarkers(text, key, body) {
  const start = `<!-- ${key}:START -->`;
  const end = `<!-- ${key}:END -->`;
  const re = new RegExp(`${start}[\\s\\S]*?${end}`, "m");
  const replacement = `${start}\n${body}\n${end}`;
  if (re.test(text)) return text.replace(re, replacement);
  return text; // markers absent — leave file alone
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
