# Taste Skill Audit — Akbar Nawasunda

## Design Read

Reading this as: an established independent electronic artist website for design-conscious music listeners, with a cinematic editorial and photographic language, leaning toward a custom CSS design system rather than a generic UI library.

## Dial Selection

- Design variance: 8/10
- Motion intensity: 5/10
- Visual density: 4/10

The site should feel art-directed and premium, but not become a cockpit or sacrifice mobile readability.

## Existing strengths

- Self-hosted Clash Display, General Sans, and Azeret Mono fonts already exist.
- Dark visual identity and cyan signal accent are already established.
- Real artist photography, artwork, releases, embeds, CMS content, and route metadata are in use.
- Music catalog already supports horizontal interaction.
- SSR, tests, and route verification are present.

## Findings

1. The shared cinematic layer referenced unavailable `Syne`, `Plus Jakarta Sans`, and `JetBrains Mono` fonts. This could silently downgrade the intended hierarchy to generic browser fonts.
2. Music hero used inline `backgroundAttachment: fixed`, which is expensive and unstable on mobile browsers.
3. The project had no shared focus-visible guardrail in the cinematic layer for all public route controls.
4. Media containment existed in places but needed an explicit shared containment rule for major public media surfaces.
5. The existing visual language is intentionally sharp/editorial; rounded glass-heavy patterns from generic premium UI recipes would conflict with the supplied artist references, so they were not applied.

## Applied changes

- Replaced unavailable cinematic font references with the project’s self-hosted font system.
- Removed fixed background attachment from Music.
- Added scroll attachment guardrail for public hero backgrounds.
- Added focus-visible outlines using the cyan signal accent.
- Added max-width image guardrail.
- Added `contain: layout paint` to major media/card surfaces.
- Preserved content, links, embeds, routes, CMS behavior, and existing motion system.

## Next safe opportunities

- Lazy-load external embeds on user intent or near-viewport.
- Measure route-level JavaScript and image costs before changing asset quality.
- Add responsive screenshots at 390px and 1440px for each public route.
- Consolidate remaining legacy palette variables only after checking admin/editor surfaces.
