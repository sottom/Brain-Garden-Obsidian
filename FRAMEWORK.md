# Generic-to-Specific Requirements Framework

A reusable approach for taking abstract / standards-based requirements
(SOX, PCI-DSS, GDPR, accessibility, internal coding standards, vendor
contracts) and turning them into specific, testable developer stories
with full traceability and audit-ready evidence.

The same pattern applies whenever you have:

> _A generic / immutable set of rules_ → _your specific landscape of
> systems and processes_ → _what work do we need to do?_

---

## The mental model

```
GENERIC CONTROLS         ──[bridge 1: scope]──►  YOUR SYSTEMS
(SOX 27, PCI, GDPR…)                            (inventory)
        │
        └──[bridge 2: applicability]──► CONTROL × SYSTEM MATRIX
                                              │
                                              └──[bridge 3: assessment]──► GAP LIST
                                                                              │
                                                                              └──[bridge 4: decomposition]──► STORIES + EVIDENCE
```

Generic controls never change. Your systems do. The matrix is where the
actual thinking happens. **The Applicability Matrix is the artifact that
pays back the most.** Most people skip it and go straight from "27
generic controls" to "make a story for each." That fails because a
single control can become 5 stories (one per system) or 0 stories
(doesn't apply anywhere). The matrix forces the scoping decision once,
in one place, with an explicit reason — and that's the artifact auditors
actually want to see anyway.

---

## The 6 durable artifacts

Build these once, maintain them forever. Every compliance project reuses
or refreshes them.

| # | Artifact | Purpose | Updated when |
|---|---|---|---|
| 1 | **System Inventory** | Every system in scope with owner, data, integrations | A new system joins/leaves |
| 2 | **Control Catalog** | The generic requirements (verbatim, with stable IDs) | Standard revises (rare) |
| 3 | **Applicability Matrix** | Which controls apply to which system, and why | Inventory or catalog changes |
| 4 | **Gap Assessment** | Current state per cell + evidence reference | Each audit cycle |
| 5 | **Remediation Backlog** | Stories that close each gap | Continuously |
| 6 | **Evidence Repository** | Screenshots, logs, tickets proving operation | Continuously |

---

## The 8 repeatable steps

Same every time. **Time-box each step** so you don't perfection-trap.

### 1. Inventory your systems (2–5 days)
Before reading any standard, list every system with:
- name
- owner
- what data it stores
- what data it produces
- what it integrates with
- hosting model (SaaS / on-prem / IaaS)
- criticality

For SOX, the in-scope filter is "does this affect financial reporting?"
— that's a 1-hour conversation with Finance.

### 2. Adopt the control catalog verbatim (1 day)
Load every generic control into a tab. **Don't paraphrase** — auditors
will check exact language. Add a stable internal ID (e.g.,
`SOX-ITGC-AC-01`) so your stories can reference them. Two columns
suffice initially: `Control ID`, `Control Statement`.

### 3. Build the Applicability Matrix (3–5 days)
A grid: rows = controls, columns = systems. Each cell gets `Yes`,
`No`, or `Partial`. For every `Yes` or `Partial`, add a one-line *why
this applies*. **Have a control owner sign each row.**

### 4. Gap-assess each applicable cell (1–2 weeks)
For every `Yes` cell, evidence-based current state:
`Met / Partial / Gap / N/A-Compensated`. Capture the **evidence
reference** (link to the ticket, doc, screenshot) — not a description.
If you can't link evidence, it's a gap.

**Run walkthroughs with the system owner** rather than assessing from
your desk. Things that *sound* compliant rarely are.

### 5. Decompose gaps into stories (3–5 days)
One gap = one story. **Acceptance criteria are evidence requirements**,
not feature requirements: "we'll know it's done when X log shows Y for
Z days."

### 6. Prioritize by risk × effort (half day)
Simple 2×2: regulatory severity on one axis, engineering effort on the
other. Cluster:
- **Quick wins** — low effort, high severity
- **Must-do-anyway** — high effort, high severity
- **Deferred** — high effort, low severity
- **Accept with compensating control** — when fixing the root is
  prohibitively expensive

### 7. Execute & track (ongoing)
Stories go into whatever tool your devs use. The Remediation Backlog
mirrors them with status:
`Open → In Progress → Remediated → Tested → Operating Effectively`

The last two states are critical for audit — "remediated" ≠ "operating
effectively for the required testing period."

### 8. Operationalize evidence collection (continuous)
Set up recurring evidence capture **before** the auditor asks: quarterly
access review screenshots, change-log exports, exception reports. This
is where GRC tools (Vanta, Drata, AuditBoard) earn their cost — they
automate the screenshot/log capture.

---

## Worked example: SOX "Access Reviews"

### Generic control (from your catalog)
```
SOX-ITGC-AC-04: User access to financial systems is reviewed at least
quarterly, and access for terminated employees is removed within 24
hours.
```

### Applicability Matrix (rows for this one control)

| System | Applies? | Why |
|---|---|---|
| Oracle ERP | Yes | Source of GL, AP, AR |
| Loyalty engine | Yes | Generates liability journal entries |
| POS (Veras) | Yes | Source of transaction data feeding GL |
| Confluence | No | Documentation only, no financial data |
| Slack | No | Communications only |

### Gap Assessment (per applicable system)

| System | Status | Evidence | Note |
|---|---|---|---|
| Oracle ERP | Partial | Q1 review completed (link) | Q2 missed; no automated cadence |
| Loyalty engine | Gap | None | No access review process exists yet |
| POS (Veras) | Met | Q1+Q2 reviews completed (links) | Operating effectively |

### Stories (decomposed gaps)

```
STORY: SOX-AC-04-LOYALTY
Control: SOX-ITGC-AC-04
System: Loyalty engine
Current: No quarterly access review process; no termination workflow

Desired: Quarterly review report generated; HR termination event
         triggers loyalty-engine access removal within 24h

Acceptance Criteria (evidence-shaped):
  AC-1: Quarterly access review report exists for last 2 quarters,
        signed off by [control owner]
  AC-2: Sample 10 random terminated employees from HR; verify access
        removed in loyalty engine within 24h for all 10
  AC-3: Termination workflow tested with a fake termination event
        (test user); access removal logged within 24h

Effort:    M (2 sprints)
Severity:  High (key control)
Owner:     WS17 — Security & Identity
Tested by: Big 4 in Q4
```

Notice: AC are written to **satisfy an auditor**, not to describe a
feature. That's the compliance twist.

---

## Story template for compliance work

```
Control ID:         [e.g., SOX-ITGC-AC-04]
System(s) in scope: [name(s)]
Current state:      [Met / Partial / Gap / N/A]
Desired state:      [what "good" looks like in operational terms]

Acceptance Criteria (evidence-shaped):
  AC-1: …
  AC-2: …
  AC-3: …

Compensating control: [if relevant — what mitigates risk while
                       permanent fix is in flight]
Evidence to collect:  [screenshot / log / report / sign-off]
Frequency:            [one-time / monthly / quarterly]
Severity:             [High / Med / Low]
Effort:               [XS / S / M / L]
Control owner:        [name]
Engineering owner:    [name]
Auditor will test:    [Yes / No — and which audit]
```

---

## Cadence

| Frequency | Activity |
|---|---|
| Weekly | Remediation Backlog review (10 min per workstream owner) |
| Weekly | Decision Log review — open questions, owner+date or escalate |
| Monthly | Evidence collection check — anything missing? |
| Quarterly | Re-run Gap Assessment for remediated work; update status from "Remediated" → "Operating Effectively" after enough operating history |
| Annually | Refresh Applicability Matrix — new systems? deprecated systems? control catalog updates? |

---

## When (and how) to layer in tools

| Stage | Tool |
|---|---|
| **First pass** (1–2 weeks) | Excel/Sheets + your story tool (Jira). The 6 artifacts become tabs. |
| **Committed, audit coming** | GRC platform — Vanta/Drata for SaaS-heavy orgs; AuditBoard or ServiceNow GRC for enterprise. They automate steps 1, 4, and 8 — inventory, evidence, recurring tests. |
| **Mature program** | Continuous-controls-monitoring (CCM) integrations to your prod systems |

**Stay in Excel longer than you think.** Moving to a GRC tool before
you've shaped the matrix means you'll fight the tool's opinions and
yours simultaneously.

---

## The "Definition of Ready" check

A story can't enter a sprint until:

1. **Control reference** is present (which control(s) this satisfies)
2. **System(s) in scope** named explicitly
3. **At least 2 acceptance criteria** written in evidence-shaped form
4. **Zero open Decision Log items** linked to this story
5. **Control owner + engineering owner** assigned

This single rule prevents 80% of mid-sprint rework.

---

## Applying this framework outside compliance

The same pattern works for:

- **Vendor contracts** — extract SLA obligations → which systems implement them → gap-assess → stories
- **Accessibility (WCAG)** — load WCAG criteria → which UIs apply → audit → stories per failure
- **Internal coding standards** — catalog standards → which repos in scope → lint coverage → stories
- **Privacy law (GDPR, CCPA)** — extract data subject rights → which systems hold PII → process gaps → stories
- **Migrating off a deprecated service** — list usages → impact per system → effort estimate per usage → stories
- **Any "discovery" project** where a third party hands you a list of rules and you have to figure out what to actually build

The artifact names change ("Control Catalog" → "Standards Catalog",
"Applicability Matrix" → "Usage Inventory"), but the 6-artifact / 8-step
structure stays identical.

---

## The single insight worth tattooing on the back of your hand

> **You don't decompose generic controls into stories.**
> **You decompose (generic control × specific system) cells into stories.**

The multiplication is the work. Once you've named every cell, the
stories write themselves.
