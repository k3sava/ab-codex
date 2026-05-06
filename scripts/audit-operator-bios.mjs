#!/usr/bin/env node
// audit-operator-bios.mjs — for every operator README.md, verify the body's
// first paragraph begins with the operator's name (so the drop-cap on the
// first letter visually reinforces who the bio is about).
//
// Modes:
//   --report   list operators whose bio doesn't start with their name
//   --fix      prepend "<Name> " to bios that don't (with care: only if the
//              bio doesn't already start with the operator's first name)

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "insight-library", "operators");
const FIX = process.argv.includes("--fix");

async function walk(dir, out = []){
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries){
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.isFile() && e.name === "README.md") out.push(p);
  }
  return out;
}

function parseFrontmatter(text){
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end < 0) return null;
  const fm = text.slice(4, end);
  const obj = {};
  for (const line of fm.split("\n")){
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    obj[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return { fm: obj, body: text.slice(end + 4) };
}

function firstSentence(body){
  // Skip any leading H1 (operator pages typically don't have one but be safe).
  const stripped = body.replace(/^#\s+[^\n]+\n+/, "").trimStart();
  // First non-blank, non-heading paragraph.
  const lines = stripped.split("\n");
  for (const line of lines){
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;
    return t;
  }
  return "";
}

async function main(){
  const files = await walk(ROOT);
  const offenders = [];
  for (const f of files){
    const text = await readFile(f, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) continue;
    const { name } = parsed.fm;
    if (!name) continue;
    const firstWord = name.split(/\s+/)[0];
    const sentence = firstSentence(parsed.body);
    if (!sentence) continue;
    // OK if bio starts with the operator's first name OR full name.
    const startsWithFirst = sentence.toLowerCase().startsWith(firstWord.toLowerCase());
    const startsWithFull = sentence.toLowerCase().startsWith(name.toLowerCase());
    if (startsWithFirst || startsWithFull) continue;
    offenders.push({ file: f, name, sentence: sentence.slice(0, 120) });
  }
  console.log(`\noperator-bio audit: ${offenders.length}/${files.length} bios don't start with the operator's name\n`);
  if (offenders.length === 0) return;

  if (FIX){
    let fixed = 0;
    for (const { file, name } of offenders){
      const text = await readFile(file, "utf8");
      const parsed = parseFrontmatter(text);
      if (!parsed) continue;
      // Walk lines, find the first prose paragraph (after H1, H2, blanks),
      // and prepend "<Name>. " to it. This keeps headings intact, so bios
      // that have `# Name` + `## Bio` retain that structure and only the
      // prose underneath starts with the operator's name.
      const fmEnd = text.indexOf("\n---", 4) + 4;
      const head = text.slice(0, fmEnd);
      const body = parsed.body;
      const lines = body.split("\n");
      let inserted = false;
      const out = [];
      for (let i = 0; i < lines.length; i++){
        const line = lines[i];
        if (!inserted){
          const t = line.trim();
          if (!t || t.startsWith("#")){ out.push(line); continue; }
          // Found the first prose line. Prepend the operator's name.
          out.push(`${name}. ${line}`);
          inserted = true;
          continue;
        }
        out.push(line);
      }
      if (!inserted){
        // Bio has only headings, no prose. Append a stub paragraph.
        out.push("");
        out.push(`${name}.`);
      }
      const newText = head + out.join("\n");
      await writeFile(file, newText);
      fixed++;
    }
    console.log(`fixed ${fixed} bios`);
  } else {
    for (const o of offenders.slice(0, 20)){
      console.log(`  ${relative(process.cwd(), o.file)}`);
      console.log(`    name: ${o.name}`);
      console.log(`    starts: "${o.sentence}"`);
    }
    if (offenders.length > 20) console.log(`  …and ${offenders.length - 20} more`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
