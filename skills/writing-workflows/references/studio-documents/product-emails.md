---
title: Product Emails
knowledge_type: standard
domain: ponti-studios/projects
scope: writing-product-emails
status: active
updated: 2026-08-25
slug: product-emails
project: ponti-studios
owner: charlesponti
tags: [ponti-studios, playbook, product-emails]
applies_to: []
---
# Product Emails

Product email is an interface, not a newsletter. It should arrive for a reason, explain the value of one action, and get out of the user's way.

## Trigger contract

Every product email needs a defined trigger:

- **Event:** what happened in the product?
- **Audience:** who should receive the message, and who must not?
- **Timing:** why is this the right moment?
- **Value:** what can the recipient do now that is useful?
- **Exit:** when should this message stop sending?

Do not send an email merely because a team wants to announce a feature. Start with a user event or a user need.

## Message structure

### Header

State the useful action or outcome. A header such as "Your workspace is ready to review" is stronger than "Introducing our latest update."

### Body

Use no more than three sections, each no longer than three short sentences:

1. **Context:** connect the message to something the user did or needs.
2. **Value:** explain why the action matters now.
3. **Action:** give one primary call to action.

### Call to action

Use a specific verb. The destination should deliver what the email promised, work on the expected device, and preserve the user's context.

## Lifecycle rules

- Send only to people for whom the trigger is true.
- Make frequency and suppression behavior explicit.
- Stop reminders after completion, dismissal, or expiry.
- Do not use urgency that the product cannot substantiate.
- Include a path to manage or reduce non-essential communication.

## QA protocol

Before sending, test the message against the trigger, audience, link destination, mobile layout, accessibility, personalization fallback, and suppression logic. Preview the completed state as well as the first-send state.

## Measurement

Judge the email by the completed action and downstream value, not opens alone. Review delivery, clicks, action completion, unsubscribe or complaint rate, and whether the message caused support confusion.

## Writing checklist

- Is the trigger meaningful to the recipient?
- Does the header name the action or outcome?
- Does the body explain why the action is valuable now?
- Are there no more than three sections, each no longer than three short sentences?
- Is there one primary call to action?
- Does the message stop when it should?
- Does the destination fulfill the promise?
