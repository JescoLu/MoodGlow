# MoodGlow — Development process (work in progress)

**Status:** Technical proof of concept. This file must be expanded honestly before final Assignment 3 submission.

## Starting idea

Create a small, useful and artistic emotion-support interface. The user selects a current mood and a desired feeling; the site procedurally generates music while a HomePod-inspired blurred light field responds to its tempo. The intention is a pleasant exploratory experience, not diagnosis or treatment.

## Scope decision

The first test focuses on whether Strudel can be controlled through a custom website and whether JavaScript can drive a visual pulse from the same BPM parameter. Full spectral analysis, AI music-generation APIs, a live energy slider and site deployment are deliberately deferred.

## Initial implementation

- A custom HTML/CSS/JavaScript page with basic input and playback controls.
- Constrained music patterns combining melody, arpeggio, bass and a small rhythmic accent.
- Three music/color themes and four current-mood modifiers.
- A CSS aura driven by a local requestAnimationFrame clock using the configured BPM.
- Stop, Regenerate, and an explicit fallback mode when the Strudel CDN cannot load.

## Technical checks

- JavaScript syntax and mocked logic tests: see test_logic.cjs.
- Actual sound from Strudel and visible animation in a full desktop browser: **not verified in this environment**; must be tested on the user's Mac.
- The BPM clock may have a small offset from audible playback start. This is not frequency-based audio analysis.

## User testing — NOT YET COMPLETED

Recruit at least one person, ask them to try without instructions, observe what they do and where they hesitate. Record the observation and either an improvement made because of it or a justified decision to retain the design. Do not fabricate results.

## AI tool disclosure

ChatGPT was used to suggest the program structure, draft prototype code, discuss tradeoffs, and help define tests. The student still needs to listen, inspect, revise, and document **one AI suggestion kept and one modified or rejected**, when applicable.

## Credits

See README.md for Strudel and source links. Review license requirements and any added media before publication.
