---
id: ins_progressive-trust-onboarding
operator: Claire Vo
operator_role: 3x CPO; founder of ChatPRD
source_url: https://www.lennysnewsletter.com/p/claire-vo-openclaw
source_type: podcast
source_title: Claire Vo on running 9 AI agents — Lenny's Podcast
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [ai-native, leadership, sales-cs]
lifecycle: [hiring-team-design, ai-workflow, process-cadence]
maturity: applied
artifact_class: playbook
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_agents-as-team-not-tools, ins_manager-skill-not-technical]
raw_ref: raw/podcasts/claire-vo--openclaw-agents-as-team--2026-04-28.md
---

# Onboard agents the way you onboard an EA: progressive trust, named tiers

## Claim
Stage tool access for AI agents in named tiers (read calendar → read mail → draft mail → send mail), the same way you'd ramp a new executive assistant. Don't hand over full account access on day one.

## Mechanism
Trust ramps mitigate two failure modes at once: alignment (the agent learns your style on low-stakes work before it does anything irreversible) and security (a compromised agent has bounded blast radius at each stage). Treating provisioning as a ladder forces explicit decisions about what each agent should be able to do, instead of one big "give it admin" moment.

## Conditions
Works when:
- Tools have granular permissions (read-only tokens, draft-only roles, send-with-review hooks).
- The team has the discipline to actually advance agents through stages on observed behavior.

Fails when:
- The tool stack is all-or-nothing (no read-only API mode). Operators end up granting full access for any utility.
- The org culture treats permission tiers as bureaucracy rather than operating hygiene.

## Evidence
> "You don't onboard your EA by giving the password to your email account... they have their own email, they have their own calendar, and you give them access or permission."
>
> "First you get my calendar, then you can read my email, then I guess you could draft some emails, then you can send the emails."

— Claire Vo on Lenny's Podcast, 2026-04-28

## Signals
- Each agent has a documented permission tier, not a yes/no access list.
- New tool access requires an explicit ramp decision, not a default-on grant.
- Audit logs show agents using only the tools at their current tier.

## Cross-references
- `ins_agents-as-team-not-tools` — the team frame this protocol implements
- `ins_manager-skill-not-technical` — the operator skill needed to run the ramp
