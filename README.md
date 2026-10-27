# MoodGlow — Strudel × Light technical prototype

This is the **first technical proof of concept** for SD5913 Assignment 3, not the final polished interface or a finished submission.

It tests one action → response → feedback loop:

1. Choose one current mood: Sad, Stressed, Tired or Okay.
2. Choose one desired feeling: Uplifted, Calm or Refreshed.
3. Click **Generate & Play**. JavaScript creates a constrained random four-layer Strudel pattern (melody, arpeggio, bass, rhythmic accent).
4. The gradient aura pulses according to the same BPM sent to Strudel.
5. Click **Regenerate** to create another variation, or **Stop** to silence and reset.

The desired feeling chooses the principal music palette and colors. The current mood changes tempo, note density and some layer balance. Generated patterns loop until manually stopped.

## Run locally

In a fresh terminal, navigate to the folder containing this README, then run:

    python3 -m http.server 8000

Open http://localhost:8000 in a modern browser and click **Generate & Play**. The user click is necessary to unlock browser audio. Do not open the HTML directly with a file:// URL.

**Internet access is needed to load @strudel/web@1.0.3** from a pinned unpkg CDN URL. The **Preview light only** button lets you test the beat animation when Strudel is unavailable. No API key, paid service, GPU, microphone or custom audio samples are needed.

## What is implemented

- Custom browser UI (desktop-first, with basic narrow-screen layout).
- Four current mood options and three desired feelings.
- Rule-based note-pattern variations with Strudel synth sounds.
- Start, stop, regenerate, and state/error feedback.
- Color palettes based on goal: warm/Uplifted, blue-violet/Calm, mint/Refreshed.
- Central blurred glow and faint ambient background; both use the selected theme.
- A visual pulse based on the exact numeric BPM also configured in Strudel.
- Light-only demonstration mode for testing without a sound engine.

## Limitations and honest claims

- **This is BPM-synchronised, not audio-reactive.** The visual clock starts when music is requested, so a slight audible offset may occur due to browser/audio scheduling.
- Strudel uses procedural musical rules, not an AI text-to-music model. The user does not enter arbitrary text.
- Sound design and volume still need real-device listening tests and iteration.
- The CDN is an external dependency. Before final submission, add a short screen recording or another demonstrable fallback if the dependency is unavailable.
- A finished PROCESS.md, credits review, screenshot, real user trial, and visible development history are still needed for Assignment 3.
- MoodGlow is an exploratory soundscape, not a medical or therapeutic treatment.

## Manual acceptance test

- [ ] Start: audio plays and the glow pulses.
- [ ] Variation: Regenerate changes the number and melody; old music does not continue underneath.
- [ ] Stop: audio and animation stop; option buttons are enabled.
- [ ] Choose Calm or Refreshed: background, glow and audio pattern change.
- [ ] Choose Stressed versus Tired: BPM or pattern density changes.
- [ ] Turn off the CDN: the app shows a clear audio error and light-only mode works.
- [ ] Have a new user try the page without explaining it; record an observation and a design revision in PROCESS.md.

## Attribution

- [Strudel](https://strudel.cc/), integrated using @strudel/web@1.0.3. Its [official project documentation](https://strudel.cc/technical-manual/project-start/) identifies the AGPL-3.0 license and integration obligations.
- [MDN Web Audio autoplay guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) informed the click-to-play interaction.
- UI and procedural pattern prototype drafted with ChatGPT assistance. The final PROCESS.md should record the student's choices, verification, changes and AI-use details.
