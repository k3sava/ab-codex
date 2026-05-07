#!/usr/bin/env node
// ingest-from-miniu.mjs — pull miniu's morning brief into ab-codex.
//
// Pipeline:
//   1. Read ~/r2d2/miniu/data/ai-digest/YYYY-MM-DD.md (target date, default today)
//   2. Read ab-codex INDEX.json + operator slug list (for dedup)
//   3. Call Claude API with the digest + the ingest prompt; receive JSON
//   4. Validate JSON; write insight + operator + daily files
//   5. Run scripts/build-all.sh
//   6. git add + commit + push
//   7. Email LinkedIn draft via AgentMail to hello@iamkesava.com
//   8. Log to data/logs/ingest.log
//
// Idempotency: if insight-library/daily/YYYY-MM-DD.md exists, skip unless --force.
// Lockfile: data/ingest.lock prevents concurrent runs.
//
// Usage:
//   node scripts/ingest-from-miniu.mjs              # ingest today
//   node scripts/ingest-from-miniu.mjs 2026-05-07   # ingest specific date
//   node scripts/ingest-from-miniu.mjs --dry        # extract + write files, no commit/push/email
//   node scripts/ingest-from-miniu.mjs --force      # bypass idempotency

import { readFile, writeFile, mkdir, stat, unlink, appendFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const HOME = homedir();
const MINIU_DIGEST_DIR = join(HOME, "r2d2", "miniu", "data", "ai-digest");
const PROMPT_PATH = join(ROOT, "scripts", "ingest-prompt.md");
const LIB = join(ROOT, "insight-library");
const LOG_DIR = join(ROOT, "data", "logs");
const LOG_FILE = join(LOG_DIR, "ingest.log");
const LOCK_FILE = join(ROOT, "data", "ingest.lock");

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_MAX_TOKENS = 16000;

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY = args.includes("--dry");
const dateArg = args.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
const TARGET_DATE = dateArg || new Date().toISOString().slice(0, 10);

async function log(msg){
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  await mkdir(LOG_DIR, { recursive: true }).catch(() => {});
  await appendFile(LOG_FILE, line).catch(() => {});
  console.log(`[ingest] ${msg}`);
}

async function loadEnv(){
  // Read miniu's .env for ANTHROPIC_API_KEY + AGENTMAIL_API_KEY since that's
  // where the keys live. No need to duplicate them in ab-codex.
  const envPath = join(HOME, "r2d2", "miniu", ".env");
  try {
    const text = await readFile(envPath, "utf8");
    for (const line of text.split("\n")){
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      const [, k, v] = m;
      if (!process.env[k]){
        process.env[k] = v.replace(/^["']|["']$/g, "");
      }
    }
  } catch (e) { await log(`warn: could not read ${envPath}: ${e.message}`); }
}

async function acquireLock(){
  try {
    const s = await stat(LOCK_FILE);
    const ageMs = Date.now() - s.mtimeMs;
    if (ageMs < 30 * 60 * 1000){
      throw new Error(`lock held (age ${Math.round(ageMs/1000)}s) at ${LOCK_FILE} — refusing to run`);
    }
    await log(`stale lock (age ${Math.round(ageMs/1000)}s), reclaiming`);
    await unlink(LOCK_FILE).catch(() => {});
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  await mkdir(dirname(LOCK_FILE), { recursive: true });
  await writeFile(LOCK_FILE, String(process.pid));
}
async function releaseLock(){ await unlink(LOCK_FILE).catch(() => {}); }

async function callClaude(prompt, userMessage){
  // Use the `claude` CLI in non-interactive print mode. Authenticates via the
  // user's existing Claude Code subscription (OAuth) — no ANTHROPIC_API_KEY
  // needed, no per-call billing on top of the subscription.
  // Don't pass --bare — that disables OAuth and demands ANTHROPIC_API_KEY.
  // Standard mode uses the existing Claude Code subscription.
  // Disallow all tools so Claude returns the JSON directly instead of trying
  // to write files itself (those writes are this script's job). The "--"
  // separator terminates the variadic --disallowed-tools list.
  const args = [
    "-p",
    "--output-format", "json",
    "--model", "sonnet",
    "--disallowed-tools",
      "Bash", "Read", "Edit", "Write", "Glob", "Grep", "NotebookEdit",
      "WebFetch", "WebSearch", "TaskCreate", "TaskUpdate", "TaskList", "TaskGet", "TaskOutput", "TaskStop",
      "Skill", "Agent", "ExitPlanMode", "ScheduleWakeup",
    "--append-system-prompt", prompt,
    "--",
    userMessage,
  ];
  const r = spawnSync("claude", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0){
    throw new Error(`claude CLI exited ${r.status}: ${(r.stderr || "").slice(0, 500)}`);
  }
  let envelope;
  try { envelope = JSON.parse(r.stdout); }
  catch (e){ throw new Error(`claude CLI returned non-JSON envelope: ${(r.stdout || "").slice(0, 500)}`); }
  const text = envelope.result || envelope.response || envelope.content?.[0]?.text || "";
  if (!text) throw new Error(`claude CLI returned empty result. Envelope keys: ${Object.keys(envelope).join(", ")}`);
  const cleaned = text.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e){
    throw new Error(`Claude returned invalid JSON: ${e.message}\nFirst 1000 chars:\n${cleaned.slice(0, 1000)}`);
  }
}

function yamlValue(v){
  if (Array.isArray(v)){
    if (v.length === 0) return "[]";
    if (v.every(x => typeof x === "string" && /^[a-z0-9_-]+$/.test(x))) return `[${v.join(", ")}]`;
    return `[${v.map(x => JSON.stringify(x)).join(", ")}]`;
  }
  if (typeof v === "object" && v !== null){
    const inner = Object.entries(v).map(([k, val]) => `${k}: ${yamlValue(val)}`).join(", ");
    return `{ ${inner} }`;
  }
  if (typeof v === "string"){
    if (v.includes(":") || v.includes("#") || v.includes('"') || v.includes("\n")) return JSON.stringify(v);
    return v;
  }
  return String(v);
}
function frontmatterBlock(fm){
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)){
    lines.push(`${k}: ${yamlValue(v)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

async function loadIndex(){
  const indexPath = join(LIB, "INDEX.json");
  try {
    const data = JSON.parse(await readFile(indexPath, "utf8"));
    const insights = data.insights || [];
    return {
      insightIds: new Set(insights.map(i => i.id)),
      insightTitles: insights.map(i => ({ id: i.id, title: (i.title || "").toLowerCase(), operator: (i.operator || "").toLowerCase() })),
      // Insights carrying today's captured_date — release log should reference
      // ALL of them, not just what's new in this --force re-run.
      todaysCapturedIds: (date) => insights.filter(i => i.captured_date === date).map(i => i.id),
      operatorSlugs: new Set((data.operators || []).map(o => o.slug)),
      patterns: (data.patterns || []).map(p => ({ id: p.id, title: p.title, uses_cards: p.uses_cards || [], domains: p.domains || [] })),
      counts: data.counts || {},
    };
  } catch {
    return { insightIds: new Set(), insightTitles: [], todaysCapturedIds: () => [], operatorSlugs: new Set(), patterns: [], counts: {} };
  }
}

async function emailLinkedinDraft(date, post, releaseTitle){
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey){ await log("warn: AGENTMAIL_API_KEY not set, skipping email"); return; }
  const subject = `[ab-codex] LinkedIn draft — ${date}`;
  const body = `Today's release shipped: ${releaseTitle}\n\nLinkedIn draft (50-100 words, in your voice):\n\n---\n\n${post}\n\n---\n\nLive at https://codex.iamkesava.com/today/${date}/\n\nReply with edits or post when ready.`;
  const res = await fetch("https://api.agentmail.to/v0/inboxes/miniu@agentmail.to/messages/send", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to: ["hello@iamkesava.com"], subject, text: body }),
  });
  if (!res.ok){
    const text = await res.text();
    await log(`warn: agentmail send failed ${res.status}: ${text.slice(0, 300)}`);
  } else {
    await log(`emailed LinkedIn draft to hello@iamkesava.com`);
  }
}

