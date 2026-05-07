# ab-codex ingest prompt

You are extracting operator-attributed insights from a miniu morning brief
into the ab-codex schema. The brief is rich human-readable prose about
what miniu found in the world and what it did. Your job: identify the
atomic, operator-attributed claims in it, fit them to the schema, write a
release log for the day, and draft a LinkedIn post Kesava can post.

## Schema (insight card)

Each new insight is a markdown file at `insight-library/insights/ins_<slug>.md`.

```yaml
---
id: ins_<kebab-case-slug>
operator: Full Name           # primary author
operator_role: One short line  # role at time of source
co_operators: []              # additional named authors (list of names)
source_url: https://…         # MUST be real or "unknown"
source_type: essay|thread|post|podcast|talk|book|research|recap
source_title: ""              # the operator's own title for the source
source_date: YYYY-MM-DD       # when the operator published
captured_date: YYYY-MM-DD     # today
domain: [pmm, growth-demand, …]   # taxonomy domains, lowercase, kebab-case
lifecycle: [growth-loops, …]   # lifecycle tags
maturity: foundational|applied|frontier
artifact_class: framework|playbook|template|workflow|metric-model|case-study|excerpt
score: { originality: 1-5, specificity: 1-5, evidence: 1-5, transferability: 1-5, source: 1-5 }
tier: A|B|C    # default B for new ingests
related: []
raw_ref: ""    # path to a source file in raw/ if applicable, else empty
---

# <plain-English claim, one line, NO em dashes>

## Claim
<one-sentence claim, no em dashes outside operator verbatim>

## Mechanism
<why it works, the underlying causal model>

## Conditions
Holds when: <conditions for it to apply>
Fails when: <conditions where it breaks>

## Evidence
<paraphrase + the operator quote in a `> verbatim` blockquote where possible>

## Signals
- <observable signs it's working in your own work>
- <…>

## Counter-evidence
<where it fails, who disagrees>

## Cross-references
- (none in current corpus)
```

## Voice rules (HARD)

- Zero em dashes outside `> verbatim` operator quotes. Use periods, commas, or middots.
- Kill-list words banned: orchestration, seamless, strategic, leverage, transform, holistic, synergy, bespoke, unlock, robust, comprehensive, cutting-edge, innovative, paradigm, dive, delve, embark, journey.
- No throat-clearing openers ("It's worth noting", "Furthermore").
- Plain English over jargon.
- Operator verbatim quotes are immutable. Use them in `> blockquote` form. Never paraphrase as if quoted. Never compose composite quotes.

## Anti-fabrication (overrides everything)

- If you can't find a real source URL in the digest for a given operator's claim, set `source_url: unknown`. Never invent URLs.
- Never invent dates, metrics, or identifiers. If unclear, say "unverified" or omit.
- Slugify operator names with `name.toLowerCase().replace(/[^a-z0-9]+/g, "-")`.

## Operator profile (only for NEW operators)

If an operator from the digest is not already in the existing operator slug list,
create a new profile at `insight-library/operators/<slug>/README.md`:

```yaml
---
name: Full Name
slug: <kebab-case>
roles:
  - <role + organization, one line each>
domains_active: [pmm, growth-demand, …]
captured_first: YYYY-MM-DD
external:
  linkedin: https://www.linkedin.com/in/<handle>     # only if the digest gives one — never guess
  twitter: https://twitter.com/<handle>              # only if given
  newsletter: <url if given>
---

<Full Name>. <One-paragraph bio in operator voice. Starts with the operator's
full name as the first word for drop-cap visual coherence. Pulls role +
context from the digest. No em dashes. No kill-list words.>

## Operating themes
- **<Theme 1 in bold>** <one-line elaboration>
- **<Theme 2>** <…>
```

## Daily release log (REQUIRED STRUCTURE)

Write `insight-library/daily/YYYY-MM-DD.md` body in this exact shape, mirroring
the 2026-05-06 style:

```markdown
# What landed today, YYYY-MM-DD

<One opening paragraph: count of new cards, patterns, operators (e.g. "Seven
new cards, one updated synthesis pattern. Three themes that connected from
independent angles this week:"). Then a one-line preview of each theme.>

## Theme 1, <theme phrase as plain English headline>

<Two paragraphs synthesizing the theme. Reference each contributing insight
inline using its id wrapped in code-fences: `ins_<slug>`. Reference operators
by full name. Reference the convergence to any pattern using its id:
`pat_<slug>`. Use the operator's verbatim quote as `> blockquote` where
relevant.>

- <Operator Name>, `ins_<slug>`. <One-sentence summary of their contribution
  to the theme.>
- <Operator Name>, `ins_<slug>`. <…>

## Theme 2, <theme phrase>

<Same structure: synthesis paragraphs + bulleted operator-card list.>

## Theme 3, <theme phrase>

<Same structure if there's a third theme; otherwise omit.>
```

Use 1-3 themed H2 sections depending on how the day's insights cluster. Every
new insight MUST be referenced inline by its `ins_<slug>` id at least once.
Every operator named MUST appear with their card-id linked. The bulleted
operator-list at the end of each theme is required so the rendered SPA
shows the explicit links.

The frontmatter goes above (keep using the previous shape with
`insights_added` etc).

## LinkedIn post

A 50-100 word LinkedIn post in Kesava's personal voice (talking-to-a-friend
register, NOT formal operator voice). Short sentences. One specific claim.
Optional question to invite engagement. No em dashes. No kill-list words.
No hashtags unless they read naturally. Single paragraph or two short ones.

