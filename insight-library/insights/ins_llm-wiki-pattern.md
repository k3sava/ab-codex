---
id: ins_llm-wiki-pattern
operator: Andrej Karpathy
operator_role: AI researcher; ex-OpenAI, ex-Tesla; founder of Eureka Labs
source_url: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
source_type: essay
source_title: LLM Wiki (gist)
source_date: 2026-04
captured_date: 2026-05-01
domain: [ai-native, engineering, research]
lifecycle: [ai-workflow, process-cadence]
maturity: applied
artifact_class: framework
score: { originality: 5, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_agents-as-team-not-tools]
raw_ref: raw/essays/karpathy--llm-wiki--2026-04.md
---

# An LLM should maintain a wiki, not re-derive knowledge per query

## Claim
Replace traditional RAG ("retrieve documents, answer once, forget") with a persistent wiki the LLM owns and edits. Knowledge compiles once and stays current, instead of being rediscovered repeatedly across sessions.

## Mechanism
RAG treats each query as a cold start: fetch chunks, ground the answer, discard the synthesis. The same insight is rebuilt many times across sessions, and contradictions across sources are never resolved — they're rediscovered each time. A wiki inverts this: the LLM writes a synthesis page once, links it to raw sources, lints for contradictions, and reads the page (cheap) instead of regrounding from chunks (expensive and lossy). Three layers stabilize the pattern: immutable raw sources (append-only), LLM-owned synthesis pages, and a small constitution that defines the operations.

## Conditions
Works when:
- The domain has durable structure (people, projects, concepts, decisions) — not a moving target like live market data.
- The operator commits to lint passes (orphans, contradictions, stale claims, naming drift). Without lint, the wiki rots.
- The LLM has read access to the wiki at the start of every relevant session.

Fails when:
- The domain is too volatile for any synthesis to remain accurate for more than hours.
- The operator can't commit to lint cadence; the wiki becomes write-only.
- Multiple LLMs (or LLM + human) write without log discipline; edits collide silently.

## Evidence
> "Traditional RAG rediscovers knowledge repeatedly rather than accumulating it. The LLM builds and maintains a persistent wiki instead of just retrieving documents. Knowledge compiles once and stays current, not re-derived per query."

— Andrej Karpathy, LLM Wiki gist, 2026-04

The pattern has been adopted across multiple operators' personal knowledge systems within months of publication, including the system this corpus is built on.

## Signals
- Token spend per repeated query drops as wiki coverage grows.
- Cross-session coherence improves (same answer to the same question across days).
- Lint reports show declining drift over time, not growing.
- New questions trigger an INGEST or a small page update, not a from-scratch retrieval.

## Counter-evidence
For genuinely novel queries with no precedent in the wiki, RAG over a fresh corpus is still required. The wiki accumulates synthesis; it doesn't replace retrieval against new material. A wiki without a steady ingest discipline becomes a stale snapshot.

## Cross-references
- `ins_agents-as-team-not-tools` — the wiki is the substrate that lets per-role agents share durable context

## Adoption note
The codex corpus you are reading is itself an instance of this pattern, applied at the operator-insight scope: `raw/` holds source transcripts and articles, `insights/` holds the synthesis layer, `00_meta/` holds the constitution.
