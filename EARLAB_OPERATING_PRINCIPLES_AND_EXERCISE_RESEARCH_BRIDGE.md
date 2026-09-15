# EarLab: Operating Principles, Current Exercises, and Research-to-Curriculum Bridge

**Purpose:** This document explains how EarLab currently operates, catalogs its active exercise system, and translates the existing research report into a practical brief for improving and expanding the curriculum.

**Companion source:** [`deep-research-report (1).md`](./deep-research-report%20(1).md) contains the full evidence review and original-source register. This document does not replace that research; it turns it into product and exercise decisions.

---

## 1. Product thesis

EarLab is a **functional ear-training and audiation platform**, not primarily an interval-naming quiz. Its target ability is for a musician to hear and maintain a tonal centre, understand pitches as relationships to that centre, imagine those relationships internally, perform them, and reconstruct melodies in unfamiliar contexts.

The core learning loop is:

> **Establish tonic → audiate → retrieve or perform → receive correction after an attempt → identify a weakness → revisit later → transfer the skill to a less supported musical context.**

This design is built around four linked but independently leveled abilities:

| Track | Skill direction | Core question |
|---|---|---|
| A — Degree Singing | number → internal hearing → voice | “Can I produce this function without being given the answer?” |
| B — Degree Recognition | heard pitch → functional label | “Can I identify what this pitch is doing relative to tonic?” |
| C — Melody Singing | visible degree phrase → audiation → voice | “Can I internally hear and sing a connected phrase?” |
| D — Melody Transcription | heard phrase → internal representation → degree sequence | “Can I reconstruct what I heard?” |

The system uses scale degrees `1–7` as its primary functional language. Movable-do solfège and note names are optional display modes, not prerequisites.

---

## 2. Current operating principles

### 2.1 Functional pitch before isolated labels

EarLab teaches the role of a note inside a key. `7` is not simply “a major seventh”; it is a leading tone with a pull toward `1`. This lets learners generalize across keys instead of memorizing absolute note names or disconnected interval sounds.

### 2.2 Retrieval before feedback

The interface asks the learner to answer, sing, or enter a phrase before it reveals the target. On an incorrect answer, the intended flow is retry, replay, slow playback, or reveal—not an immediate correction. The system records first-attempt success separately from assisted success.

### 2.3 Independent tracks rather than one global level

Learners progress separately in singing, recognition, melody singing, and transcription. A learner can therefore be strong at hearing a single degree but still need early work in melodic dictation. This avoids a misleading all-purpose “level.”

### 2.4 Progressive removal of scaffolding

Tonic cadence and drone support are strong at the beginning, periodic at intermediate levels, and sparse at later levels. The instructional aim is internal tonal retention, not permanent dependence on a drone.

### 2.5 Adaptivity based on evidence, not engagement

EarLab stores attempt counts, first-attempt accuracy, assisted/retry outcomes, reveals, degree-level mastery, and systematic confusions. Degree mastery is modeled with a simple Beta-Bernoulli update; the weakest degree within an exercise’s allowed set receives additional attention.

### 2.6 Promotion requires repeatable mastery

Each level has an 85–90% first-attempt threshold. A learner needs three qualifying sessions across at least two calendar days before moving forward. This discourages one lucky high score from being treated as stable learning.

### 2.7 Local-first practice

Progress is stored locally, can be exported as JSON or CSV, and works offline after the PWA and audio assets are cached. Studio Grand Piano samples now provide a richer default instrument; pure reference tone remains available for neutral pitch calibration.

---

## 3. Current exercise engine

### Shared exercise controls

All active exercises can use:

- Key and scale selection (major or natural minor)
- Studio Grand Piano, warm EP fallback, or pure reference timbre
- Hear Tonic / cadence
- Optional tonic drone
- Replay and slower playback for listening tasks
- Keyboard entry (`1–7`, Backspace, Enter) for relevant tasks
- Optional microphone pitch meter for singing tasks

### Exercise generation rules

The engine generates phrases inside each level’s constraints:

