# MoodGlow — Confirmed design decisions (27 October 2026)

These choices were confirmed by the project owner in conversation before technical development.

1. **Project:** MoodGlow, an interactive emotional soundscape web experience for SD5913 Assignment 3.
2. **Music generation:** B — procedural, rule-based Strudel generation (not paid AI music).
3. **Glow rhythm:** A — BPM/beat-synchronised first; real audio analysis is an optional upgrade.
4. **Input mode:** A — preset mood tags, not free-text emotion analysis.
5. **Two-step input:** users actively select a desired feeling after current mood.
6. **Playback duration:** A — loop until the user presses Stop.
7. **Mapping:** A — desired feeling defines the main music style; current mood modifies detail.
8. **Current moods:** Sad, Stressed, Tired, Okay.
9. **Desired feelings:** Uplifted, Calm, Refreshed.
10. **Playback controls:** A — Play/Stop, Regenerate, Back. Real-time Energy Slider (C) only after the assignment MVP if time permits.
11. **Primary surface:** A — desktop-first website; mobile polish later.
12. **Overall appearance:** C — both page background and glow palette change by desired feeling.
13. **Glow layout:** C — central glow plus ambient background; a full-screen moving gradient (B) can replace it later if feasible.
14. **Deployment:** C — prioritise the locally runnable app; deploy a live site only if time remains.
15. **Implementation order:** A — technical Strudel + beat-glow validation before high-fidelity UI.

## Explicit scope boundary

For the assignment MVP, prioritise one stable input → procedural sound → beat light → feedback loop. Do not build user accounts, long-form AI mood parsing, automatic therapy claims, audio spectral analysis, or persistent history before the core interaction and user test are complete.

## Project still to do

- Verify **audible** Strudel output and visual rhythm in a real Mac browser.
- Revise the composition after listening to all three goals and four current-mood modifiers.
- Design and implement the final UI/UX after the technical spike.
- Conduct a new-user trial **before explaining the controls**; record observed hesitations and a resulting decision.
- Capture screenshot/short recording, complete process notes, credit external sources, make real Git commits, publish the project repository, and submit its public URL to Canvas by **1 November 2026, 23:59 Hong Kong time**.
