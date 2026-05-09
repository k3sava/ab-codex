# ab-codex Playbook Visuals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a unique, hand-crafted-quality visual identity for each of the 27 ab-codex playbooks — hero visuals (1200×630), in-body diagrams (900×500), and optional sidebars (480×720) — submitted via Claude Design and integrated into the playbook HTML pages.

**Architecture:** Each playbook gets its own visual strategy derived from its content type (not a template applied uniformly). Visuals are produced via Claude Design using carefully authored prompts that channel specific practitioner sensibilities. Ghost OS automation handles prompt submission so no copy-pasting is required. Every visual passes an AI-pattern checklist before it ships.

**Tech Stack:** Ghost OS (browser automation) · Claude Design (AI-assisted SVG generation) · Python (scripting) · ab-codex playbook HTML pages

**Spec:** `docs/superpowers/specs/2026-05-09-ab-codex-playbook-visuals-design.md`

---

## CRITICAL RULES (read before every task)

**Rule 1 — No two playbooks look the same.** Different treatment type, different composition, different practitioner blend. If two visuals feel interchangeable, reject both and start over.

**Rule 2 — The AI-pattern checklist.** Run this before accepting ANY visual:
- [ ] No perfect symmetry / perfectly equal spacing
- [ ] No gradient fills, no drop shadows
- [ ] No icon library icons (no Heroicons, Lucide, Font Awesome shapes)
- [ ] No thin-hairline flat-design icons
- [ ] No generic numbered circles with fill
- [ ] No nested boxes without structural reason
- [ ] No "SaaS blue + white" color palette
- [ ] Failure modes use `--danger` red (#991B1B), not orange, not grey
- [ ] The visual makes an *argument*, not just an illustration
- [ ] If it looks like it was made in Canva, reject it

**Rule 3 — Channel, don't copy.** Practitioner names describe a sensibility. Never reproduce a specific work. Ask: what would this practitioner notice about this content? What would they leave out?

---

## File structure

```
ab-codex/
  assets/
    visuals/
      aeo-relevance-engineering/
        hero.svg · hero.png · diagram-01.svg
      pseo-framework/
      claim-verify-gate/
      llm-wiki/
      synthetic-audience-test/
      competitive-analysis/
      win-loss-framework/
      copywriting-mastery/
      humanizer/
      landing-page-cro-rubric/
      converting-copy/
      writing-craft/
      mental-models-os/
      design-principles/
      design-thinking-for-content/
      help-documentation/
      icp-definition/
      campaign-strategy/
      launch-plan/
      measurement-framework/
      messaging-matrix/
      pmm-coaching-framework/
      narrative-compose/
      positioning/
      pricing-as-strategic-function/
      tactical-empathy-discovery/
      sales-enablement/
  scripts/
    submit-to-claude-design.py   ← Ghost OS automation
  docs/
    design/
      visual-strategy-map.md    ← per-playbook creative brief
    superpowers/
      specs/2026-05-09-ab-codex-playbook-visuals-design.md
      plans/2026-05-09-playbook-visuals.md (this file)
```

---

## Task 1: Scaffold directory structure

**Files:**
- Create: `assets/visuals/[27 slug dirs]/`
- Create: `scripts/submit-to-claude-design.py`

- [ ] **Step 1: Create all 27 visual directories**

```bash
cd /Users/k3sava/r2d2/ab-codex
mkdir -p assets/visuals/{aeo-relevance-engineering,pseo-framework,claim-verify-gate,llm-wiki,synthetic-audience-test,competitive-analysis,win-loss-framework,copywriting-mastery,humanizer,landing-page-cro-rubric,converting-copy,writing-craft,mental-models-os,design-principles,design-thinking-for-content,help-documentation,icp-definition,campaign-strategy,launch-plan,measurement-framework,messaging-matrix,pmm-coaching-framework,narrative-compose,positioning,pricing-as-strategic-function,tactical-empathy-discovery,sales-enablement}
```

- [ ] **Step 2: Verify 27 directories exist**

```bash
ls assets/visuals/ | wc -l
# Expected: 27
ls assets/visuals/
```

- [ ] **Step 3: Create placeholder README in each directory**

```bash
for d in assets/visuals/*/; do
  slug=$(basename "$d")
  echo "# $slug visuals\n\nHero: hero.svg (1200×630)\nDiagrams: diagram-01.svg, diagram-02.svg (900×500)\nSidebar: sidebar.svg if applicable (480×720)" > "$d/README.md"
done
```

- [ ] **Step 4: Commit scaffold**

```bash
git add assets/visuals/
git commit -m "chore: scaffold visual asset directories for 27 playbooks"
```

---

## Task 2: Build the Claude Design submission script

Ghost OS navigates claude.ai, opens Claude Design, types the prompt, submits, and saves the downloaded SVG to the right directory. No copy-pasting.

**Files:**
- Create: `scripts/submit-to-claude-design.py`

- [ ] **Step 1: Explore Claude Design's location in chrome**

Use Ghost OS to find Claude Design in the claude.ai interface:

```bash
python3 -c "
from mcp_ghost_os import ghost_context, ghost_find
# Navigate to claude.ai
print(ghost_context(app='Google Chrome'))
# Look for Design in nav
print(ghost_find(app='Google Chrome', query='Design', role='AXLink'))
"
```

If Claude Design is not at claude.ai, check `claude.ai/design` directly.

- [ ] **Step 2: Create the submission script**

```python
#!/usr/bin/env python3
# scripts/submit-to-claude-design.py
# Usage: python3 scripts/submit-to-claude-design.py <playbook-slug> <visual-type> <prompt-file>
# Example: python3 scripts/submit-to-claude-design.py positioning pipeline prompts/positioning-hero.txt

import sys
import time
import subprocess
import json
from pathlib import Path

PLAYBOOK_SLUG = sys.argv[1]
VISUAL_TYPE = sys.argv[2]      # hero | diagram-01 | diagram-02 | sidebar
PROMPT_FILE = sys.argv[3]

OUTPUT_DIR = Path(f"assets/visuals/{PLAYBOOK_SLUG}")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

with open(PROMPT_FILE) as f:
    prompt = f.read().strip()

def ghost(tool, **kwargs):
    """Call a Ghost OS MCP tool via subprocess."""
    payload = json.dumps({"tool": tool, "params": kwargs})
    result = subprocess.run(
        ["node", "-e", f"const g = require('/path/to/ghost-os-sdk'); g.call({payload}).then(r => console.log(JSON.stringify(r)));"],
        capture_output=True, text=True
    )
    return json.loads(result.stdout)

# Step 1: Open Claude Design
ghost("ghost_hotkey", app="Google Chrome", keys=["cmd", "t"])
time.sleep(0.5)
ghost("ghost_type", app="Google Chrome", text="https://claude.ai/design")
ghost("ghost_press", app="Google Chrome", key="return")
time.sleep(3)

# Step 2: Find the prompt input field
# (field selector will vary — check with ghost_find after first run)
ghost("ghost_find", app="Google Chrome", query="Describe your design", role="AXTextField")

# Step 3: Type the prompt
ghost("ghost_type", app="Google Chrome", text=prompt)
ghost("ghost_press", app="Google Chrome", key="return")

# Step 4: Wait for generation (Claude Design takes ~30-60 seconds)
time.sleep(60)

# Step 5: Download the SVG
# (download button selector TBD after first run)
ghost("ghost_find", app="Google Chrome", query="Download", role="AXButton")
ghost("ghost_click", ...)  # click download

print(f"Done. Check ~/Downloads/ for the SVG, then move to {OUTPUT_DIR}/{VISUAL_TYPE}.svg")
```

Note: The exact Ghost OS calls (especially field selectors) need to be confirmed on first run. The Step 1 exploration task will reveal the correct selectors. Update the script with actual selectors before batch runs.

- [ ] **Step 3: Test the script on one prompt**

Write a minimal test prompt to `prompts/test-prompt.txt`:

```
Create a simple hand-drawn-style rectangle labeled "test" in paper background (#F5F0E8) with ink lines (#1C1917). SVG, 400x200px.
```

Run:
```bash
python3 scripts/submit-to-claude-design.py test-playbook hero prompts/test-prompt.txt
```

Confirm: SVG downloads, no copy-paste required.

- [ ] **Step 4: Commit the script**

```bash
git add scripts/submit-to-claude-design.py
git commit -m "feat: Ghost OS → Claude Design submission script"
```

---

## Task 3: Write per-playbook visual strategy map

One document with a row per playbook. Each row specifies the unique visual hook, treatment type, practitioner blend, and content for hero + in-body diagrams. This is the creative brief that prevents every playbook looking the same.

**Files:**
- Create: `docs/design/visual-strategy-map.md`

- [ ] **Step 1: Write the visual strategy map**

```markdown
# ab-codex Visual Strategy Map

One row per playbook. Each playbook gets a unique visual hook — the thing that makes it
unmistakable and unrepeatable across the 27.

---

## Positioning playbook
**Unique hook:** The 16-step pipeline rendered as a hand-ruled vertical column with margin
annotations at every step — like a researcher's working notebook, not a polished slide.
**Hero:** Annotated pipeline · 1200×630
  Content: Steps 1-6 visible (identify customers → interview → alternatives → category claims
  → alternatives check → 10-word statement). Each step: number in JetBrains Mono, label in
  Inter 500, annotation in Inter 400 italic (margin, 0.5px dashed rule).
  Practitioners: Rohde (warmth, hand-lettered hierarchy) + Tufte (every annotation earns its
  place) + old Scientific American (the cutaway that shows the working).
**Diagram 01:** Steps 7-16 continuation · 900×500
**Diagram 02:** The 10-word positioning statement as a concept diagram — sentence anatomy,
  each word's role annotated.

---

## Tactical Empathy Discovery playbook
**Unique hook:** A two-column screenplay excerpt — Buyer voice on left, technique label on
right, with a hand-ruled margin. The move is visible; the reasoning is visible. Feels like
a rehearsal script, not a slide.
**Hero:** Annotated script · 1200×630
  Content: 3 exchanges — mirror, label ("mirror: repeat last 3 words, upward inflection"),
  pause, label ("calibrated question: 'what makes that important to you?'"), accusation audit,
  label ("accusation audit: address their fear before they voice it").
  Practitioners: McCloud (panel compression, each exchange = beat) + Rohde (hand-lettered warmth)
  + Holmes (a small story with characters).
**Diagram 01:** The accusation audit alone — expanded, one technique per panel · 900×500

---

## Pricing as Strategic Function playbook
**Unique hook:** A Du Bois-style data portrait for the 1% price → 8% profit insight —
  horizontal bars, each one a lever. The bars make the argument. Below: an annotated WTP
  cliff curve in old Economist illustration style.
**Hero:** Data portrait + annotated curve split composition · 1200×630
  Content: 4 bars — pricing lever (+8% profit), volume lever (+3%), variable cost (-2%),
  fixed cost (-1%). Labels inside bars. Each bar: one claim, not a label.
  Practitioners: Du Bois (bars as argument, not decoration) + Tufte (data-ink) + old Economist.
**Diagram 01:** WTP demand cliff · 900×500 — hand-plotted, 3 cliff points annotated,
  no gridlines. The annotation names the psychological trigger at each cliff.
**Diagram 02:** The 3-question protocol as a concept diagram — each question as a node,
  arrows showing the decision path.

---

## Copywriting Mastery playbook
**Unique hook:** A hand-annotated newspaper headline — the Ogilvy-style dissection of a
  working headline. Every word's job is labeled. Feels like a copy editor's marked-up proof.
**Hero:** Annotated script (headline anatomy) · 1200×630
  Content: One proven headline ("They laughed when I sat down at the piano…") with
  annotation rules pointing to: curiosity gap, social proof via contrast, implied outcome.
  Practitioners: Holmes (wit + information, a small story) + Rohde (annotation warmth)
  + Bass (reduce to essence — if it can be cut, cut it).
**Diagram 01:** The AIDA pipeline rendered as an annotated vertical column · 900×500

---

## ICP Definition playbook
**Unique hook:** Three concentric rings — TAM / SAM / ICP — but hand-ruled and annotated,
  not diagrammatic. The annotations are operator verbatim quotes at each ring: "fast close,
  stayed, became advocates."
**Hero:** Concept diagram (ring annotation) · 1200×630
  Content: Outer ring: "Total addressable," Middle: "Serviceable," Inner: ICP with
  3 operator quotes anchored to it by dashed rules.
  Practitioners: Noma Bar (economy, one shape contains everything) + Tufte (annotation as argument)
  + Lupi (data as story, human warmth in the geometry).
**Diagram 01:** ICP interview → pattern map pipeline · 900×500

---

## Campaign Strategy playbook
**Unique hook:** A Eames-style phased Gantt — ink-ruled bars on a ruled grid, each bar
  labeled inside with owner initial + phase name. The grid IS the structure, not decoration.
**Hero:** Phased Gantt · 1200×630
  Content: 8-week campaign view — Research (W1-W2), Positioning lock (W2), Creative (W3-W4),
  Launch (W5-W6), Amplify (W6-W7), Measure (W7-W8). Bars in sienna (primary) and sage (ops).
  Practitioners: Eames (honest materials, educational) + Tufte (no chartjunk) + Moore (design
  for doing, not knowing).
**Diagram 01:** Campaign strategy decision tree — when to invest in each channel type.

---

## Launch Plan playbook
**Unique hook:** Pre/During/Post phases rendered as three distinct visual zones on the same
  timeline, separated by a vertical rule. Each zone has a different compositional density —
  sparse pre-launch, dense launch week, tapering post-launch.
**Hero:** Phased Gantt (3-zone) · 1200×630
  Practitioners: Eames + Tufte + Moore. Differentiated from Campaign Strategy by the
  3-zone density variation — Campaign is uniform bars, Launch has a visual spike at launch week.
**Diagram 01:** Go/No-go gate checklist as annotated pipeline · 900×500

---

## Win/Loss Framework playbook
**Unique hook:** A Du Bois-style data portrait of win themes vs loss themes — parallel
  horizontal bars, wins in sage, losses in danger red. The bars are evidence; the labels
  are claims, not categories.
**Hero:** Data portrait (win/loss mirror bars) · 1200×630
  Content: 5 win themes (bars right), 5 loss themes (bars left), mirrored. Each bar: one
  claim. Total: 10 claims that tell the competitive story.
  Practitioners: Du Bois (bars as argument) + Tufte + McCandless (density made inviting).
**Diagram 01:** Interview protocol as annotated pipeline · 900×500

---

## AEO Relevance Engineering playbook
**Unique hook:** A cutaway technical diagram — how an AI crawler sees a page. Like an old
  Scientific American cross-section: the page on the left, the crawler's extracted nodes
  on the right, with dashed rules connecting elements to their AEO impact.
**Hero:** Annotated pipeline (technical cutaway) · 1200×630
  Content: Page structure left column → crawler extraction right column → AEO signal labels.
  Practitioners: Eames (honest materials, technical clarity) + Tufte (annotation as content)
  + old Scientific American (the cutaway that shows invisible workings).
**Diagram 01:** AEO vs SEO distinction as a concept diagram · 900×500

---

## Competitive Analysis playbook
**Unique hook:** A hand-ruled 2×2 with plotted competitor positions as initials (not logos).
  Axes are argumentative: "Category leader ↔ Niche specialist" and "Feature-led ↔ Outcome-led."
  The quadrant itself is an argument about the market.
**Hero:** Classical quadrant · 1200×630
  Content: Axes labeled with claims (not neutral terms). 8-12 competitor initials plotted.
  Whitespace zone labeled "opportunity."
  Practitioners: Lupi (data as story, human placement) + Tufte (every mark an argument).
**Diagram 01:** Battle card structure as annotated pipeline · 900×500

---

## Measurement Framework playbook
**Unique hook:** Four data portrait bars — one per measurement tier (input, output, outcome,
  impact). Each bar splits into two: target vs actual. The gap between target and actual IS the
  insight. Hand-ruled, no perfect geometry.
**Hero:** Data portrait (target/actual split bars) · 1200×630
  Practitioners: Du Bois + Tufte + Mayer (signal without noise).
**Diagram 01:** North Star metric cascade — concept diagram, one node per level · 900×500

---

## Messaging Matrix playbook
**Unique hook:** A hand-ruled matrix — personas across the top, messages down the side,
  with evidence codes at each intersection (not fill colors). The evidence is the content;
  the matrix is just the container.
**Hero:** Classical quadrant / matrix (evidence-coded) · 1200×630
  Practitioners: Tufte (data-ink, no fill) + Roam (anyone can draw their ideas) + Mayer
  (spatial contiguity: related things adjacent).
**Diagram 01:** Single message anatomy — one message dissected line by line · 900×500

---

## Narrative Compose playbook
**Unique hook:** A Duarte-adjacent sparkline — the what-is vs what-could-be tension rendered
  as a hand-drawn arc with annotated inflection points. But unlike Duarte: rougher, more urgent,
  more editorial. The arc is the argument, not a pretty illustration.
**Hero:** Annotated curve (narrative arc) · 1200×630
  Practitioners: McCloud (sequence logic) + Holmes (point of view in the shape) + Lupi (warm,
  imperfect line as signal of human thought).
**Diagram 01:** Problem/Tension/Resolution pipeline as annotated script · 900×500

---

## Landing Page CRO Rubric playbook
**Unique hook:** A wireframe-adjacent cutaway of an above-the-fold section — but annotated
  with the CRO rubric criteria, not design labels. The annotation IS the rubric. Feels like
  a UX review in progress, not a finished diagram.
**Hero:** Annotated pipeline (page anatomy cutaway) · 1200×630
  Practitioners: Rohde (annotation style, immediacy) + Tufte (no decoration, only content)
  + old Scientific American (the cutaway that makes structure visible).
**Diagram 01:** Conversion hierarchy as pillar structure · 900×500

---

## Humanizer playbook
**Unique hook:** A before/after text comparison — AI text on the left (annotated with its tells),
  humanized text on the right (annotated with the techniques). Looks like a copy editor's
  dual proof. The tells and the fixes are labeled with surgical precision.
**Hero:** Annotated script (before/after) · 1200×630
  Practitioners: Holmes (wit + information) + Rohde (warmth, hand-lettered annotation).
**Diagram 01:** AI-pattern taxonomy as failure taxonomy · 900×500

---

## Writing Craft playbook
**Unique hook:** A single paragraph dissected — each sentence annotated with its structural
  role (short punch, expansion, long musical phrase). Provost cadence made visible. Looks like
  a linguist's working paper.
**Hero:** Annotated script (sentence-level annotation) · 1200×630
  Practitioners: Holmes + Rohde + McCloud (each sentence = a panel).
**Diagram 01:** The Gary Provost cadence diagram — bar chart of sentence lengths · 900×500

---

## Claim-Verify Gate playbook
**Unique hook:** A gate-and-lock pipeline — each step is a gate that either passes or blocks
  the claim. Blocked claims go to a "quarantine" box in danger red. Passed claims continue.
  Feels like a security audit, not a process diagram.
**Hero:** Annotated pipeline (gate/lock system) · 1200×630
  Practitioners: Eames (honest materials) + Tufte (structural logic) + Thalheimer (evidence-grade).
**Diagram 01:** Source quality ladder — concept diagram, 5 tiers · 900×500

---

## LLM Wiki playbook
**Unique hook:** A knowledge graph rendered as a constellation — pages as nodes, relationships
  as edges. But annotated: each node has a type label (person / project / concept), each edge
  has a relationship label. Looks like an astronomer's working chart.
**Hero:** Network/constellation · 1200×630
  Practitioners: Lupi (human data points) + McCandless (density made inviting) + Tufte (every
  edge earns its place).
**Diagram 01:** Ingest → synthesis → serve pipeline as annotated pipeline · 900×500

---

## Synthetic Audience Test playbook
**Unique hook:** A two-panel composition — left panel shows the prompt/setup (annotated script
  style), right panel shows the output as data portrait bars. The visual IS the methodology:
  input on left, output on right.
**Hero:** Split: annotated script (left) + data portrait (right) · 1200×630
  Practitioners: Mayer (spatial contiguity, related things adjacent) + Tufte + Du Bois.
**Diagram 01:** Validation framework as annotated pipeline · 900×500

---

## Mental Models OS playbook
**Unique hook:** A latticework — mental model nodes connected by edges, arranged in clusters
  by domain. Key nodes (Munger, Bayes, etc.) are larger. Edge labels name the relationship.
  Feels like a hand-ruled mind map made by a serious thinker, not a brainstorm session.
**Hero:** Network/constellation · 1200×630
  Practitioners: Lupi (human, warm nodes) + McCandless (inviting density) + Noma Bar (economy).
**Diagram 01:** Mental model application pipeline — how to reach for the right model · 900×500

---

## Design Principles playbook
**Unique hook:** A hierarchy rendered as a vertical column — principles at top (largest type),
  sub-principles as indented annotations, examples as the finest annotation. Looks like a
  typographer's specimen sheet.
**Hero:** Pillar/hierarchy structure · 1200×630
  Practitioners: Bass (reduce to essence) + Favre (geometric confidence) + Tufte.
**Diagram 01:** Principle vs anti-pattern paired layout as failure taxonomy · 900×500

---

## Design Thinking for Content playbook
**Unique hook:** The double diamond rendered in hand-drawn style — two diamonds, four phases,
  with operator quotes anchored at each phase. The diamonds are slightly imperfect. The quotes
  make it human.
**Hero:** Concept diagram (double diamond) · 1200×630
  Practitioners: Roam (drawing as thinking) + Lupi (warmth in the geometry) + Moore (design
  for doing).
**Diagram 01:** Empathy interview pipeline as annotated script · 900×500

---

## Help Documentation playbook
**Unique hook:** An information architecture tree — rendered as a hand-ruled hierarchy. Each
  node is a help article type (concept / task / reference / troubleshooting). The four types
  have distinct visual weight. Looks like a librarian's card catalogue, not a sitemap.
**Hero:** Architectural diagram (4-column hierarchy) · 1200×630
  Practitioners: Eames (honest materials, educational) + Moore (design for doing).
**Diagram 01:** Article anatomy as annotated pipeline · 900×500

---

## PMM Coaching Framework playbook
**Unique hook:** A flywheel — rendered as a hand-drawn circle with four labeled segments.
  Unlike standard flywheel diagrams: the segments are not equal (some phases are longer),
  and the momentum is shown by varying the weight of the arrowhead.
**Hero:** Concept diagram (unequal flywheel) · 1200×630
  Practitioners: Noma Bar (one shape, multiple meanings) + Bass (reduce to essence) + Lupi
  (warmth, imperfect geometry signals human thought).
**Diagram 01:** Coaching session annotated script · 900×500

---

## pSEO Framework playbook
**Unique hook:** A production-line cutaway — the pSEO machine. Input: data source. Process:
  template. Output: pages at scale. Each stage annotated with the technical detail. Looks like
  an Eames educational film still.
**Hero:** Annotated pipeline (production machine) · 1200×630
  Practitioners: Eames (honest materials, the machine explained) + Tufte + old Scientific American.
**Diagram 01:** Template anatomy as annotated script · 900×500

---

## Converting-Copy Playbook
**Unique hook:** A direct mail letter anatomy — headline, deck, body, CTA — annotated with
  Ogilvy-style precision. Each section labeled with its conversion job. Feels like a
  practitioner's review of a working letter.
**Hero:** Annotated script (letter anatomy) · 1200×630
  Practitioners: Holmes (the small story with characters) + Rohde (hand-lettered warmth)
  + Bass (reduce to essence).
**Diagram 01:** Objection/response paired matrix · 900×500

---

## Sales Enablement playbook
**Unique hook:** A three-column layout — Buyer stage (left), Buyer question (center), Asset
  recommendation (right) — rendered as a hand-ruled table with annotations. The table is
  argumentative: the asset column has a "why" annotation, not just a label.
**Hero:** Architectural diagram (3-column enablement map) · 1200×630
  Practitioners: Moore (design for doing) + Tufte (annotation as argument) + Eames.
**Diagram 01:** Objection taxonomy as failure taxonomy · 900×500
```

- [ ] **Step 2: Confirm each playbook has a genuinely different composition**

Read through the map and verify: no two hero visuals use the same treatment type AND the same practitioner blend. If any two feel interchangeable, revise one before proceeding.

- [ ] **Step 3: Commit the visual strategy map**

```bash
git add docs/design/visual-strategy-map.md
git commit -m "design: per-playbook visual strategy map (27 playbooks, unique hooks)"
```

---

## Task 4: Batch A — Dialogue & conversation playbooks

Playbooks: Tactical Empathy Discovery · Copywriting Mastery · Humanizer · Writing Craft · Converting-Copy · Narrative Compose

Common treatment: **Annotated script** (but each uses a different excerpt/format/annotation style — see visual strategy map for differentiators).

For each playbook in this batch, follow this sequence:

- [ ] **Step 1: Write the prompt file**

Create `prompts/[slug]-hero.txt`. Use the template from the spec. Example for Tactical Empathy:

```
Create an annotated script visual for the ab-codex Tactical Empathy Discovery playbook.

CONTENT:
Two-column screenplay format. Three exchanges:

BUYER: "It didn't really stick last year."
[margin annotation: mirror → repeat last 3 words, upward inflection]
YOU: "Didn't really stick?"
[margin annotation: surfaces procurement / legal — never asked directly]

BUYER: "What's your timeline looking like?"
[margin annotation: calibrated question — 'what makes that important to you?']
YOU: "What would make this the right time?"

BUYER: "I'm worried about rollout complexity."
[margin annotation: accusation audit — address their fear before they voice it]
YOU: "It sounds like you've had implementations go sideways before."

STYLE:
- Paper background (#F5F0E8), ink lines (#1C1917), sienna emphasis (#92400E)
- Hand-drawn editorial feel — slight imperfection in ruling lines, not mechanical
- Left column: dialogue in Inter 400. Right column (narrower): annotation labels in Inter 400 italic, 10px, ink-light (#57534E)
- A vertical dashed rule (0.5px, ink-light) separating the two columns
- Newsreader 700 italic title "Tactical Empathy Discovery" at top
- JetBrains Mono for exchange numbers (01, 02, 03)
- Channels: McCloud (panel compression, each exchange = beat) + Rohde (hand-lettered warmth) + Holmes (a small story with characters)
- The annotation IS the insight — it should read like a director's margin note

OUTPUT: SVG, 1200×630px

DO NOT:
- Add clip art or icon library icons
- Use drop shadows or gradients
- Use more than 3 colours
- Make it look like a SaaS playbook slide
- Make it look AI-generated — imperfect lines, not perfect geometry
```

- [ ] **Step 2: Submit via Ghost OS automation**

```bash
python3 scripts/submit-to-claude-design.py tactical-empathy-discovery hero prompts/tactical-empathy-discovery-hero.txt
```

Wait for download. Move SVG:
```bash
mv ~/Downloads/[downloaded-file].svg assets/visuals/tactical-empathy-discovery/hero.svg
```

- [ ] **Step 3: Run the AI-pattern checklist**

Open the SVG in a browser. Check every item in the CRITICAL RULES section above. If any item fails, revise the prompt and resubmit.

- [ ] **Step 4: Export PNG**

```bash
# Using Inkscape or equivalent:
inkscape assets/visuals/tactical-empathy-discovery/hero.svg --export-png=assets/visuals/tactical-empathy-discovery/hero.png --export-width=1200
# Or if using rsvg-convert:
rsvg-convert -w 1200 assets/visuals/tactical-empathy-discovery/hero.svg > assets/visuals/tactical-empathy-discovery/hero.png
```

- [ ] **Step 5: Repeat for remaining Batch A playbooks**

Apply the same 4 steps for: Copywriting Mastery · Humanizer · Writing Craft · Converting-Copy · Narrative Compose. Each with their unique prompt from the visual strategy map.

- [ ] **Step 6: Commit Batch A visuals**

```bash
git add assets/visuals/tactical-empathy-discovery/ assets/visuals/copywriting-mastery/ assets/visuals/humanizer/ assets/visuals/writing-craft/ assets/visuals/converting-copy/ assets/visuals/narrative-compose/ prompts/
git commit -m "feat: Batch A visuals — dialogue & conversation playbooks (6 heroes)"
```

---

## Task 5: Batch B — Process & pipeline playbooks

Playbooks: Positioning · Launch Plan · Campaign Strategy · ICP Definition · Claim-Verify Gate · pSEO Framework · AEO Relevance Engineering

Common treatment: **Annotated pipeline** or **Phased Gantt** — but each uses a different structural metaphor (see strategy map). Positioning = researcher's notebook; Launch = 3-zone density variation; Campaign = Eames uniform bars; AEO = Scientific American cutaway.

Follow the same 6-step sequence as Batch A. Key differentiation per prompt:

- **Positioning:** "16-step column, margin annotations, JetBrains Mono step numbers, slight ink variation between steps — like a researcher filled this in over multiple sessions, not in one sitting."
- **Launch Plan:** "Three visual zones with different bar densities — sparse pre-launch (W1-W3), dense launch spike (W4-W5), tapered post-launch (W6-W8). The density IS the story."
- **Campaign Strategy:** "8-week Eames-style uniform bars — no density variation, just clean sequencing. Differentiated from Launch Plan by its regularity."
- **AEO:** "Scientific American cutaway — the page on the left, crawler's view on the right, dashed rules connecting them. Technical but warm."

- [ ] Repeat 6-step process for all 7 Batch B playbooks
- [ ] Commit: `feat: Batch B visuals — process & pipeline playbooks (7 heroes)`

---

## Task 6: Batch C — Data & economics playbooks

Playbooks: Pricing as Strategic Function · Measurement Framework · Win/Loss Framework · Synthetic Audience Test

Common treatments: **Data portrait** + **Annotated curve** — but each has a distinct compositional approach:
- Pricing: Split composition (bars + curve in same hero)
- Measurement: Target/actual split bars (unique within data portrait family)
- Win/Loss: Mirror bars (wins right, losses left — Du Bois mirror)
- Synthetic Audience: Two-panel (script left, bars right)

- [ ] Repeat 6-step process for all 4 Batch C playbooks
- [ ] Commit: `feat: Batch C visuals — data & economics playbooks (4 heroes)`

---

## Task 7: Batch D — Framework & architecture playbooks

Playbooks: Mental Models OS · LLM Wiki · Competitive Analysis · Messaging Matrix · Design Thinking for Content · Design Principles · Help Documentation · Sales Enablement

Treatments: Network constellation · Classical quadrant · Architectural diagram · Matrix — each differentiated by annotation strategy and compositional weight.

- [ ] Repeat 6-step process for all 8 Batch D playbooks
- [ ] Commit: `feat: Batch D visuals — framework & architecture playbooks (8 heroes)`

---

## Task 8: Batch E — Remaining playbooks

Playbooks: PMM Coaching Framework · Landing Page CRO Rubric · Writing Craft (diagram-01s for any playbooks that need a second visual)

- [ ] Repeat 6-step process for remaining playbooks
- [ ] Produce diagram-01 for the 5 highest-priority playbooks (Positioning · Pricing · Tactical Empathy · ICP · Campaign Strategy)
- [ ] Commit: `feat: Batch E visuals + priority diagram-01s`

---

## Task 9: Wire visuals into playbook HTML pages

**Files:**
- Modify: playbook HTML files (one per playbook)

- [ ] **Step 1: Find where playbook hero images are rendered**

```bash
grep -r "hero" docs/ --include="*.html" -l | head -10
grep -r "visual" insight-library/ --include="*.json" | head -5
```

- [ ] **Step 2: Identify the HTML pattern for adding a visual**

Read one playbook HTML file to understand the structure:
```bash
# Find the playbook HTML files
find docs/ -name "*.html" | head -5
# Read one to understand the hero image slot
```

- [ ] **Step 3: Add hero visuals to each playbook**

For each playbook, add the hero SVG to the correct slot in the HTML. The pattern will be established after Step 2 — do not guess the pattern.

- [ ] **Step 4: Test in browser**

```bash
# Open a playbook page in browser
open docs/[playbook-slug]/index.html
# Confirm: hero visual visible, correct dimensions, paper background
```

- [ ] **Step 5: Commit integration**

```bash
git add docs/
git commit -m "feat: wire hero visuals into all 27 playbook pages"
```

---

## Task 10: Final review pass

- [ ] **Step 1: Open all 27 hero visuals in a grid**

```bash
# Create a review page
cat > /tmp/visual-review.html << 'EOF'
<!DOCTYPE html>
<html>
<head><style>
body { background: #F5F0E8; font-family: monospace; padding: 24px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.item img { width: 100%; border: 1px solid #D6CFC4; }
.item p { font-size: 10px; margin: 4px 0; }
</style></head>
<body>
<div class="grid">
EOF

for d in /Users/k3sava/r2d2/ab-codex/assets/visuals/*/; do
  slug=$(basename "$d")
  if [ -f "$d/hero.png" ]; then
    echo "<div class='item'><img src='$d/hero.png'><p>$slug</p></div>" >> /tmp/visual-review.html
  fi
done

echo "</div></body></html>" >> /tmp/visual-review.html
open /tmp/visual-review.html
```

- [ ] **Step 2: Run AI-pattern checklist across all 27**

For each visual, answer: could this have been produced by a Canva template? If yes — revise the prompt and resubmit that specific visual.

- [ ] **Step 3: Check for accidental uniformity**

Ask: do any two hero visuals feel interchangeable? If yes — one of them needs a new unique hook. Revise the strategy map entry and resubmit.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: 27 playbook hero visuals — final review pass complete"
```

---

## Appendix: Claude Design prompt template

```
Create a [treatment-type] for the ab-codex [Playbook Name] playbook.

CONTENT:
[Exact content — steps, labels, exchanges, data, relationships.
No vague descriptions. Specify every element that appears in the visual.]

STYLE:
- Paper background (#F5F0E8), ink lines (#1C1917), sienna emphasis (#92400E)
- Hand-drawn editorial feel — slight imperfection in lines, not mechanical
- Newsreader 700 italic for the playbook title
- Inter 500 for labels, Inter 400 for annotations, JetBrains Mono for codes/numbers
- White space: generous. Minimum 24px padding around every element.
- Channels: [List the 2-3 practitioners from the strategy map for this visual]
- [Unique differentiator from the strategy map — what makes this visual unrepeatable]

OUTPUT: SVG, [dimensions]

DO NOT:
- Add clip art or icon library icons
- Use drop shadows or gradients
- Use more than 3 colours
- Make it look like a SaaS landing page infographic
- Make it look AI-generated — imperfect ruling lines, not perfect geometry
- Add decorative elements that don't carry information
```
