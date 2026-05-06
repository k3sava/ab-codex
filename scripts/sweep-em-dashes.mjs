#!/usr/bin/env node
// sweep-em-dashes.mjs — strip em dashes (and en dashes used as em-dashes) from
// insight bodies, pattern bodies, contradiction bodies, and playbook bodies.
//
// Preserves three things absolutely:
//   1. YAML frontmatter (between first --- and second ---).
//   2. Code blocks (lines inside ``` fences).
//   3. Blockquote lines (lines starting with `>`). These are operator verbatim.
//
// Substitution rules outside protected zones:
//   `^— `           → `· `       (citation marker, often "— Author, Source")
//   ` — `           → `, `       (parenthetical em dash with spaces)
//   `([^\s])— `     → `$1, `     (em dash with right space only)
//   ` —([^\s])`     → `, $1`     (em dash with left space only)
//   `—`             → `, `       (catch-all)
//   ` – ` etc       → ` , `      (en dash used as em dash)
//
// Run with `--dry` to preview; without to write changes. Reports per-file diff.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "insight-library");
const DRY = process.argv.includes("--dry");

async function walk(dir, out = []){
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries){
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.isFile() && e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

function splitFrontmatter(text){
  if (!text.startsWith("---\n")) return { fm: "", body: text };
  const end = text.indexOf("\n---", 4);
  if (end < 0) return { fm: "", body: text };
  const fmEnd = end + 4;
  return { fm: text.slice(0, fmEnd), body: text.slice(fmEnd) };
}

function sweepLine(line){
  // "^— " (citation marker) → "· "
  line = line.replace(/^—\s+/, "· ");
  // " — " → ", "
  line = line.replace(/\s+—\s+/g, ", ");
  // word— text and text —word
  line = line.replace(/(\S)—\s+/g, "$1, ");
  line = line.replace(/\s+—(\S)/g, ", $1");
  // catch-all em dash → comma
  line = line.replace(/—/g, ", ");
  // En dash used as em dash. Don't touch numeric ranges like 2020–2026.
  line = line.replace(/(\D)\s+–\s+(\D)/g, "$1, $2");
  line = line.replace(/(\D)–\s+/g, "$1, ");
  line = line.replace(/\s+–(\D)/g, ", $1");
  // Smart quotes that some editors auto-insert leak in too. Keep curly quotes
  // for operator verbatim (those are in blockquotes, untouched). Outside, the
  // codex uses straight quotes. Convert curly to straight here.
  line = line.replace(/[‘’]/g, "'");
  line = line.replace(/[“”]/g, '"');
  // Collapse double spaces created by substitutions.
  line = line.replace(/  +/g, " ");
  // Trim trailing comma+space from line ends ("…,  " → "…")
  line = line.replace(/,\s*$/, "");
  return line;
}

function sweepBody(body){
  const lines = body.split("\n");
  const out = [];
  let inFence = false;
  for (const line of lines){
    const fence = /^```/.test(line);
    if (fence){ inFence = !inFence; out.push(line); continue; }
    if (inFence){ out.push(line); continue; }
    if (/^>\s?/.test(line)){ out.push(line); continue; } // operator verbatim
    out.push(sweepLine(line));
  }
  return out.join("\n");
}

async function main(){
  const targets = [];
  targets.push(...(await walk(join(ROOT, "insights"))));
  targets.push(...(await walk(join(ROOT, "synthesis"))));
  targets.push(...(await walk(join(ROOT, "playbooks"))));
  targets.push(...(await walk(join(ROOT, "daily"))));
  targets.push(...(await walk(join(ROOT, "operators"))));

  let changed = 0;
  let total = 0;
  let exampleShown = 0;
  for (const f of targets){
    total++;
    const text = await readFile(f, "utf8");
    const { fm, body } = splitFrontmatter(text);
    const newBody = sweepBody(body);
    if (newBody === body) continue;
    changed++;
    if (DRY && exampleShown < 3){
      const oldFirst = body.split("\n").slice(0, 6).join("\n");
      const newFirst = newBody.split("\n").slice(0, 6).join("\n");
      console.log("---", relative(process.cwd(), f), "---");
      console.log("BEFORE:\n" + oldFirst.slice(0, 300));
      console.log("AFTER:\n" + newFirst.slice(0, 300));
      console.log("");
      exampleShown++;
    }
    if (!DRY){
      await writeFile(f, fm + newBody);
    }
  }
  console.log(`${DRY ? "[dry] " : ""}${changed}/${total} files changed.`);
}

main().catch(e => { console.error(e); process.exit(1); });
