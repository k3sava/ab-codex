#!/usr/bin/env node
// voice-lint.mjs — scan the corpus for banned words and em/en dashes in
// non-operator prose. Operator verbatim quotes inside `> ...` blocks and
// fenced code blocks are immutable and skipped. Anything else gets flagged.
//
// Run before commit. CI gates main.
//
// Banned-word list lives in CLAUDE.md. Exact match (case-insensitive) on
// whole-word boundaries. Add domain-specific allowlist entries here, not in
// the corpus. Insight IDs ("ins_*") and pattern IDs are matched as identifiers
// and skipped automatically — the kill-list is for prose, not slugs.

import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LIB = join(ROOT, "insight-library");

const BANNED = [
  "orchestration", "orchestrate", "orchestrating",
  "seamless", "seamlessly",
  "strategic", "strategically",
  "leverage", "leveraging", "leverages",
  "transform", "transforming", "transforms",
  "holistic", "holistically",
  "synergy", "synergistic",
  "bespoke",
  "unlock", "unlocking", "unlocks",
  "robust",
  "comprehensive",
  "cutting-edge",
  "innovative", "innovation",
  "paradigm",
  "delve", "delving", "delves",
  "embark", "embarking", "embarks",
  "journey",
];

// Patterns that legitimately contain a banned root word as part of a slug or
// identifier. Treat the whole token as exempt so we don't flag IDs like
// "pat_pricing-as-the-most-leveraged-org-failure" or insight IDs.
const ALLOWLIST_TOKENS = [
  /\bins_[a-z0-9-]+/g,
  /\bpat_[a-z0-9-]+/g,
  /\bpb_[a-z0-9-]+/g,
  /\bcon_[a-z0-9-]+/g,
  /`[^`]+`/g,
  // URLs
  /https?:\/\/\S+/g,
];

function stripAllowlisted(line){
  let s = line;
  for (const re of ALLOWLIST_TOKENS) s = s.replace(re, "");
  return s;
}

const bannedRe = new RegExp(`\\b(${BANNED.map(w => w.replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&")).join("|")})\\b`, "i");

async function* walkMd(dir){
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return; }
  for (const e of entries){
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walkMd(full);
    else if (e.isFile() && e.name.endsWith(".md")) yield full;
  }
}

function detectViolations(content){
  const lines = content.split("\n");
  const violations = [];
  let inFence = false;
  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i++){
    const line = lines[i];
    const trimmed = line.trim();
    // frontmatter delimiters
    if (i === 0 && trimmed === "---") { inFrontmatter = true; continue; }
    if (inFrontmatter && trimmed === "---") { inFrontmatter = false; continue; }
    // skip frontmatter entirely (titles aren't user-prose surface; H1 in body is)
    if (inFrontmatter) continue;
    // code fences
    if (/^```/.test(trimmed)) { inFence = !inFence; continue; }
    if (inFence) continue;
    // operator verbatim quotes (markdown blockquote): immutable
    if (/^>\s?/.test(line)) continue;
    // skip insight-card "Sources" or "Cross-references" list bullets that are
    // pure ID references — they often include slugs and "as" clauses.
    const scrubbed = stripAllowlisted(line);
    // em dash / en dash check (excludes math/range usage near digits)
    // Allow numeric ranges: 8-11, 40-60% etc. via the digit-boundary check.
    if (/[—–]/.test(scrubbed)){
      // Reject only if not bordered by digits on at least one side (rough proxy
      // for "in numeric range"). The voice rule is no em-dash outside operator
      // quotes; en dashes in numeric ranges are tolerated.
      const dashes = [...scrubbed.matchAll(/[—–]/g)];
      for (const m of dashes){
        const idx = m.index;
        const before = scrubbed.slice(Math.max(0, idx - 1), idx);
        const after = scrubbed.slice(idx + 1, idx + 2);
        const isNumericRange = /\d/.test(before) && /\d/.test(after) && m[0] === "–";
        if (!isNumericRange){
          violations.push({ line: i + 1, kind: "dash", token: m[0], context: line.trim().slice(0, 140) });
          break; // one per line is enough to flag
        }
      }
    }
    // banned-word check
    const bm = scrubbed.match(bannedRe);
    if (bm){
      violations.push({ line: i + 1, kind: "word", token: bm[1].toLowerCase(), context: line.trim().slice(0, 140) });
    }
  }
  return violations;
}

async function main(){
  const targets = ["insights", "synthesis", "playbooks", "operators", "daily"];
  let total = 0;
  const fileHits = [];
  for (const t of targets){
    for await (const f of walkMd(join(LIB, t))){
      const text = await readFile(f, "utf8");
      const v = detectViolations(text);
      if (v.length){
        total += v.length;
        fileHits.push({ file: f.replace(ROOT + "/", ""), violations: v });
      }
    }
  }
  // Also the README and CLAUDE.md
  for (const top of ["README.md", "CLAUDE.md"]){
    try {
      const text = await readFile(join(ROOT, top), "utf8");
      const v = detectViolations(text);
      if (v.length){
        total += v.length;
        fileHits.push({ file: top, violations: v });
      }
    } catch {}
  }
  // Sort by violations desc.
  fileHits.sort((a,b) => b.violations.length - a.violations.length);
  if (!total){
    console.log("voice-lint: clean (no banned words, no em/en dashes in non-quote prose).");
    return;
  }
  console.log(`voice-lint: ${total} violation(s) across ${fileHits.length} file(s).\n`);
  for (const h of fileHits.slice(0, 50)){
    console.log(`${h.file} · ${h.violations.length} hit${h.violations.length === 1 ? "" : "s"}`);
    for (const v of h.violations.slice(0, 8)){
      console.log(`  L${v.line} ${v.kind === "dash" ? "dash" : "word"}:${v.token}  · ${v.context}`);
    }
    if (h.violations.length > 8) console.log(`  …${h.violations.length - 8} more`);
  }
  if (fileHits.length > 50) console.log(`\n…${fileHits.length - 50} more files`);
  // Exit non-zero only when STRICT=1. Pre-existing corpus drift would block
  // every commit. STRICT mode is for CI on changed files; local sweep is
  // informational by default.
  if (process.env.STRICT === "1") process.exit(1);
}

main().catch(e => { console.error(e); process.exit(2); });
