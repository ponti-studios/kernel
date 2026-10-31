---
title: Product Metrics
knowledge_type: standard
domain: ponti-studios/projects
scope: defining-product-metrics
status: active
updated: 2026-08-25
slug: product-metrics
project: ponti-studios
owner: charlesponti
tags: [ponti-studios, playbook, product-metrics]
applies_to: []
---
# Product Metrics

## Decision rule

Track a metric only when it can change a decision. A number without an owner, target, cadence, or action is decoration.

## Metric hierarchy

Start with the product outcome, then work backward:

1. **Outcome:** what meaningful change should the product create?
2. **Behavior:** what user behavior would indicate progress toward it?
3. **Quality:** was the behavior useful, successful, and sustainable?
4. **Guardrail:** what must not degrade while optimizing the primary behavior?

Avoid choosing a metric because it is easy to query. Choose it because it helps distinguish progress from activity.

## Metric contract

Use this template for every metric group:

### <Metric group>

_What product goal does this group help us understand?_

- **Question:** _What should this group tell us about the product?_
- **Outcome:** _What user or business result are we trying to change?_
- **Metric:** _What behavior or result will we measure?_
- **Definition:** _What exactly is included, excluded, and deduplicated?_
- **Direction:** _Which way indicates progress?_
- **Target range:** _What range indicates healthy progress?_
- **Cadence:** _How often will we review it?_
- **Owner:** _Who interprets it and acts on it?_
- **Decision:** _What will we do if it is above, below, or inside the range?_
- **Guardrail:** _What must remain healthy while we optimize this metric?_

## Example: discovery

**Question:** Can users quickly locate and connect with the kind of profile they are looking for?

- **Outcome:** Users find relevant profiles with low search friction.
- **Metric:** Percentage of Explore visits that require a second results page.
- **Definition:** Count unique Explore visits with a second-page request divided by all Explore visits with at least one result.
- **Direction:** Lower is better, provided meaningful connection activity does not fall.
- **Target range:** Fewer than 50% of Explore visits require a second page.
- **Cadence:** Review weekly alongside qualitative search feedback.
- **Owner:** The product owner responsible for discovery.
- **Decision:** If the rate rises, inspect relevance, filters, ranking, and result density before adding more features.
- **Guardrail:** Do not optimize page progression by hiding relevant results or reducing the number of meaningful connections.

## Review loop

1. Review the metric at its stated cadence.
2. Annotate releases, experiments, incidents, and external events.
3. Compare the result with the target range and guardrails.
4. Decide whether to continue, investigate, change, or retire the intervention.
5. Record the decision and its expected evidence.

Do not react to a single noisy movement unless the cost of waiting is higher than the cost of acting.

## Anti-patterns

- Vanity metrics with no decision attached.
- Composite scores whose components hide opposing movements.
- Targets with no time window or population definition.
- Optimizing a proxy while the underlying outcome declines.
- Dashboards nobody owns.
- Changing the definition after seeing an inconvenient result.

## Review checklist

- Is this tied to a product outcome?
- Is the definition reproducible?
- Is the direction of success unambiguous?
- Does the target account for normal variability?
- Is there a guardrail against harmful optimization?
- Does someone own interpretation and follow-through?
- What decision will the next review produce?
