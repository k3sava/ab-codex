#!/usr/bin/env node
// validate.mjs — strict schema + cross-reference validation for the corpus.
// Exits non-zero on any error so CI fails on broken state.
//
// Checks per insight card:
//   - required frontmatter fields present (id, operator, source_url, source_date, tier, domain)
//   - id is unique across the corpus
//   - id matches filename (ins_<slug>.md)
//   - related: refs all resolve to existing card ids
//   - source_url is syntactically valid (or "unknown")
//   - operator name is non-empty
//   - co_operators is an array of strings if present
//
// Checks per operator profile:
//   - frontmatter has name, slug
//   - slug matches directory name
//   - slug is unique
//
// Checks per pattern / contradiction / playbook:
//   - id present, unique within type
//   - uses_cards (patterns) all resolve
//
// Cross-corpus checks:
//   - every card.operator (and co_operators) has an operator profile
//     (warning, not error — we don't always have profiles for guests)
//   - every operator with cards has a profile (warning)
//   - daily entries reference insights/operators that exist (error)

import { readdir, readFile, stat } from "node:fs/promises";
import { join, basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "insight-library");
const errors = [];
const warnings = [];

function err(file, msg){ errors.push(`ERROR  ${relative(process.cwd(), file)}: ${msg}`); }
function warn(file, msg){ warnings.push(`WARN   ${relative(process.cwd(), file)}: ${msg}`); }

