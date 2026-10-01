# Embed and EPK Verification Notes

## Desktop review — 22 August 2026

The Music page now renders stable official-media cards before any third-party player is requested. Artwork, title, provider identity, and an explicit official-source action remain usable when an iframe does not load. The player is intentionally deferred behind `PLAY HERE`, preventing the former empty-embed state from dominating the page.

The Visuals page follows the same pattern for YouTube: an editorial thumbnail with both `OPEN YOUTUBE` and `PLAY HERE` actions. The EPK now reads as a complete online press document with verified artist snapshot, services, official materials, selected releases, contact routes, and print/save control. It no longer presents unavailable photo packs or a technical rider as if they were downloadable assets.

The desktop review showed readable typography, real release artwork, and no visible layout collision in the three revised routes.

## Android review — 375 × 812

The revised Music and Visuals pages retain a full-width official source action before the optional player is loaded. The catalog and media cards remain legible at Android width; release artwork falls back to the verified official identity image if a remote CDN artwork fails. The EPK keeps its press snapshot, available-materials rule, selected releases, and booking routes in a single-column reading order without relying on a difficult desktop interaction.

The SoundCloud player endpoint returned an HTTP 408 during the audit, confirming that provider availability can vary by network or browser. This is now treated as a third-party enhancement rather than a dependency: the site retains actionable official links before, during, and after a player attempt.

## Provider and editorial audit

The YouTube no-cookie embed endpoint responded during the audit, but its response is subject to browser privacy policies, network filtering, and individual video embedding permissions. The same direct-source-first pattern is therefore used for video: the user can open the official YouTube page even if the optional iframe is unavailable.

The visual-language changes were deliberate rather than cosmetic. Music now uses direct catalog language and actual release context instead of repeated abstract “signal/frequency” slogans. Visuals foregrounds the viewing choice—play in place or open YouTube—rather than promising a player will always work. EPK is organized as a printable factual document with artist snapshot, verified materials, selected releases, and contact actions; it is no longer a repeated marketing-card layout. On mobile, all primary actions are explicit verbs: `OPEN`, `PLAY HERE`, `CONTACT`, `SAVE / PRINT`, or `BOOKING INQUIRY`.

## Production deployment

Commit `c8bb8cf` (`Fix media embeds and finalize online EPK`) was pushed to GitHub `main`. The resulting Vercel production deployment `dpl_Dw9WT9fPUu36wH4FoipvnXRJFh4o` reached `READY` at `https://akbar-next-ofy1ls8fe-akbarnawasundas-projects.vercel.app`.
