#!/usr/bin/env node
// build-index.mjs — Generate INDEX.md and INDEX.json from insight card frontmatter.
// Walks insights/ + operators/ + raw/ and emits a machine-readable index for the UI agent.

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
  for (const line of fm.split("\n")) {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (m) {
      const [, k, vRaw] = m;
      lastKey = k;
      const v = vRaw.trim();
      if (v === "" || v === "{") {
        obj[k] = v === "{" ? "{...}" : "";
        continue;
      }
      if (v.startsWith("[") && v.endsWith("]")) {
        obj[k] = v.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean);
      } else if (v.startsWith("{")) {
        obj[k] = v;
      } else {
        obj[k] = v;
      }
    } else if (line.startsWith("  - ") && lastKey) {
      if (!Array.isArray(obj[lastKey])) obj[lastKey] = [];
      obj[lastKey].push(line.slice(4).trim());
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

  const json = {
    generated_at: new Date().toISOString(),
    counts: {
      insights: insights.length,
      operators: operators.length,
      raw_sources: raw.length,
    },
    insights,
    operators,
    raw_sources: raw,
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

  await writeFile(join(ROOT, "INDEX.md"), lines.join("\n"));

  console.log(`Built INDEX.md and INDEX.json — ${insights.length} insights, ${operators.length} operators, ${raw.length} raw.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
