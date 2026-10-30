# Product, UI copy, motion, design files

Thames-derived, written to apply to any product Charles builds. Check a design or PRD against this
list, name the principles it leans on, and say where it bends one.

## Experience
1. **One tap to start; voice first** where voice is the product. Anything that can be said needs no
   form. A new feature starts from the main control or a quiet row in Settings, not a new screen of
   choices.
2. **The person starts and ends every turn.** No auto-listen, no wake word, no silence detection, no
   timeout that ends or sends. People with ADHD or who are autistic pause long to think. Make
   *starting* easier (Action button, Siri, Watch, headset press); never automate it. *(word)*
3. **Say less.** Hints are one line and never wrap. A state that colour or an icon already says has
   no subtext. Prefer a symbol to a word, keep the word for accessibility. Counts appear in one
   place. Cut copy first.
4. **Calm, never alarming.** "No service", not "Failed". A lost connection is never "Error". Waiting
   is a state with its own shape, not a spinner plus a warning. Red is for real failures only. Every
   new state gets calm wording and a no-service version.
5. **It feels physical.** Motion follows the finger and has weight (spring, overshoot, settle).
   Haptics mark real boundaries. Reduce Motion always has a calm path. 60 fps measured on a device.
6. **Differentiated, not conventional.** When the standard pattern is the obvious one, look for a
   version that is better by taste or technology before settling.

## Component rules (Thames, reuse as defaults)
- The bottom dock never grows: one height in every state. A state that needs more is solved inside
  that height with icons. *(word)*
- Every round icon button is a tinted background plus a border in a lighter shade of the same colour,
  never a bare fill; buttons in one row are the same size. *(word)*
- A quiet dock has no red at rest. A failure shows in the dock's shape (an icon), not its colour.
  *(word)*
- Titles, labels and states shown in the app exist in the design file, and the reverse.

## Trust and honesty
- **Honest.** Only show what is real: no invented content, no counts the app cannot know, no states
  it cannot reach. A design shows only what the app can show today, or the board is labelled
  `[Not built]`. Costs are visible behind a small control.
- **You own what it knows.** Memory-like features are off by default, visible, deletable, with a
  brief undo. Anything that adds data about the person has a place to see it, delete it, and a clear
  off switch.
- **Works without service.** What is on the device shows at once and works offline; sync is quiet.
  Anything saved offline is kept and sent later.
- **The person is never the error handler.** Retries, syncing and reconciling are the app's job;
  bent only for failed service requests (see `code.md`, Errors).
- Origin and voice matter: lean on the real story of the product in copy, not generic "AI assistant"
  language. Thames: thinking out loud on a walk along a river.

## Design first (a rule, not a preference)
Never change code for a feature until its design is agreed.
1. Make **at least three radically different options** (a different idea, not a different colour or
   spacing). Put them in the feature's "Options considered" section. For animation needing live
   playback, make alternatives in the motion lab and link the study.
2. He chooses. Keep every option where it is, label the chosen one "(A chosen)", and update the
   built screens (all states, every screen the feature touches) to show only the agreed design.
   Controls used by more than one feature go in Components. Record timing and easing for motion.
3. Only then change code. If code needs something the design does not show, go back to the design.
- Build the options so he can **feel** them — runnable, not described: "build all three so i can feel
  them". They are throwaway prototypes; production code waits for the pick.
- Exempt: a bug fix with no visible change. Not exempt: any change to how something looks, however
  small. Say what the three directions would be and ask which.
- Read the repo's own principles skill (`product-principles` in Thames) before drawing any option; this
  skill is the global fallback where a repo has none.
- Design files are organised by what a person looks for, not by device: Core (mechanics that do not
  change), Components (shared pieces), one page per feature. The design file is the source of truth;
  the motion lab is the review surface for animation.

## Design laws

Carried here from `ponti-principles` so the skill's laws stay code craft. The copy, motion, icon and
design-first rules already stated above are the same rules; these are the ones stated only there.

- **Results before configuration.** Show the content first (Airbnb pattern); filters as pills alongside, in
  a sheet on mobile. Never gate the content behind upfront choices.
- **Minimal chrome.** The content surface takes the full display; controls live in hideable sheets. Show
  one representation of a thing, not two — a link or a status tag, not both.
- **One design system, single options.** Variation is a defect; if variants proliferate, squash them into
  the system. Cross-platform drift (wrong icon, wrong styles on one platform) is a bug.
- **Uniform grids, fixed at the container.** All cards and posters the same height, handled by grid/flex
  children — never by patching individual cards.
- **Micro-typography is specified.** Small, tight, phone-first text and padding; measurements and labels in
  light weight at the exact sizes he gives. Components must not be massive.
- **Motion shows cause and effect** — tokens appear as the cursor moves, a pen draws the line as it
  travels, animation starts when the component is in view. If a rebuild drops a signature effect (hover
  mouse-tracking), that is a regression: restore it.
- **"From scratch" means a new concept**, not a restyle of the last one. Redesigns go back to first
  principles and may copy a named reference (joinvoy.com, dove.email) — name yours.
- **A deck's slides do the narrative work.** No machine/overview panels, no weak ledes, controls inside
  their cards, URL hashes so a slide can be shared. Across a set, frames match and the story reads from
  the images alone: same props, same cases, cause and effect visible in-frame.
- **Positioning before interface.** If the product's category framing is unsettled ("dashboard" vs
  "text → LLM → dynamic UI"), settle that first; don't design cards for an undecided product.

## PRDs
- Live in `docs/prd/`. Read the thesis and principles first; name the principles leaned on and any
  bent. Answer open questions with them.
- When work lands, tick the PRD's Progress list and add to its Decision log in the same PR. If a
  screen changes, update the design file first; if motion changes, update the motion study first.
- Unresolved decisions are marked `OPEN — USER DECISION REQUIRED`, not decided silently.

## Teach as we go
- Where the repo has a teaching layer (course, blog, teaching comments), keep it in step with the
  code. Understanding is part of the product of building it.
