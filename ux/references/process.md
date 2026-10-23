# Process

## Taking a request

Ask for (or write down) the job, not the UI:

> **I want to:** see which ad networks failed during a test run
> **How often / when:** after every build, scanning quickly
> **What I need first:** whether anything failed at all, then which ones

Then choose the page pattern (`pages.md`) and components. Don't ask the person to
describe the layout.

## Mockups first

For a new page or a change bigger than a tweak, make **two or three quick mockups**
(a small HTML page using `assets/components.css` and the project's style) before
writing app code. Let the person pick: "B, with A's table". Then build.

## Complaints become rules

When the person dislikes something: fix it **and** add one line to the project's
"things I don't like" list (in its `AGENTS.md`) or, if it applies to every tool, to
these references. The same complaint should never come back.

## Self-check before saying done

Take a screenshot at each width and go through this list. Fix what fails.

- [ ] The page follows one pattern from `pages.md`; summary before detail.
- [ ] No raw colours, fonts or radii; only contract roles.
- [ ] Every active filter, rule, option and highlight is visible.
- [ ] The main action is the only accent-filled button in its area.
- [ ] Every status shows a word, not only a colour.
- [ ] Loading (skeleton + status line), empty, error and success states all exist.
- [ ] Reversible actions have Undo; permanent ones ask to type the name.
- [ ] Wide, tablet (rail) and phone (tab bar) all work; no horizontal page scroll.
- [ ] Everything works by keyboard; focus is visible; touch targets ≥ 44 px on phone.
- [ ] Copy is plain and specific; errors say what happened and what to do.
- [ ] Checked in dark and light, and in at least two palettes.
- [ ] Reduced motion: nothing moves, final states show straight away.