- allowed degrees
- phrase length
- maximum interval
- major or natural-minor context
- level-specific tonic support
- weak-degree targeting

This is **constrained generation**, not unrestricted random note selection. It creates practice material that remains within the intended tonal and memory envelope.

### Feedback and measurement

| Outcome | What EarLab records | Pedagogical meaning |
|---|---|---|
| Correct first attempt | Full positive mastery evidence | Independent retrieval |
| Correct after retry | Partial positive evidence plus retry count | Learner recovered with support |
| Reveal | Negative mastery evidence plus reveal count | Answer was not independently retrieved |
| Wrong entered degree | Confusion-pair count, e.g. `6 → 5` | Specific perceptual or functional confusion |

---

## 4. Existing curriculum

### Track A — Degree Singing

**Task:** The learner hears tonic, sees a degree or short degree phrase, internally hears it, sings it, then verifies against the reference and self-rates or uses the pitch meter.

| Levels | Current progression |
|---|---|
| A1–A4 | `1, 3, 5` anchors → pentachord → add `6` → all seven major degrees |
| A5–A6 | Two-note degree pairs → three-note melodic cells |
| A7–A8 | Sparse tonic retention → key and register transfer |
| A9–A10 | Natural minor function → advanced major / wider-leap expansion |

**Current strength:** It places overt singing after internal hearing rather than merely imitating a played answer.

**Current limitation:** Phrase-level singing is primarily self-verified. The microphone supports single-note pitch feedback, but does not yet objectively segment and score an entire sung melody.

### Track B — Degree Recognition

**Task:** The app establishes tonal context, plays one pitch, and the learner selects its scale degree.

| Levels | Current progression |
|---|---|
| B1–B2 | `1` vs `5` → `1, 3, 5` triad anchors |
| B3–B6 | Add `2` → pentachord → add `6` → all seven major degrees |
| B7–B8 | Sparse tonic retention → key, register, and timbre transfer |
| B9–B10 | Natural minor → faster mixed-context recognition |

**Current strength:** It treats recognition as tonal function and records specific degree confusions.

**Current limitation:** It is currently single-note only. It does not yet test harmonic context, cadence function, interval-in-context, or rhythm-integrated recognition.

### Track C — Melody Singing

**Task:** The learner sees a degree phrase, audiates it before sounding it, sings it, then plays the reference phrase to compare.

| Levels | Current progression |
|---|---|
| C1–C3 | Three-note anchor cells → stepwise pentachord → steps plus thirds |
| C4–C6 | Six-note expansion → full-major six-note phrases → eight-note melodies |
| C7–C8 | Larger leap control → 12-note two-part major phrases |
| C9–C10 | Natural-minor phrases → 14-note advanced audiation |

**Current strength:** Phrase length, interval size, tonal support, and key transfer are increased gradually.

**Current limitation:** Generated phrases need a stronger motif and cadence vocabulary to ensure they consistently sound musical rather than merely valid.

### Track D — Melody Transcription

**Task:** The learner hears a phrase and enters the exact degree sequence using the tactile keypad. They can replay, slow playback, and clear their answer before checking it.

| Levels | Current progression |
|---|---|
| D1–D2 | Two-note and three-note anchor cells using `1, 3, 5` |
| D3–D6 | Stepwise four-note phrases → mixed steps/thirds → six-note expansion → all degrees |
| D7–D8 | Eight-note melodic phrases → 10-note advanced-major phrases |
| D9–D10 | Natural-minor transcription → 12-note virtuoso dictation |

**Current strength:** It requires auditory reconstruction rather than multiple-choice guessing.

**Current limitation:** It has no rhythm notation/entry, phrase chunking interface, or curated repertoire-derived melodies yet.

---

## 5. Research alignment

The existing research report supports the platform’s central design choices and also exposes its next curriculum gaps.

