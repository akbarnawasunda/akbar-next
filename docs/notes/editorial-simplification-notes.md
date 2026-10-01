# Editorial Simplification Audit — 22 August 2026

## Observed issues

The public routes are structurally sound but their shared visual system overuses oversized slogan headings, uppercase English phrases, repeated `signal/frequency/drop` language, decorative status cards, vinyl/particle motifs, and cyan callout panels. This creates a uniform “campaign mockup” rhythm rather than a site with page-specific editorial purpose.

The most visible examples are Home (`MAKE THE NIGHT MOVE`, `ONE ARTIST. EVERY FREQUENCY.`, `EVERY DROP HAS A SIGNAL.`), Live (`WHEN THE ROOM IS READY`, `MEET THE FREQUENCY`), About (`SIGNAL FROM THE SOURCE`, `BUILT FOR THE NIGHT`), and Inquiry (`BUILD THE NEXT ROOM`). These phrases do not add verified information and can be removed or replaced by direct labels.

## Editorial rule set

Every section should state one of three things only: a verified fact, the content being shown, or the action the visitor can take. Page motion should be limited to navigation feedback, interactive media actions, and the optional Home signature; it must not be repeated as a page decoration. Shared cyan signup sections should use direct page-specific language, not new slogans.

## Desktop verification

The revised Music, Visuals, About, Inquiry, Licensing, and Live routes now read as content pages rather than campaign boards. The scramble, ticker, canvas name field, hero vinyl, watermark slogans, staged section reveals, and upward hover lifts no longer run in the public experience. Heading line breaks were corrected to JSX breaks after static headings initially exposed literal `\\n` characters.

Home still received an old `NO DATE ANNOUNCED` title through a managed Live content record even though the dedicated Live page correctly filters placeholder events. The same placeholder filter must be applied to the Home live module before Android verification.

## Android verification — 375 × 812

Home, Music, Visuals, Live, About, EPK, Inquiry, and Licensing remain usable in a single-column Android layout. The new static headings wrap cleanly, primary actions remain large enough to tap, and the removal of ticker, canvas particles, vinyl motifs, staged entrances, and lift hovers creates a calmer scrolling rhythm. The Home and Live placeholder filters now present `BELUM ADA TANGGAL` / `BELUM ADA JADWAL`, not a fictitious show state. EPK remains intentionally denser because it is a factual working document rather than a campaign page.

AN Archive and EPK were rechecked after their copy pass. On Android, Archive now moves in a factual order—identity, journey, release artwork, official routes—while EPK moves from contact to facts, assets, releases, project contact, and platforms. `pnpm test` passed 30 tests, `pnpm check` passed, and `pnpm build` passed. The build retains the existing non-blocking runtime-resolution warning for the legacy stage-image reference and a Vite chunk-size advisory; neither prevents production output.

Commit `3c6b2be` (`Simplify public copy and motion language`) was pushed to GitHub `main`. Vercel deployment `dpl_FYuchr5RVcAjUvRuZq4SWkLkmqHX` reached `READY` at `https://akbar-next-9xulrg4xj-akbarnawasundas-projects.vercel.app`.
