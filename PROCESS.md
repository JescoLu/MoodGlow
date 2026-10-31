# MoodGlow — Development Process

Current review build: V13.5 (local preview; not yet the public GitHub submission)

## 1. Starting idea and goal

I wanted to create a small experience that connects a practical interaction with an artistic response. The initial idea was an interface in which a user chooses how they currently feel and how they would like to feel, then receives generated music together with animated light. The goal was not to diagnose emotion, but to make the relationship between input, sound, visual response, and feedback understandable and enjoyable.

I deliberately kept the input simple: four current-mood buttons and three desired-feeling buttons. The website uses browser technologies and does not require a microphone, account, or paid AI audio service.

## 2. First working prototype

The earliest working version combined HTML, CSS, JavaScript, and Strudel. It tested whether a button could initiate procedurally arranged sound and whether the same musical tempo could guide a light animation. I implemented Generate & Play, Stop, and Regenerate, then tested playback and error handling locally.

The first stable technical version was committed to my public GitHub repository as 0370404 and tagged v0.1.0. Later design and music experiments were tested as local preview builds. These preview version numbers are not claims that every iteration was separately committed to GitHub.

## 3. Changes to music and interaction logic

Music arrangement: In listening tests, the first compositions felt too similar, with repetitive lead instruments, long gaps, and mechanical rhythm. I experimented with longer 32-bar structures, different instrument combinations, continuous accompaniment, and changing melodic phrases. The three final desired feelings became distinct musical directions: lively pop for Uplifted, piano-led music for Calm, and retro-inspired electronic pop for Refreshed.

Separating the two questions: The early design allowed the four current moods to modify musical parameters. When I compared Sad → Refreshed with Stressed → Refreshed, for example, those differences were difficult to hear. I changed the interaction model: Current Mood now controls the light shape and movement, while Desired Feeling controls the musical style and color palette. This also makes the two questions easier to explain.

Audio debugging: A later Uplifted arrangement was silent even though the interface displayed a playing status. Chrome's Console reported missing sample names. An attempted sample-loader fix then prevented all three styles from initializing. I asked ChatGPT and revised the implementation so that Uplifted uses bundled synthesized WAV sounds through the native Web Audio API, while Calm and Refreshed retain Strudel. Another issue required users to click twice on initial playback; waiting for Strudel's music functions to become available fixed the initialization sequence. I tested the resulting playback in Chrome.

## 4. Visual iteration

The first glow was a small, blurred shape with a simple BPM pulse. I expanded it into a near-full-screen Canvas light field, moved the controls below the visual, and placed the project description in an About dialog. Music and light remained linked through calculated accents rather than live audio analysis.

The four current moods were given separate visual behaviors: scattered drifting forms (Sad), diagonal crossing ribbons (Stressed), rising columns (Tired), and orbiting shapes (Okay). During later refinement I restored the softer Sad visual from an earlier version, reduced overly strong beat-driven changes, and then adjusted them to a moderate level. I also made the Tired columns fade out before wrapping from the top to the bottom, slowed Stressed when idle, and differentiated light-flow speed by desired feeling: Uplifted faster, Calm slower, and Refreshed in between.

## 5. User trial and response

I asked a friend to try MoodGlow. Their feedback identified two usability issues:

1. Redundant navigation: They felt that Back to Choices was unnecessary because pressing Stop already let them change the selections.

2. Weak visual distinction: They found the results for different current moods under the same desired feeling too similar.

My response: I removed Back to Choices and strengthened the visual differences between the four current moods while keeping the music mapped to the desired feeling. Later, I refined individual visuals and removed the separate Preview light only control to simplify the interface further.

## 6. AI use and design decisions

I used ChatGPT as a development assistant to propose interface structures, draft and revise HTML/CSS/JavaScript, suggest music-pattern approaches, inspect errors, and prepare test cases and documentation. I supplied musical and visual feedback from repeated browser tests and chose which revisions to retain.

- Suggestion kept: Using generated musical event timing to drive light accents rather than adding a microphone-dependent audio-analysis feature. This was feasible for the assignment and kept the interaction understandable.

- Suggestion changed or rejected: The initial plan to make current mood modify the music produced differences that were hard to perceive. I replaced it with a clear visual mapping. I also rejected several early bass-heavy or overly repetitive Uplifted arrangements after listening.

## 7. Current limitations and reflection

MoodGlow is a small creative prototype rather than a therapeutic product. The musical patterns are procedurally arranged, not AI-generated audio. Calm and Refreshed depend on the external Strudel library; Uplifted plays local WAV samples. The light follows programmed note and drum accents, so precise synchronization with Strudel audio is approximate. Browser and device performance may vary.

The most important lesson was that a technically working animation is not automatically a meaningful interaction. Separating the two types of choices made each input more legible. User feedback also showed that removing an unnecessary button could improve the experience more than adding another feature.

## 8. Credits and development record

Strudel (@strudel/web@1.0.3) provides the music-pattern engine for Calm and Refreshed. The interface uses standard browser Web Audio and Canvas APIs, and the sounds/ folder contains project-specific synthesized WAV files. ChatGPT contributed implementation drafts and debugging support. Commercial songs were used as private listening references only; no commercial recordings are included in the submitted project files.

The baseline GitHub commit is `0370404` (`v0.1.0`). Subsequent iterations were developed and tested locally. After several rounds of refinement and user feedback, V13.5 was selected as the final version for submission.
