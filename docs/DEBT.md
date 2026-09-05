---
type: canonical
source: none
sla: on-change
last_updated: "2026-09-05"
audience: [maintainers, contributors]
---

# Technical Debt Ledger

This ledger records deliberate, unresolved tradeoffs that affect the public
project. Its purpose is to keep debt visible, scoped, and reviewable rather
than to require zero debt.

## Maintenance rule

Add an entry when a change intentionally defers a durable improvement. Remove
an entry only when the follow-up is complete, and reference the resolving pull
request in the removal commit.

## Entry format

### Short title

- **Date:** YYYY-MM-DD
- **Where:** file, component, or workflow
- **What:** the deferred work and the reason for deferral
- **Risk if left:** the expected maintenance or user impact
- **Suggested fix:** a bounded corrective action
- **Owner:** a maintainer responsible for review

## Current entries

No tracked technical-debt entries.
