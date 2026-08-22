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

## Hero particle rebuild brief

The small RMX card is rejected. The revised hero must show no visible source image, card boundary, label, or framed preview. The supplied RMX image is used only offscreen to sample the dark and blue mark pixels; the public visual itself is a full-scale particle field that forms the RMX silhouette, disperses on interaction, and reforms. Initial desktop/mobile inspection of the rebuild confirms the canvas now creates visible dots in the mark shape, but it also revealed that the hero's old background image is visually competing with that shape. The background image must therefore be removed so the particle silhouette is the sole logo treatment in the hero.

The same inspection found a legacy general hero layout rule overriding the new canvas from `position: absolute` to a relative, bottom-offset element. The particle field therefore appeared lower than intended. The rebuilt selector is now scoped through `.an-site .an-hero` and explicitly resets the legacy position, offsets, and dimensions. The hero CMS/legacy backdrop image is also removed from the Home markup; artwork remains an offscreen sampling source only.

Desktop visual review now shows a card-free, full-scale RMX silhouette entirely made of dots on the right side of the hero, with the editorial name and actions retaining their left-side hierarchy. Mobile review places the same particle silhouette beneath the copy and actions rather than obscuring them; its mobile width is tuned to preserve the logo's right edge inside the viewport. No framed source image or caption remains in either composition.

The rebuilt desktop runtime loaded the 2560 px artwork only as an invisible sampling source (`opacity: 0`), generated 1,861 visible particle targets for the RMX silhouette, and entered `is-animating=true` after a direct replay click. After the dissolve–reform sequence it returned to the static particle silhouette with `is-animating=false`; the image source remained invisible throughout. This verifies the public mark is now canvas particles rather than an image toggled behind a canvas.

Mobile runtime verification used a 375 × 812 viewport and a real CDP touch sequence on the 405 × 405 px particle field. The image source was loaded but stayed invisible (`opacity: 0`); 1,188 particles formed the mobile RMX silhouette, entered `is-animating=true` after touch, and reformed with `is-animating=false`. The configured mobile cap is 1,200, so this remains within the Android performance budget while providing a visibly denser logo than the rejected 90-particle card treatment.

The Vercel production deployment for the rebuilt hero was inspected after its formation interval. It loaded the 2560 px source only with `opacity: 0`, reported 1,861 desktop particle targets, and contained 7,444 non-transparent canvas pixels with no animation still running. This confirms the blank-looking first capture was only taken during initial formation, not a loss of the particle field in production.

A direct production replay click then entered `is-animating=true` with the same 1,861 desktop particles and returned to `is-animating=false` after the dissolve–reform interval. The source artwork kept `opacity: 0` during and after the interaction. The live hero therefore presents the RMX mark only through the rendered particle field, not through a visible image.

The production Android-sized check used a 375 × 812 mobile viewport and a real CDP touch sequence. The 405 × 405 px field loaded the source at 2560 px but kept it invisible, formed 1,188 mobile particles, entered `is-animating=true` after touch, and completed with `is-animating=false` while the source remained hidden. This validates the deployed mobile interaction as the dense particle logo hero rather than the earlier card/image treatment.