| Research principle | Already represented in EarLab | Needed improvement |
|---|---|---|
| Retrieval practice | Answer before reveal; retry-first error protocol | Schedule delayed return of failed skills, not only immediate retries |
| Distributed practice | Multi-day promotion gate; short sessions | Add an explicit due-review queue and review intervals |
| Blocked → interleaved practice | Levels constrain degree sets before expanding | Add purposeful mixed-review sessions after initial acquisition |
| Active singing and audiation | Tracks A and C | Add objective phrase scoring and preparation routines |
| Tonal orientation | Hear Tonic, cadence, drone | Make tonic withdrawal and re-establishment measurable skill dimensions |
| Dictation and reconstruction | Track D | Add rhythm, notation, chunking, and eventually two-part dictation |
| Transfer | Key, register, and timbre progression exists | Use deliberately varied timbre and unseen curated material after mastery |
| Spiral curriculum | Major → minor and longer phrases | Add modes, harmonic/melodic minor, chromatic function, rhythm, and harmonic context |

Important research guardrails from the companion report:

1. Do not treat any precise promotion percentage or review delay as settled scientific fact; treat it as a product hypothesis to validate with delayed transfer.
2. Do not force singing before every dictation task. Singing can help preparation, but mandatory individual singing before notation can be counterproductive in some contexts.
3. Do not make a drone permanent. Use it as a scaffold and test whether tonic survives after it is withdrawn.
4. Do not introduce all sources of difficulty at once. Phrase length, rhythm, leap size, tonal ambiguity, timbre, and key transfer should be controlled separately.
5. Do not equate completion with learning. The primary success measure is later performance on unseen material.

---

## 6. Recommended exercise expansion

### Phase 1 — Strengthen the current four tracks

These additions fit the present data model and exercise engine with limited architectural change.

| New exercise | Track | Learning goal | Core mechanics |
|---|---|---|---|
| Tonic re-establishment | A/B | Retain and recover tonic after silence | Hear cadence, wait 5–20 seconds, then sing or identify `1` |
| Resolution pairs | A/B | Hear directional function | Sing or identify pairs such as `7→1`, `4→3`, `2→1`, `6→5` |
| Confusion contrast | B | Repair a documented confusion | Play learner’s confused pair in alternating order, then test a new target |
| Contour-first dictation | D | Separate shape from exact pitches | First select up/down/same contour; then enter degrees |
| Chunked transcription | D | Improve phrase memory | Listen to an 8–12 note phrase in two marked subphrases; transcribe each chunk then the whole |
| Cadence completion | C/D | Hear phrase endings | Hear or see a phrase with final note missing; sing/select/write the resolution |
| Motif variation | C/D | Generalize an internalized cell | Hear/see a motif, then identify or sing its transposed/altered continuation |
| Delayed recall review | A–D | Consolidate memory | Re-test a previously weak degree/cell after later exercises or a future session |

### Phase 2 — Add rhythm and musical context

These exercises require representing rhythm and possibly adding a rhythm input UI.

| New exercise | Primary track | Progression |
|---|---|---|
| Rhythm echo and dictation | New Rhythm track or D extension | Pulse → simple durations → syncopation → compound meter |
| Rhythm-plus-degree dictation | D extension | 2–4 note pitch/rhythm cells → short phrases → compound and mixed meters |
| Sight-singing with pulse | C extension | Degree phrase with metronome → prepared rhythm → phrase-level performance |
| Meter and phrase hearing | Listening lab | Identify beat, meter, cadence point, antecedent/consequent shape |
| Harmonic-bass function | B extension | Hear bass `1–4–5–1` → identify chord-root function → hear inversions later |

### Phase 3 — Expand tonal vocabulary

Add these only after major-key functional fluency is stable.

| Domain | Suggested sequence |
|---|---|
| Minor | Natural minor → harmonic minor leading tone → melodic-minor ascent/descent |
| Modes | Dorian and Mixolydian first, then remaining common modes with explicit tonic context |
| Chromatic function | `♭7`, `♯4`, applied leading tones, borrowed tones; always taught in a tonal phrase, not as isolated labels |
| Modulation | Common-tone pivot → simple dominant-to-new-tonic → short modulating melodies |
| Harmony | Cadence quality, chord members, bass function, two-part and eventually three-part dictation |

### Phase 4 — Transfer and authentic musicianship