## Synthesis patterns

A miniu morning brief OFTEN opens with an explicit cross-operator convergence
("Four operators published the same theme this week without coordinating…").
That is exactly a synthesis pattern. Two cases:

1. **Existing pattern extended.** If the convergence references operators
   already in the corpus AND a pattern with that theme already exists in the
   provided pattern list, output a `pattern_updates` entry: pattern id +
   the new card-ids to add to its `uses_cards`, plus a one-line note.
2. **New pattern.** If the convergence is novel, output a `new_patterns`
   entry with full body markdown matching the existing pattern shape:

```markdown
---
id: pat_<slug>
title: <Title in plain English. NO em dashes.>
captured_date: YYYY-MM-DD
convergence_count: <integer ≥ 3>
tier: A | B
uses_cards: [ins_<id-1>, ins_<id-2>, …]
domains: [domain-1, domain-2, …]
---

# <Title>

## Convergence
<2-3 sentences naming the convergence: who said what from where, why it
matters that they converged independently.>

## Operators
- <Name>, `ins_<id>`. <One-sentence contribution to the theme.>
- <Name>, `ins_<id>`. <…>

## Variation
- <Operator>: <how their angle differs.>
- <…>
- Convergence: <the shared claim that survives the variations.>

## Implication
<2-4 sentences on what this means for someone trying to apply it. End with
a concrete diagnostic or test.>

## Sources
- ins_<id>, <Operator> (<source-title>, YYYY-MM-DD)
- <…>
```

A new pattern requires at least 3 distinct operators converging independently.
Don't manufacture patterns from a single operator's claim or two operators
saying similar things.

## Output format (strict)

Return ONLY valid JSON with this exact shape. No prose before or after.

```json
{
  "date": "YYYY-MM-DD",
  "release": {
    "title": "...",
    "summary": "...",
    "body_markdown": "..."
  },
  "pattern_updates": [
    { "id": "pat_<slug>", "add_cards": ["ins_<id>"], "note": "fourth operator added: <name>" }
  ],
  "new_patterns": [
    {
      "id": "pat_<slug>",
      "frontmatter": { "title": "...", "captured_date": "YYYY-MM-DD", "convergence_count": 3, "tier": "A", "uses_cards": ["ins_..."], "domains": ["..."] },
      "body_markdown": "# Title\n\n## Convergence\n..."
    }
  ],
  "insights": [
    {
      "id": "ins_<slug>",
      "frontmatter": {
        "operator": "...",
        "operator_role": "...",
        "co_operators": [],
        "source_url": "...",
        "source_type": "...",
        "source_title": "...",
        "source_date": "YYYY-MM-DD",
        "captured_date": "YYYY-MM-DD",
        "domain": ["..."],
        "lifecycle": ["..."],
        "maturity": "applied",
        "artifact_class": "framework",
        "score": { "originality": 3, "specificity": 3, "evidence": 3, "transferability": 3, "source": 3 },
        "tier": "B",
        "related": [],
        "raw_ref": ""
      },
      "claim_h1": "...",
      "body_markdown": "## Claim\n...\n## Mechanism\n..."
    }
  ],
  "operators": [
    {
      "slug": "...",
      "frontmatter": {
        "name": "...",
        "roles": ["..."],
        "domains_active": ["..."],
        "captured_first": "YYYY-MM-DD",
        "external": {}
      },
      "body_markdown": "<Name>. ...\n\n## Operating themes\n- ..."
    }
  ],
  "linkedin_post": "..."
}
```

## What to extract, what to skip

**Extract** as insight cards: any operator-attributed claim that has a
mechanism (why it works) and a real source. Even short or partial claims —
the codex prefers atomic, attributable insights over comprehensive
treatments. Default tier: B.

**Skip**: miniu's own action items, the "What I improved about myself"
section, the "For your call" decision queue, and the "Skipped" section.
These are miniu's internal substrate, not operator wisdom.

**Skip duplicates**: if a claim from the digest is already in the existing
INDEX (match by similarity of claim text + same operator), do NOT add it
again. The existing INDEX list is provided.

**Skip Kesava**: if the digest mentions Kesava's own decisions or work,
that's not operator wisdom for the public library. Skip.

**HARD RULE — strip JustCall, flywheel, commons, miniu, kami, clearPMM,
artemis, and any other internal-project references**: ab-codex is an
independent public library of operator insights. The digest mentions
Kesava's clients, internal systems, projects, deliverables, and
people-by-name (Sourav, Reshma, Aditi, Deepan, Sourav, Sourav Mukherjee,
Krishna, Sulagna, Vidhi, Varsha, etc). Insights extracted into ab-codex
must NOT mention any of these by name.

When an operator's claim is wrapped in internal-context framing
("the JustCall version of this would be…", "Sourav owns this decision"),
extract ONLY the operator's underlying claim and discard the framing.
The insight card must be readable by a stranger with no knowledge of
JustCall, miniu, or any of Kesava's work. If a claim cannot be cleanly
separated from the internal framing, skip it.

## Final reminder

Do NOT use any tools. Do NOT call Read/Write/Edit/Bash/etc. Do NOT ask
questions. Do NOT add prose before or after. Output ONLY the JSON object
described above, starting with `{` and ending with `}`. The script
calling you handles the file writes.