async function walk(dir){
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries){
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.isFile() && e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

function parseFrontmatter(text){
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end < 0) return null;
  const fm = text.slice(4, end);
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
        obj[k] = v.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      } else {
        obj[k] = v.replace(/^["'](.*)["']$/, "$1");
      }
      continue;
    }
    if (line.startsWith("  - ") && lastKey){
      const item = line.slice(4).trim().replace(/^["'](.*)["']$/, "$1");
      if (!Array.isArray(obj[lastKey])) obj[lastKey] = [];
      obj[lastKey].push(item);
    }
  }
  return obj;
}

function isValidUrl(s){
  if (!s) return true; // empty allowed; a separate check enforces presence
  if (s === "unknown") return true;
  try { new URL(s); return true; } catch { return false; }
}

const REQUIRED_INSIGHT_FIELDS = ["id", "operator", "source_url", "source_date", "tier", "domain"];

async function main(){
  // === insights ===
  const insightFiles = await walk(join(ROOT, "insights"));
  const insightById = new Map();
  for (const f of insightFiles){
    const text = await readFile(f, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm){ err(f, "missing or malformed frontmatter"); continue; }
    for (const k of REQUIRED_INSIGHT_FIELDS){
      if (!fm[k] || (Array.isArray(fm[k]) && fm[k].length === 0)){
        err(f, `missing required field: ${k}`);
      }
    }
    const fnId = "ins_" + basename(f).replace(/^ins_/, "").replace(/\.md$/, "");
    if (fm.id && fm.id !== fnId){
      err(f, `id "${fm.id}" doesn't match filename id "${fnId}"`);
    }
    if (fm.id){
      if (insightById.has(fm.id)){
        err(f, `duplicate id "${fm.id}" — also defined in ${insightById.get(fm.id)}`);
      } else {
        insightById.set(fm.id, f);
      }
    }
    if (fm.source_url && !isValidUrl(fm.source_url)){
      err(f, `source_url is not a valid URL or "unknown": "${fm.source_url}"`);
    }
    if (fm.tier && !["A","B","C"].includes(fm.tier)){
      err(f, `tier must be A, B, or C; got "${fm.tier}"`);
    }
    if (fm.co_operators && !Array.isArray(fm.co_operators)){
      err(f, `co_operators must be a list, got: ${typeof fm.co_operators}`);
    }
    // Detect compound operator strings — likely the author actually has co-authors
    // that should be in co_operators rather than smashed into the operator field.
    if (typeof fm.operator === "string" && /\s+(\+|&|with|and)\s+/i.test(fm.operator)){
      warn(f, `operator field looks compound: "${fm.operator}" — consider splitting into operator + co_operators`);
    }
    // store related for later resolution
    if (Array.isArray(fm.related)){
      for (const r of fm.related){
        // resolve at end after we have insightById complete
        // store on fm for later
      }
    }
  }
  // resolve related now
  for (const f of insightFiles){
    const text = await readFile(f, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm) continue;
    if (Array.isArray(fm.related)){
      for (const r of fm.related){
        if (!r || r === "(none in current corpus)" || r === "none yet") continue;
        if (!insightById.has(r)){
          warn(f, `related: "${r}" doesn't resolve to an existing card`);
        }
      }
    }
  }

  // === operators ===
  const opFiles = (await walk(join(ROOT, "operators"))).filter(f => f.endsWith("README.md"));
  const opBySlug = new Map();
  for (const f of opFiles){
    const text = await readFile(f, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm){ err(f, "missing or malformed frontmatter"); continue; }
    if (!fm.name) err(f, "operator missing name");
    if (!fm.slug) err(f, "operator missing slug");
    const dirSlug = basename(dirname(f));
    if (fm.slug && fm.slug !== dirSlug){
      err(f, `slug "${fm.slug}" doesn't match directory "${dirSlug}"`);
    }
    if (fm.slug){
      if (opBySlug.has(fm.slug)){
        err(f, `duplicate operator slug "${fm.slug}"`);
      } else {
        opBySlug.set(fm.slug, fm);
      }
    }
  }

  // === card → operator profile coverage ===
  const slugify = s => (s||"").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const operatorsReferencedByCards = new Set();
  for (const f of insightFiles){
    const text = await readFile(f, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm) continue;
    if (fm.operator) operatorsReferencedByCards.add(slugify(fm.operator));
    if (Array.isArray(fm.co_operators)){
      for (const co of fm.co_operators) operatorsReferencedByCards.add(slugify(co));
    }
  }
  for (const slug of operatorsReferencedByCards){
    if (!opBySlug.has(slug)){
      warn(`operators/${slug}/`, `referenced by ≥1 insight card but no operator profile exists`);
    }
  }

  // === patterns / contradictions / playbooks ===
  const pickFiles = async (dir) => (await walk(join(ROOT, dir))).filter(f => !f.endsWith("README.md"));
  const checkIds = async (files, type) => {
    const seen = new Map();
    for (const f of files){
      const text = await readFile(f, "utf8");
      const fm = parseFrontmatter(text);
      if (!fm) continue;
      if (!fm.id){ err(f, `${type} missing id`); continue; }
      if (seen.has(fm.id)){
        err(f, `duplicate ${type} id "${fm.id}" — also in ${seen.get(fm.id)}`);
      } else {
        seen.set(fm.id, f);
      }
      // patterns: uses_cards must resolve
      if (type === "pattern" && Array.isArray(fm.uses_cards)){
        for (const cid of fm.uses_cards){
          if (cid && !insightById.has(cid)){
            err(f, `uses_cards references missing insight "${cid}"`);
          }
        }
      }
    }
    return seen;
  };
  await checkIds(await pickFiles("synthesis/patterns"), "pattern");
  await checkIds(await pickFiles("synthesis/contradictions"), "contradiction");
  await checkIds(await pickFiles("playbooks"), "playbook");

  // === daily entries reference real cards / operators ===
  const dailyFiles = (await walk(join(ROOT, "daily"))).filter(f => /\d{4}-\d{2}-\d{2}\.md$/.test(f));
  for (const f of dailyFiles){
    const text = await readFile(f, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm) continue;
    for (const cid of (fm.insights_added || [])){
      if (cid && !insightById.has(cid)){
        err(f, `insights_added references missing card "${cid}"`);
      }
    }
    for (const slug of (fm.operators_added || [])){
      if (slug && !opBySlug.has(slug)){
        err(f, `operators_added references missing operator "${slug}"`);
      }
    }
  }

  // === report ===
  for (const w of warnings) console.log(w);
  for (const e of errors) console.log(e);
  console.log(`\n${insightFiles.length} insights · ${opFiles.length} operators · ${dailyFiles.length} daily entries`);
  console.log(`${warnings.length} warning(s) · ${errors.length} error(s)`);
  if (errors.length > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(2); });