| New exercise | Why it matters |
|---|---|
| Curated melody bank | Tests transfer beyond generated patterns; every item should be tagged by tonal, rhythmic, and phrase features |
| Timbre transfer | Once a skill is stable, test piano, EP, voice, strings, and clean synthetic reference without changing the underlying tonal task |
| Register transfer | Separate pitch-function knowledge from a narrow vocal/instrumental register |
| Call-and-response | Connects functional hearing with real musical interaction |
| Repertoire micro-extracts | Bridges abstract degree work to musical literature, with clear rights/attribution handling |

---

## 7. Exercise authoring rules

Use these rules for every new exercise type and content bank.

1. **Name the target skill.** Example: “recognize `6` versus `5` after sparse tonic,” not merely “harder recognition.”
2. **Control one main difficulty dimension at a time.** Increase phrase length *or* leap size *or* tonic sparsity before combining them.
3. **Keep the first attempt clean.** Do not play the target answer immediately before the learner performs or labels it unless the activity is explicitly imitation practice.
4. **Use meaningful musical constraints.** Favor motifs, sequences, stepwise motion, cadences, and phrase shapes over uniformly random degree strings.
5. **Tag every item.** At minimum: key, scale, degrees, contour, max interval, phrase length, cadence, rhythm, timbre, exercise type, and source/version.
6. **Design feedback for another retrieval attempt.** Feedback should explain a useful relation—such as “`7` resolves to `1`”—then schedule an analogous new item.
7. **Measure transfer.** Include unseen items in a different key, register, rhythm, timbre, or melodic surface before declaring mastery.
8. **Keep a fallback path.** Audio, microphone, and offline limitations must never make an exercise impossible to complete.

---

## 8. Metrics for evaluating the revised exercises

New exercises should be evaluated by learning evidence, not only usage.

| Metric | What it answers |
|---|---|
| First-attempt accuracy | Was the skill independently retrieved? |
| Assisted accuracy | Did feedback lead to eventual understanding? |
| Delayed-review accuracy | Did the learning persist? |
| Transfer accuracy | Does the skill survive a new key, timbre, rhythm, or melody? |
| Confusion-pair rate | Which relationships are systematically misheard? |
| Replay/reveal rate | Is the exercise under- or over-scaffolded? |
| Time to response | Is recognition becoming fluent without sacrificing accuracy? |
| Progression validity | Do promoted learners succeed on unseen material at the next level? |

Recommended experiments for the next release:

- Compare immediate repetition against delayed, analogous review for common confusions.
- Compare blocked introduction then interleaving against fully mixed practice.
- Compare continuous drone, periodic tonic, and sparse tonic for the same skill.
- Compare generic generated phrases with motif-constrained phrases on delayed transfer.
- Compare optional preparatory singing with no singing before transcription; do not assume one mode fits every learner.

---

## 9. Suggested curriculum-update order

1. Add **due review** and confusion-contrast exercises to the current A–D tracks.
2. Improve the phrase generator with curated motif, contour, and cadence templates.
3. Add contour-first and chunked transcription before extending D-track phrase length further.
4. Add tonic-retention and resolution-pair tests to measure scaffold withdrawal directly.
5. Build rhythm as a distinct competency, then integrate rhythm and pitch.
6. Extend minor beyond natural minor, then add modes and chromatic function.
7. Add curated transfer material, timbre transfer, and later harmonic/two-part dictation.

---

## 10. Bottom line

EarLab already has a strong functional-ear foundation: independent skill tracks, retrieval-first feedback, progressive tonal support, adaptive degree mastery, multi-session promotion, high-quality piano playback, and local-first practice.

The highest-value next step is not simply adding more random questions. It is expanding the curriculum with **purposeful exercise families** that build tonic retention, directional resolution, contour and chunking, delayed retrieval, rhythmic competence, and transfer to unfamiliar musical contexts. The research should guide the principle—**learn tonal relationships deeply enough to retrieve them later in real music**—while learner telemetry determines the exact thresholds, review intervals, and exercise balance.
