---
name: kernel-init
kind: command
tags:
  - kernel
  - setup
description: Initialize the local Kernel brain, detect hosts, import legacy
  skills, and run the first sync.
group: system
target: init
---

Use this when Kernel is not set up yet in the current environment.

What this does:

- Initializes the local Kernel home and catalog.
- Detects supported agent hosts.
- Imports legacy local skills when available.
- Syncs the generated catalog into each enabled host.

When to use it:

- First-time setup on a machine.
- Repairing a missing or incomplete Kernel home.

What to do next:

- Run `kernel-sync` after changing packages or templates.
- Run `kernel-doctor` if a host looks out of date or broken.