function sh(cmd, args, opts = {}){
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} exited ${r.status}`);
}

async function main(){
  await loadEnv();
  await log(`begin ingest for ${TARGET_DATE} (force=${FORCE} dry=${DRY})`);

  const dailyPath = join(LIB, "daily", `${TARGET_DATE}.md`);
  if (!FORCE){
    try {
      await stat(dailyPath);
      await log(`already ingested (${dailyPath} exists). pass --force to re-run.`);
      return;
    } catch { /* not yet ingested, proceed */ }
  }

  const digestPath = join(MINIU_DIGEST_DIR, `${TARGET_DATE}.md`);
  let digestText;
  try {
    digestText = await readFile(digestPath, "utf8");
  } catch (e){
    throw new Error(`miniu digest not found at ${digestPath}: ${e.message}`);
  }
  if (digestText.length < 500) throw new Error(`digest too small (${digestText.length}B), refusing`);
  await log(`loaded digest ${digestPath} (${digestText.length}B)`);

  await acquireLock();
  try {
    const prompt = await readFile(PROMPT_PATH, "utf8");
    const idx = await loadIndex();
    await log(`existing corpus: ${idx.insightIds.size} insights, ${idx.operatorSlugs.size} operators`);

    const todaysExisting = idx.todaysCapturedIds(TARGET_DATE);
    const userMessage = [
      `# Target date\n${TARGET_DATE}\n`,
      todaysExisting.length ? `# Insights already captured for ${TARGET_DATE} (must reference in release log)\n${todaysExisting.join(", ")}\n` : "",
      `# Existing operator slugs (do not duplicate)\n${[...idx.operatorSlugs].sort().join(", ")}\n`,
      `# Existing insight ids (do not duplicate)\n${[...idx.insightIds].sort().join(", ")}\n`,
      `# Existing insight titles (for fuzzy dedup against the digest claims)\n${idx.insightTitles.slice(0, 200).map(i => `- ${i.id}: ${i.title} [${i.operator}]`).join("\n")}\n`,
      `# Existing synthesis patterns (consider extending these vs creating new)\n${idx.patterns.map(p => `- ${p.id}: ${p.title} [uses: ${p.uses_cards.join(", ")}]`).join("\n")}\n`,
      `# Today's miniu morning brief\n\n${digestText}`,
    ].filter(Boolean).join("\n");

    await log(`calling Claude (model=${ANTHROPIC_MODEL}, prompt+user=${prompt.length + userMessage.length} chars)`);
    const result = await callClaude(prompt, userMessage);
    await log(`Claude returned ${(result.insights || []).length} insights, ${(result.operators || []).length} operators`);

    if (!result.release || !result.linkedin_post){
      throw new Error("missing release or linkedin_post in Claude response");
    }
    if (!Array.isArray(result.insights) || result.insights.length === 0){
      await log("no new insights extracted, writing release log only");
    }

    // Write insights
    let insightsWritten = 0;
    const validInsightIds = [];
    for (const ins of (result.insights || [])){
      if (!ins.id || !ins.frontmatter || !ins.body_markdown) continue;
      if (idx.insightIds.has(ins.id)) { await log(`skip dup insight ${ins.id}`); continue; }
      const fm = ins.frontmatter;
      // Inject id explicitly
      const fullFm = { id: ins.id, ...fm };
      const path = join(LIB, "insights", `${ins.id}.md`);
      const text = `${frontmatterBlock(fullFm)}\n\n# ${ins.claim_h1}\n\n${ins.body_markdown.trim()}\n`;
      await writeFile(path, text);
      validInsightIds.push(ins.id);
      insightsWritten++;
    }
    await log(`wrote ${insightsWritten} insight files`);

    // Write operators
    let opsWritten = 0;
    const validOpSlugs = [];
    for (const op of (result.operators || [])){
      if (!op.slug || !op.frontmatter || !op.body_markdown) continue;
      if (idx.operatorSlugs.has(op.slug)) { await log(`skip dup operator ${op.slug}`); continue; }
      const fm = { slug: op.slug, ...op.frontmatter };
      const path = join(LIB, "operators", op.slug, "README.md");
      await mkdir(dirname(path), { recursive: true });
      const text = `${frontmatterBlock(fm)}\n\n${op.body_markdown.trim()}\n`;
      await writeFile(path, text);
      validOpSlugs.push(op.slug);
      opsWritten++;
    }
    await log(`wrote ${opsWritten} operator profiles`);

    // Apply pattern updates (extend uses_cards on existing patterns)
    let patternsUpdated = 0;
    for (const upd of (result.pattern_updates || [])){
      if (!upd.id || !Array.isArray(upd.add_cards) || upd.add_cards.length === 0) continue;
      // Find the pattern file by id. We don't store path directly but it's
      // derivable from the id (drop "pat_" prefix → filename) under
      // synthesis/patterns/, with a fallback to scanning if the slug differs.
      const slug = upd.id.replace(/^pat_/, "");
      const candidates = [
        join(LIB, "synthesis", "patterns", `${slug}.md`),
        join(LIB, "synthesis", "patterns", `${upd.id}.md`),
      ];
      let patPath = null;
      for (const p of candidates){
        try { await stat(p); patPath = p; break; } catch {}
      }
      if (!patPath){ await log(`warn: pattern file not found for ${upd.id}, skipping update`); continue; }
      const text = await readFile(patPath, "utf8");
      // Extend uses_cards in frontmatter; bump convergence_count if implied; set last_updated.
      const fmEnd = text.indexOf("\n---", 4);
      if (fmEnd < 0) { await log(`warn: ${upd.id} has no frontmatter, skipping`); continue; }
      let fm = text.slice(4, fmEnd);
      const body = text.slice(fmEnd + 4);
      const usesM = fm.match(/^uses_cards:\s*\[([^\]]*)\]/m);
      if (!usesM) { await log(`warn: ${upd.id} has no uses_cards field, skipping`); continue; }
      const existing = usesM[1].split(",").map(s => s.trim()).filter(Boolean);
      const additions = upd.add_cards.filter(id => !existing.includes(id));
      if (additions.length === 0) { await log(`pattern ${upd.id}: nothing new to add`); continue; }
      const merged = [...existing, ...additions];
      fm = fm.replace(/^uses_cards:\s*\[[^\]]*\]/m, `uses_cards: [${merged.join(", ")}]`);
      // last_updated
      if (/^last_updated:/m.test(fm)){
        fm = fm.replace(/^last_updated:.*$/m, `last_updated: ${TARGET_DATE}`);
      } else {
        fm = fm.replace(/^captured_date:.*$/m, m => `${m}\nlast_updated: ${TARGET_DATE}`);
      }
      // convergence_count
      fm = fm.replace(/^convergence_count:\s*\d+/m, `convergence_count: ${merged.length}`);
      const updated = `---\n${fm}\n---${body}`;
      await writeFile(patPath, updated);
      patternsUpdated++;
      await log(`extended ${upd.id} (+${additions.length}: ${additions.join(", ")})`);
    }
    await log(`pattern updates: ${patternsUpdated}`);

    // Write new patterns
    let patternsCreated = 0;
    const newPatternIds = [];
    for (const np of (result.new_patterns || [])){
      if (!np.id || !np.frontmatter || !np.body_markdown) continue;
      const slug = np.id.replace(/^pat_/, "");
      const path = join(LIB, "synthesis", "patterns", `${slug}.md`);
      try { await stat(path); await log(`pattern ${np.id} already exists, skipping`); continue; } catch {}
      const fullFm = { id: np.id, ...np.frontmatter };
      const text = `${frontmatterBlock(fullFm)}\n\n${np.body_markdown.trim()}\n`;
      await writeFile(path, text);
      newPatternIds.push(np.id);
      patternsCreated++;
    }
    await log(`wrote ${patternsCreated} new pattern files`);

    // Write daily release log. The frontmatter list of insights_added covers
    // the full day (everything captured today), not just this run's new files.
    const releaseFm = {
      date: TARGET_DATE,
      title: JSON.stringify(result.release.title),
      summary: result.release.summary,
      sources: [`morning research scan ${TARGET_DATE}`],
      insights_added: validInsightIds,
      operators_added: validOpSlugs,
      patterns_added: [],
      playbooks_added: [],
    };
    const fullDayInsightIds = [...new Set([...idx.todaysCapturedIds(TARGET_DATE), ...validInsightIds])];
    // Custom YAML for release: arrays vertical, summary/sources as quoted strings
    const releaseYaml = [
      "---",
      `date: ${TARGET_DATE}`,
      `title: ${JSON.stringify(result.release.title)}`,
      `summary: ${result.release.summary.includes(":") || result.release.summary.includes('"') ? JSON.stringify(result.release.summary) : result.release.summary}`,
      `sources:`,
      `  - "morning research scan ${TARGET_DATE}"`,
      `insights_added:`,
      ...fullDayInsightIds.map(id => `  - ${id}`),
      `operators_added:`,
      ...validOpSlugs.map(s => `  - ${s}`),
      ...(newPatternIds.length ? [`patterns_added:`, ...newPatternIds.map(id => `  - ${id}`)] : ["patterns_added: []"]),
      `playbooks_added: []`,
      "---",
    ].join("\n");
    const releaseText = `${releaseYaml}\n\n# ${result.release.title}\n\n${result.release.body_markdown.trim()}\n`;
    await writeFile(dailyPath, releaseText);
    await log(`wrote daily release log ${dailyPath}`);

    if (DRY){
      await log(`dry mode — skipping build, commit, push, email`);
      console.log(`\nLinkedIn draft:\n---\n${result.linkedin_post}\n---\n`);
      return;
    }

    // Build
    await log(`running scripts/build-all.sh`);
    sh("bash", ["scripts/build-all.sh"]);

    // Commit + push
    await log(`git add + commit + push`);
    sh("git", ["add", "-A"]);
    const msg = `ingest ${TARGET_DATE}: +${insightsWritten} insights, +${opsWritten} operators

${result.release.title}

${result.release.summary}

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`;
    sh("git", ["commit", "-m", msg]);
    sh("git", ["push", "origin", "main"]);

    // Email LinkedIn draft
    await emailLinkedinDraft(TARGET_DATE, result.linkedin_post, result.release.title);

    await log(`complete: ${TARGET_DATE} +${insightsWritten} insights, +${opsWritten} operators`);
  } finally {
    await releaseLock();
  }
}

main().catch(async e => {
  await log(`error: ${e.message}\n${e.stack || ""}`);
  await releaseLock();
  process.exit(1);
});
