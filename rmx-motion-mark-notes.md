# RMX Motion Mark Verification — 22 August 2026

The user-provided RMX artwork is stored as a project asset and appears once in the Home hero, replacing the generic status card. It is a user-triggered, 0.84-second mark animation: a copper scan travels through a short image drift and then returns to a static state. It does not autoplay, loop, animate while scrolling, or run outside Home.

Desktop review confirms the mark balances the hero rather than competing with the main name and two primary actions. At Android 375 × 812, the card scales to 142 px, stays beside the hero copy without obscuring actions, and remains a sufficiently large touch target. Reduced-motion users receive the static artwork because all motion keyframes are explicitly disabled.

## Particle revision

The initial scan treatment has been replaced with a canvas particle dissolve-and-reform. The canvas samples the dark and blue areas of the provided RMX artwork, spreads those particles outward, then rebuilds the mark in one user-triggered pass. The hard cap is 520 particles on desktop and 300 on Android; this is deliberately far below a literal “millions” target to protect Android frame rate and battery.

Static desktop and Android review confirms the RMX card remains legible and does not obstruct the hero before interaction. The particle sequence itself is covered by a source-level regression test for user triggering, canvas animation, performance cap, and reduced-motion behavior.

## Runtime particle validation

The original external storage URL failed the canvas CORS requirement after its CloudFront redirect. A fixed-path same-origin endpoint, `/api/brand/rmx-mark`, now fetches and serves only the RMX artwork with an image content type and cache header. Runtime browser validation showed the complete interaction: the static RMX artwork loads, a real click produces the visible spread of sampled dark/blue particle pixels, and the mark reforms into the original artwork at the end of the sequence. This was confirmed in the live development browser rather than inferred from source alone.

Desktop runtime inspection recorded the canvas in `desktop` mode with `is-animating=true`, canvas opacity `1`, and non-zero visible particle pixels immediately after a real click; after 1.4 seconds it returned to `is-animating=false`, canvas opacity `0`, image opacity `1`, and a loaded RMX artwork. Android hardware is not connected to the sandbox, so the Android check is explicitly a Chrome 375 × 812 mobile emulation with real pointer press/release on the 142 × 170 px mark: it entered `mobile` mode, began with 90 sampled particles, then completed with `is-animating=false`, canvas opacity `0`, image opacity `1`, and a loaded RMX artwork. The lower sampled count is valid because the cap is a maximum; small logo artwork has fewer eligible non-white source pixels.

## Production route correction

The first Vercel deployment exposed a routing defect: its catch-all SPA rewrite returned `index.html` from `/api/brand/rmx-mark`, so the image had `naturalWidth=0` and the canvas had no source pixels to animate. The rewrite now handles the RMX path before the SPA fallback and proxies the stored JPG as a same-origin response. The corrected production deployment returned `200 image/jpeg`, loaded the artwork at `2560 × 2560`, entered particle animation after a real click (`desktop`, 273 particles, canvas opacity `1`), and returned to the static image after 1.4 seconds (canvas opacity `0`, image opacity `1`).

The corrected production deployment was also checked with a real CDP touch sequence under a 375 × 812 mobile viewport. The 142 × 170 px RMX mark loaded the 2560 px source artwork, entered `mobile` particle mode with 90 particles and canvas opacity `1`, then returned to the static image (`is-animating=false`, canvas opacity `0`, image opacity `1`). This confirms the deployed Android-sized interaction—not only the local development version—receives a usable image source and completes one particle cycle after a tap.
