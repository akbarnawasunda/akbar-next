# Mature Palette Direction — 22 August 2026

## Diagnosis

The current electric plasma cyan appears simultaneously on every primary CTA, signup section, platform state, active navigation item, focus treatment, label, card border, and hover state. Together with blue-violet surfaces, it reads as a developer dashboard or generic music-tech concept rather than a deliberate artist art direction.

## New direction

The replacement palette uses near-black graphite as the base, smoked aubergine for depth, bone for primary text, muted stone for secondary text, and oxidized copper as the sparing signal color. The single high-contrast light surface becomes warm parchment rather than cyan: it is reserved for subscription and direct-response sections. This gives the site a physical night-print quality while retaining a modern electronic edge.

| Token | Value | Use |
|---|---:|---|
| Graphite | `#0C0B0D` | Site base and header |
| Ink plum | `#17131D` | Deep panels and gradients |
| Bone | `#ECE6DC` | Primary text and light surface accents |
| Stone | `#AFA69C` | Supporting text and quiet borders |
| Oxide copper | `#C7794C` | Active state, key action, small emphasis only |
| Warm parchment | `#D8CFBE` | Fan Signal / form response surface |

## Verification

Desktop review covered Home, Music, Inquiry, and EPK. Android review covered the same routes at 375 × 812. Copper remains concentrated in compact labels, active navigation, key actions, and selected form states; it no longer floods the page. Warm parchment provides one deliberate light section for audience capture rather than a cyan application-style callout. Graphite and aubergine surfaces separate long pages without the blue-violet dashboard look.

`pnpm test` passed 33 tests, `pnpm check` passed, and `pnpm build` passed. The existing unresolved legacy-stage-image warning and Vite chunk-size advisory remain non-blocking build warnings.
