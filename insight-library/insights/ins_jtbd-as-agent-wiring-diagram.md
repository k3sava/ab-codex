---
id: ins_jtbd-as-agent-wiring-diagram
operator: Evan Spiegel
operator_role: CEO and co-founder, Snap
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Evan Spiegel — Distribution, design as bottleneck — Lenny's Podcast
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [ai-native, product, leadership]
lifecycle: [ai-workflow, hiring-team-design]
maturity: frontier
artifact_class: framework
score: { originality: 5, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_software-is-not-a-moat]
raw_ref: raw/podcasts/evan-spiegel--snap-distribution-design-bottleneck--2026-04-28.md
---

# Map agents 1:1 to enumerated jobs-to-be-done, not abstractly to "AI-augmented" workflows

## Claim
Don't deploy agents around vague capability ("AI for marketing"). Enumerate the jobs-to-be-done explicitly — the user journey jobs, the advertiser jobs, the operator jobs — then map each to an agent, with named human checkpoints. The agent inherits the JTBD frame; cross-functional teams form around the jobs, not the agents.

## Mechanism
JTBD pre-decomposes the work into the right unit. An "AI-augmented marketing team" is a vague abstraction that produces tools without owners. A list of explicit jobs (download app → add friends → use lens; trial → demo → activation; ad creative → bid → measurement) gives each job an owner who can be human, agent, or hybrid. The decomposition is the value; the agent assignment is downstream.

## Conditions
Holds when:
- The team has the discipline to enumerate jobs at the right granularity — not too coarse (not "marketing") and not too fine (not "click button A").
- Cross-functional teams can form around jobs, not departments.

Fails when:
- The jobs are forced taxonomy that doesn't match how users actually act.
- The org can't reorganize around jobs because of legacy reporting structures.

## Evidence
> "By listing out all these jobs to be done, really for the community journey and for advertisers as well, it became very clear where we could use agents, where we needed to be very focused in terms of building cross-functional teams around those jobs supported by AI tools."

Snap's go-to-market agent example: "Taking that product idea, writing the spec, identifying the relevant folks who need to be involved in sign-offs, doing the risk analysis from a legal/trust-safety perspective, writing the go-to-market materials like the blog... doing that in one shot is really wild."

— Evan Spiegel on Lenny's Podcast, 2026-04-28

## Signals
- Org charts evolve toward job-shaped teams, not function-shaped silos.
- Each agent has a single named JTBD it owns.
- Human-checkpoint roles are explicit and named (not "review optional").

## Counter-evidence
JTBD discipline is rare. Most teams that say they use it actually use vague "personas" plus a feature roadmap. Without the actual decomposition work, "agents mapped to JTBD" becomes a slogan, not a structure. Bob Moesta's broader JTBD work is the prerequisite; Evan's contribution is mapping to agents specifically.

## Cross-references
- `ins_software-is-not-a-moat` — the moat shape this work produces
- (Bob Moesta JTBD methodology — A-K territory, not in this corpus yet)
