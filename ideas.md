# Design Direction — Akbar Nawasu Portfolio

## Three candidate approaches

### Theme Name: Analog Signal Desk
Very Brief Intro: A tactile editorial portfolio that treats music, code, and experiments like artifacts on a studio workbench. Warm paper, ink-black UI, and acid chartreuse details create a smart, handmade atmosphere.
Probability: 0.04

### Theme Name: Soft Brutalist Archive
Very Brief Intro: A high-contrast archive with oversized typography, hard rules, modular metadata, and deliberately exposed structure. It feels direct, collectible, and built for scanning.
Probability: 0.07

### Theme Name: Nocturne Instrument Lab
Very Brief Intro: A dark, immersive instrument interface where projects feel like playable pieces in a live set. Restrained glow and deep blue-black surfaces support the existing audio, Three.js, and canvas experiments.
Probability: 0.02

## Selected Approach: Analog Signal Desk

### Design Movement
Contemporary editorial brutalism with analog studio references: catalog labels, calibration marks, index cards, and instrument-panel affordances translated into a responsive portfolio.

### Core Principles
1. **Artifact-first hierarchy:** Work samples, releases, experiments, and tools are presented as tangible objects rather than generic cards.
2. **Useful tension:** Pair calm off-white surfaces with sharp black rules and one unmistakable acid chartreuse accent.
3. **Editorial asymmetry:** Use offset columns, side notes, numbered sections, and horizontal overflow to avoid a centered template feel.
4. **Preserve the instrument:** Existing vanilla JavaScript interactions remain the source of truth; React wraps and routes the experience without rewriting behavior.

### Color Philosophy
The palette borrows from a studio notebook: warm mineral paper is the field, carbon black is the ink, muted steel is supporting notation, and acid chartreuse is the live signal. The chartreuse is intentionally rare so it marks active states, controls, and moments that deserve attention.

### Layout Paradigm
A persistent left rail acts like a tape-label index while the main canvas flows through offset editorial sections. Hero content uses a split composition with a large typographic statement, a live visual field, and a compact metadata column. Detail pages use a document spine rather than a generic centered container.

### Signature Elements
- Calibration ticks and monospaced metadata labels around major sections.
- Acid chartreuse “signal” bars, cursor accents, and active-state underlines.
- Paper grain, thin carbon rules, and small stamped index numbers.

### Interaction Philosophy
Interactions should feel like operating a physical instrument: buttons have a clear pressed state, tabs expose a channel, and hover reveals metadata rather than decorative motion. Existing audio and canvas features should remain immediate, keyboard-reachable, and respectful of reduced-motion preferences.

### Animation
Use short, physical transitions under 260ms for controls, with transform and opacity only. Reveal sections with slight horizontal offsets, staggered by 40ms, while keeping keyboard navigation instant. The live visual field can breathe continuously, but never compete with readable content; disable non-essential motion under `prefers-reduced-motion`.

### Typography System
Use **Space Grotesk** for display and UI headings, paired with **IBM Plex Mono** for metadata, labels, timestamps, and control readouts. Display headlines are tight and oversized; body copy stays at a readable measure; mono labels use uppercase and generous tracking.

### Brand Essence
A working archive for Akbar Nawasu’s music, code, and playable experiments—made for curious collaborators who want to see the craft, not just the finished surface. Personality: **restless, tactile, precise**.

### Brand Voice
Headlines are concise and declarative. CTAs sound like invitations into the workbench, not sales language. Microcopy is observant, lightly technical, and never filler.

Example lines:
- “Make the signal visible.”
- “Open the instrument.”

### Wordmark & Logo
Use a compact AN monogram built from two offset signal bars: an angular A formed by a rising line and a counterform N that reads like a waveform step. The mark should work as a square stamp, favicon, and small header badge without relying on text.

### Signature Brand Color
**Signal Chartreuse — `#C7F36B`**. It is ownable because it behaves like a live indicator against the otherwise archival palette.

## Implementation Reminder
Preserve the original asset contents and vanilla scripts. React/Next routing should provide the shell, metadata, and page boundaries; client-only wrappers should isolate browser-dependent behavior such as Three.js, Web Audio, Canvas, service-worker registration, and the admin panel.

## Premium Artist-Platform Revision Direction

### Reference Patterns to Adapt, Not Copy
The reviewed reference demonstrates four patterns worth adapting: an immersive visual entry point, a focused full-screen menu, a narrative-led artist universe, and explicit fan pathways for community, live events, shop, and music platforms. Akbar Nawasunda will keep its own midnight-indigo, neon-violet, Indonesian bass identity rather than replicating another artist’s visual language or assets.

### Proposed Product Identity: AN // NIGHT FREQUENCY
The revised site becomes a future-ready artist operating system: a cinematic public home that converts listeners into fans, a modular release and video surface, a live-event-ready schedule, a fan-signup layer, and a creator-facing set of interactive music tools. The existing Jedag Pad, sequencer, and game become a distinctive “Lab” experience instead of competing with the conversion-focused hero.

### Homepage Hierarchy
1. Full-screen “current era” hero with a single dominant release, smart platform CTA, and secondary fan-community CTA.
2. Current release, visual/video premiere, and next live date as compact high-value modules.
3. A horizontal release vault and video grid designed for continuous future additions.
4. The interactive Lab, collaboration portal, and fan signal signup as deeper engagement modules.
5. A durable footer integrating all listening platforms, contact, legal, and future commerce/community routes.

### Future-Ready Modules
The public architecture should accommodate a release CMS, show/event records, gated fan drops, email/newsletter audiences, community prompts, merch/Shopify connection, and a lightweight press/booking kit without changing the core navigation model.

## Expanded Ecosystem Route Map

| Route | Primary visitor job | Public value | Future management model |
| --- | --- | --- | --- |
| `/` | Discover the current era | Cinematic entry, current release, quick conversion | Hero/current-era and featured content records |
| `/music` | Browse catalog | Release vault, original/remix discovery, listening links | Release records, smart links, pre-save state |
| `/visuals` | Watch and share | Video premieres and visual archive | Video records and media assets |
| `/live` | Plan attendance | Next-live state, tickets, alert conversion | Event records, venue, ticket, city data |
| `/universe` | Join and participate | Fan pathways, Lab, collab, future drops | Fan cohorts, challenges, gated drops |
| `/epk` | Book or cover the artist | Press facts, assets, booking contact | Bio, press assets, booking status |
| `/studio` | Operate the platform | Owner content, leads, assets | Role-gated database and File Storage operations |
