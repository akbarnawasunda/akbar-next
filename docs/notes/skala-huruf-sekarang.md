# Inventaris skala huruf sekarang

Status: **nomor 1 — selesai, tidak mengubah kode.** Fase 7, rencana poin 1.

Metode: setiap deklarasi `font-size` di `client/src/**/*.css` diambil dengan parser
kurung-kurawal kecil (bukan regex baris-per-baris) supaya nama selektor yang benar
tercatat per deklarasi, termasuk yang ada di dalam `@media`. Skrip: lihat riwayat
kerja sesi ini — tidak disimpan sebagai berkas karena sifatnya sekali pakai.

## Ringkasan angka

- **728** total deklarasi `font-size` di `client/src/**/*.css` (72 berkas CSS).
- **513** di antaranya nilai tetap (`rem`/`px`/`em`, termasuk yang berakhiran `!important`).
- **192** deklarasi memakai `clamp(...)` (161 ekspresi berbeda).
- **21** deklarasi memakai token (`var(--text-*)`).
- **2** lainnya (mis. `font-size: 0` untuk menyembunyikan teks visual).


[FAKTA] Dari 513 deklarasi nilai tetap, **453 (88.3%)** berada di pita sempit **0,5rem–1rem (8px–16px)**. Hanya 3 yang di bawah 0,5rem dan 57 (11.1%) yang di atas 1rem — dan dari situ pun separuh lebih adalah `clamp()` judul yang memang sengaja besar. [TAFSIR] Ini membuktikan dugaan: skala ukurannya menumpuk di tengah, nyaris tidak ada lompatan ke mikro (di bawah 0,5rem) atau ke raksasa (nilai tetap, bukan `clamp()`, di atas 1,5rem nyaris tidak ada).


[FAKTA] Nilai tetap terpadat: **0,58rem** dipakai 79×, **0,62rem** 52×, **0,6rem** 41×, **0,56rem** 19× — keempatnya hanya beda 0,06rem (≈1px) satu sama lain tapi dihitung sebagai 4 nilai berbeda di 4 (atau lebih) berkas, bukan 1 token bersama. [TAFSIR] Ini pola klasik "desain lewat angka yang mirip-mirip", bukan skala yang disengaja.


## Tabel lengkap — nilai tetap (`rem` / `px` / `em`)

Diurutkan dari terkecil ke terbesar. Kolom "contoh" menunjukkan sampai 3 lokasi (berkas:baris selektor); kolom penuh kadang punya lebih banyak.


| px | rem | jumlah | contoh elemen (berkas:baris) |
|---:|---:|---:|---|
| 7.36 | 0.46rem | 1 | `shell/ChromeRedesign.css:344` `.an-public-shell.an-editorial .nf-nav .nf-wordmark-text small` |
| 7.68 | 0.48rem | 2 | `components/JedagRunCanvas.css:443` `.jedag-run-footer`; `pages/GameJedagRun.css:437` `.game-page-footer` |
| 8 | 0.5rem | 16 | `components/NightFrequencyChrome.css:407` `.nf-mobile-drawer-swipe-hint`; `components/NightFrequencySignature.css:142` `.nf-signature-rail-label,
.nf-signature-rail-status`; `components/NightFrequencySignature.css:174` `.nf-signature-rail button`; +13 lagi |
| 8.32 | 0.52rem | 16 | `components/NightFrequencyChrome.css:107` `.nf-mobile-drawer-brand-text span`; `components/NightFrequencyChrome.css:400` `.nf-mobile-drawer-meta-sub`; `pages/ArchiveStage.css:51` `.an-public-shell.an-editorial .an-arc-hero-plate figcaption`; +13 lagi |
| 8.64 | 0.54rem | 11 | `components/NightFrequencyChrome.css:663` `.nf-hud-right kbd`; `components/editorial/EditorialKit.css:462` `.ed-countdown__label`; `components/signature/EraTimeline.css:120` `.an-era-artwork-label,
.an-era-artwork-caption`; +8 lagi |
| 8.8 | 0.55rem | 9 | `components/JedagRunCanvas.css:344` `.jedag-run-tutorial-dismiss`; `components/JedagRunCanvas.css:370` `.jedag-run-footer`; `components/NightFrequencyChrome.css:168` `.nf-mobile-drawer-eyebrow span`; +6 lagi |
| 8.96 | 0.56rem | 19 | `components/NightFrequencyChrome.css:354` `.nf-mobile-drawer-meta-tag`; `components/PlatformMarquee.css:75` `.an-platform-marquee-heading`; `components/editorial/EditorialKit.css:294` `.ed-signal-row__label`; +16 lagi |
| 9 | 9px | 1 | `components/StudioClock.css:97` `.nf-birthday-chip` |
| 9.12 | 0.57rem !important | 1 | `CinematicReference.css:323` `.an-site .an-section-index > span:last-child` |
| 9.12 | 0.57rem | 2 | `components/JedagRunCanvas.css:354` `.jedag-run-hint`; `components/NightFrequencyChrome.css:739` `.nf-nav nav a` |
| 9.28 | 0.58rem !important | 4 | `CinematicReference.css:108` `.nf-page-eyebrow,
.nf-page .mono-label,
.nf-page .an-story-label,
.nf-page .an-event-date,
.nf-page .an-event-card span,
.nf-page .an-archive-timeline span,
.nf-page .an-archive-genres span,
.nf-page .an-inquiry-column-label,
.nf-page .an-inquiry-type-row button`; `CinematicReference.css:316` `.an-site .hero-signal-link`; `CinematicReference.css:321` `.an-site .an-section-index > span:first-child`; +1 lagi |
| 9.28 | 0.58rem | 79 | `components/EnglishLayer.css:40` `.en-mobile-language`; `components/EnglishLayer.css:57` `.en-footer-bottom`; `components/EnglishLayer.css:62` `.en-footer-bottom .an-language-switcher`; +76 lagi |
| 9.44 | 0.59rem !important | 2 | `CinematicReference.css:314` `.an-site .button-primary`; `CinematicReference.css:315` `.an-site .button-quiet` |
| 9.44 | 0.59rem | 2 | `components/JedagRunCanvas.css:304` `.jedag-run-run-summary`; `components/JedagRunCanvas.css:323` `.jedag-run-tutorial` |
| 9.6 | 0.6rem !important | 1 | `CinematicReference.css:307` `.an-site .hero-copy .eyebrow` |
| 9.6 | 0.6rem | 41 | `components/EnglishLayer.css:13` `.an-language-switcher`; `components/EnglishLayer.css:195` `.en-signal-strip span`; `components/EnglishLayer.css:387` `.en-service-card > span`; +38 lagi |
| 9.92 | 0.62rem !important | 3 | `CinematicReference.css:191` `.nf-platform-grid a`; `CinematicReference.css:462` `.music-reference-page .nf-page-hero p:not(.nf-page-eyebrow)`; `pages/EcosystemPages.css:1309` `.nf-page main section:not(.nf-page-hero) .nf-page-eyebrow,
.nf-page main section:not(.nf-page-hero) .nf-section-title .nf-page-eyebrow,
.nf-page main section:not(.nf-page-hero) .an-story-label` |
| 9.92 | 0.62rem | 52 | `components/EnglishLayer.css:140` `.en-inline-note`; `components/EnglishLayer.css:305` `.en-aside`; `components/EnglishLayer.css:451` `.en-back-link`; +49 lagi |
| 10 | 10px | 3 | `components/RouteTransition.css:118` `.an-page-loading-elapsed`; `components/StudioClock.css:14` `.nf-clock`; `components/StudioClock.css:119` `.nf-birthday-note` |
| 10.08 | 0.63rem | 1 | `components/JedagRunCanvas.css:329` `.jedag-run-tutorial strong` |
| 10.24 | 0.64rem | 9 | `components/NightFrequencyChrome.css:97` `.nf-mobile-drawer-brand-text strong`; `components/signature/RouteSignalCurtain.css:144` `.an-route-signal-target`; `components/signature/SignatureStage.css:104` `.an-signature-stage-phrases-label`; +6 lagi |
| 10.4 | 0.65rem !important | 1 | `CinematicReference.css:404` `.an-site .hero-description` |
| 10.4 | 0.65rem | 2 | `components/MusicEmbed.css:330` `.an-embed-card-extra-tag,
.an-embed-card-meta-tag`; `pages/GameJedagRun.css:387` `.game-leaderboard-rank` |
| 10.56 | 0.66rem !important | 2 | `CinematicReference.css:652` `.nf-page .nf-page-eyebrow,
.en-page .nf-page-eyebrow`; `CinematicReference.css:733` `.nf-page .nf-button,
.en-page .nf-button,
.nf-page .an-inquiry-submit,
.en-page .an-inquiry-submit` |
| 10.56 | 0.66rem | 15 | `components/NightFrequencyChrome.css:689` `.nf-wordmark`; `components/PortraitStudiesSection.css:106` `.an-public-shell.an-editorial .an-pg-lead figcaption span`; `components/editorial/EditorialKit.css:630` `.ed-player__title`; +12 lagi |
| 10.88 | 0.68rem | 15 | `components/FanSignalSection.css:26` `.fan-signal-index`; `components/FanSignalSection.css:69` `.fan-signal-eyebrow`; `components/FanSignalSection.css:140` `.fan-signal-input-row button`; +12 lagi |
| 11 | 11px | 1 | `components/OfficialBrand.css:35` `.nf-wordmark-official > span` |
| 11.04 | 0.69rem !important | 1 | `CinematicReference.css:311` `.an-site .hero-description` |
| 11.2 | 0.7rem | 9 | `components/MusicEmbed.css:179` `.an-embed-fallback-btn`; `components/NightFrequencyChrome.css:244` `.nf-mobile-drawer-link-desc`; `components/OfficialMediaFrame.css:205` `.an-official-media-copy p`; +6 lagi |
| 11.52 | 0.72rem | 11 | `components/MaturePalette.css:37` `.nf-page .nf-page-eyebrow,
.nf-page .eyebrow,
.nf-page .mono-label,
.nf-page .nf-meta,
.nf-page .an-section-index,
.nf-page .release-number`; `components/MusicEmbed.css:152` `.an-embed-loading-text`; `components/MusicEmbed.css:371` `.an-embed-btn-play`; +8 lagi |
| 11.68 | 0.73rem | 1 | `shell/EditorialRefresh.css:195` `.an-public-shell.an-editorial .an-language-switcher` |
| 11.84 | 0.74rem | 1 | `shell/EditorialRefresh.css:582` `.an-public-shell.an-editorial .an-site .hero-copy .eyebrow` |
| 12 | 0.75rem | 2 | `pages/GameJedagRun.css:403` `.game-leaderboard-score`; `shell/EditorialRefresh.css:145` `.an-public-shell.an-editorial .nf-nav .nf-wordmark` |
| 12.16 | 0.76rem | 2 | `shell/EditorialRefresh.css:801` `.an-public-shell.an-editorial :is(.nf-page, .an-site) .an-embed-loading-text`; `shell/EditorialRefresh.css:868` `.an-public-shell.an-editorial .nf-page .an-inquiry-type-row button` |
| 12.48 | 0.78rem | 7 | `components/JedagRunCanvas.css:310` `.jedag-run-run-summary b`; `components/OfficialMediaFrame.css:314` `.an-official-player-hint`; `components/editorial/EditorialKit.css:663` `.ed-field__hint`; +4 lagi |
| 12.8 | 0.8rem | 7 | `components/FanSignalSection.css:161` `.fan-signal-note`; `components/OfficialMediaFrame.css:187` `.an-official-media-copy`; `components/OfficialMediaFrame.css:230` `.an-official-media-copy small`; +4 lagi |
| 13 | 0.8125rem | 1 | `components/MusicEmbed.css:170` `.an-embed-fallback-bar` |
| 13.12 | 0.82rem | 4 | `pages/EcosystemPages.css:695` `.an-booking-option > small`; `pages/GameJedagRun.css:203` `.game-page-side-note p`; `pages/GameJedagRun.css:279` `.game-username-form input`; +1 lagi |
| 13.44 | 0.84rem | 12 | `pages/Admin.css:232` `.an-control-tool p`; `pages/ArchiveStage.css:180` `.an-public-shell.an-editorial .an-arc-route-copy small`; `pages/EcosystemPages.css:950` `.an-archive-route-list small`; +9 lagi |
| 13.44 | 0.84rem !important | 1 | `pages/PrivacyPolicy.css:289` `.an-privacy-muted` |
| 13.6 | 0.85rem | 1 | `components/JedagRunCanvas.css:399` `.jedag-run-disabled p` |
| 13.76 | 0.86rem !important | 1 | `CinematicReference.css:136` `.nf-page-hero p:not(.nf-page-eyebrow),
.nf-epk-hero p:not(.nf-page-eyebrow)` |
| 13.76 | 0.86rem | 16 | `components/CommandPalette.css:75` `.an-command-results button`; `components/PortraitStudiesSection.css:196` `.an-public-shell.an-editorial .an-pg-card-copy p:last-child`; `components/editorial/EditorialKit.css:311` `.ed-signal-row__note`; +13 lagi |
| 14.08 | 0.88rem | 12 | `components/MusicEmbed.css:349` `.an-embed-card-desc`; `components/PortraitStudiesSection.css:46` `.an-public-shell.an-editorial .an-pg-note`; `pages/ArtistModules.css:192` `.an-press-pack p`; +9 lagi |
| 14.4 | 0.9rem | 7 | `components/EnglishLayer.css:405` `.en-service-card p`; `components/editorial/EditorialKit.css:185` `.ed-card__copy`; `pages/Admin.css:383` `.an-control-access span`; +4 lagi |
| 14.72 | 0.92rem | 8 | `components/NightFrequencyChrome.css:508` `.nf-footer-column a`; `pages/EpkReady.css:159` `.an-epk-facts b`; `pages/GameJedagRun.css:242` `.game-username-gate-copy p,
.game-username-gate-copy small,
.game-leaderboard-intro > p:last-of-type`; +5 lagi |
| 14.72 | 0.92rem !important | 1 | `pages/ArtistModules.css:85` `.an-profile-note` |
| 15.04 | 0.94rem | 1 | `pages/LicensingStage.css:21` `.an-public-shell.an-editorial .an-license-hero-plate p` |
| 15.2 | 0.95rem | 11 | `components/FanSignalSection.css:126` `.fan-signal-input-row input`; `components/MusicEmbed.css:226` `.an-embed-container-subtitle`; `components/editorial/EditorialKit.css:657` `.ed-field__control`; +8 lagi |
| 15.36 | 0.96rem | 4 | `components/EnglishLayer.css:627` `.en-section-intro p,
  .en-copy-block > p`; `components/MaturePalette.css:171` `.nf-page .nf-section-title > p`; `pages/EcosystemPages.css:283` `.nf-section-title > p`; +1 lagi |
| 15.52 | 0.97rem | 1 | `index.css:560` `body` |
| 15.68 | 0.98rem !important | 1 | `CinematicReference.css:681` `.nf-page .nf-page-hero p:not(.nf-page-eyebrow),
.en-page .nf-page-hero p:not(.nf-page-eyebrow),
.nf-page .nf-epk-hero p:not(.nf-page-eyebrow)` |
| 15.68 | 0.98rem | 4 | `pages/EcosystemPages.css:783` `.an-archive-origin > div > p`; `pages/EpkReady.css:133` `.an-epk-document p`; `pages/Home.css:3011` `.desktop-vinyl-track`; +1 lagi |
| 16 | 1rem | 18 | `components/EnglishLayer.css:170` `.en-section-intro p,
.en-copy-block > p`; `components/MaturePalette.css:118` `.nf-page .nf-page-hero > div > p:not(.nf-page-eyebrow),
.nf-page .nf-epk-hero > div > p:not(.nf-page-eyebrow)`; `index.css:388` `body`; +15 lagi |
| 16.32 | 1.02rem | 1 | `pages/InquiryStage.css:100` `.an-public-shell.an-editorial .an-inq-email` |
| 16.64 | 1.04rem | 2 | `pages/Home.css:815` `.an-site .release-detail > p:not(.mono-label)`; `pages/InquiryStage.css:375` `.an-public-shell.an-editorial .an-inq-feedback strong` |
| 16.8 | 1.05rem | 4 | `components/EnglishLayer.css:121` `.en-lead`; `components/PortraitStudiesSection.css:188` `.an-public-shell.an-editorial .an-pg-card-copy h3`; `shell/SceneKit.css:175` `.an-public-shell.an-editorial .an-facts dd`; +1 lagi |
| 16.96 | 1.06rem | 2 | `pages/Home.css:313` `.an-site .hero-description`; `shell/ChromeRedesign.css:309` `.an-public-shell.an-editorial .nf-mobile-drawer-link-title` |
| 17.28 | 1.08rem !important | 1 | `CinematicReference.css:342` `.an-site .release-card h3` |
| 17.28 | 1.08rem | 1 | `pages/PressStage.css:269` `.an-public-shell.an-editorial .an-press-asset-copy strong` |
| 17.6 | 1.1rem | 6 | `pages/EcosystemPages.css:1125` `.an-epk-release h3`; `pages/EpkReady.css:330` `.an-epk-release h3`; `pages/Home.css:2055` `.an-mobile-navigation-close span:first-child`; +3 lagi |
| 17.92 | 1.12rem | 2 | `pages/ArchiveStage.css:172` `.an-public-shell.an-editorial .an-arc-route-copy strong`; `pages/LicensingStage.css:69` `.an-public-shell.an-editorial .an-license-route-copy strong` |
| 18.4 | 1.15rem | 3 | `components/EnglishLayer.css:511` `.en-legal-note`; `components/OfficialMediaFrame.css:378` `.an-official-media-copy h3`; `pages/Home.css:1868` `.an-site .release-card h3` |
| 18.56 | 1.16rem | 1 | `shell/ChromeRedesign.css:90` `.an-public-shell.an-editorial .nf-nav .nf-wordmark-text strong` |
| 19.2 | 1.2rem | 4 | `components/CommandPalette.css:38` `.an-command input`; `components/editorial/EditorialKit.css:593` `.ed-player__chevron`; `pages/EcosystemPages.css:688` `.an-booking-option > strong`; +1 lagi |
| 20 | 1.25rem !important | 1 | `CinematicReference.css:329` `.an-site .home-platform-copy strong` |
| 20 | 1.25rem | 3 | `components/NightFrequencyChrome.css:235` `.nf-mobile-drawer-link-title`; `pages/ArtistModules.css:462` `.an-event-card h3`; `pages/EcosystemPages.css:944` `.an-archive-route-list strong` |
| 20.48 | 1.28rem !important | 1 | `CinematicReference.css:233` `.nf-catalog-card h3` |
| 20.8 | 1.3rem | 1 | `pages/EcosystemPages.css:996` `.an-profile-copy blockquote` |
| 21.6 | 1.35rem | 6 | `components/NightFrequencyChrome.css:469` `.nf-footer-brand strong`; `components/signature/SundaScript.css:91` `.an-sunda[data-tone="hero"] .an-sunda-script`; `pages/ArtistModules.css:76` `.an-profile-copy blockquote`; +3 lagi |
| 22.4 | 1.4rem !important | 1 | `CinematicReference.css:145` `.nf-hero-note > strong` |
| 22.4 | 1.4rem | 4 | `components/EnglishLayer.css:590` `.en-epk-art-card strong`; `components/MaturePalette.css:138` `.nf-page .nf-hero-note strong`; `pages/EcosystemPages.css:412` `.nf-catalog-card h3`; +1 lagi |
| 23.2 | 1.45rem | 3 | `components/EnglishLayer.css:397` `.en-service-card h3`; `pages/ArtistModules.css:305` `.an-event-card h3`; `pages/EpkReady.css:270` `.an-epk-asset h3` |
| 24 | 1.5rem | 6 | `pages/Admin.css:420` `.an-control-room-stats strong`; `pages/ArtistModules.css:184` `.an-press-pack h3`; `pages/EcosystemPages.css:574` `.an-event-card h3`; +3 lagi |
| 27.2 | 1.7rem | 1 | `pages/EcosystemPages.css:525` `.nf-universe-card h3` |
| 28.8 | 1.8rem | 1 | `pages/Admin.css:126` `.an-control-room-stats strong` |
| 30.4 | 1.9rem !important | 1 | `CinematicReference.css:244` `.nf-universe-card h3` |
| 30.4 | 1.9rem | 1 | `pages/ArtistModules.css:364` `.an-event-empty strong` |

## `clamp()` — rentang yang dipakai

192 deklarasi, 161 ekspresi `clamp()` berbeda. Ini bentuk fluid yang sudah ada, tapi jumlah variannya sendiri menunjukkan tidak ada skala bersama — tiap komponen menulis `clamp()`-nya sendiri.


### 20 ekspresi `clamp()` terbanyak dipakai

| ekspresi | jumlah | contoh |
|---|---:|---|
| `clamp(2rem, 4.4vw, 4.4rem)` | 7 | `pages/ArchiveArtwork.css:45` `.an-archive-art-copy h2` |
| `clamp(2rem, 4vw, 4rem)` | 5 | `components/FanSignalSection.css:51` `.fan-signal-copy h2` |
| `clamp(2.1rem, 10vw, 3.5rem) !important` | 4 | `CinematicReference.css:372` `.nf-page-hero h1, .nf-epk-hero h1` |
| `clamp(3rem, 16.7vw, 5.8rem) !important` | 3 | `CinematicReference.css:403` `.an-site .hero-copy .hero-title-editorial` |
| `clamp(2.5rem, 5.6vw, 5rem)` | 3 | `pages/ArchiveStage.css:67` `.an-public-shell.an-editorial .an-arc-hero-copy h1` |
| `clamp(2rem, 9.4vw, 3.1rem)` | 3 | `pages/InquiryStage.css:431` `.an-public-shell.an-editorial .an-inq-hero-copy h1` |
| `clamp(2.6rem, 10vw, 10rem) !important` | 2 | `CinematicReference.css:309` `.an-site .hero-copy .hero-title-editorial` |
| `clamp(2.4rem, 5vw, 5rem) !important` | 2 | `CinematicReference.css:334` `.an-site .release-detail h3` |
| `clamp(1.6rem, 3vw, 2.6rem)` | 2 | `components/EnglishLayer.css:286` `.en-empty strong` |
| `clamp(1.8rem, 3.4vw, 3.2rem)` | 2 | `components/EnglishLayer.css:423` `.en-contact-panel h2` |
| `clamp(2rem, 4.6vw, 4.4rem)` | 2 | `components/editorial/EditorialKit.css:79` `.ed-head__title` |
| `clamp(2.4rem, 5.4vw, 4.8rem)` | 2 | `pages/Admin.css:155` `.an-control-section-heading h2` |
| `clamp(2rem, 9vw, 3.6rem)` | 2 | `pages/ArchiveArtwork.css:88` `.an-archive-art-copy h2` |
| `clamp(2.8rem, 7vw, 6rem)` | 2 | `pages/CatalogStage.css:32` `.an-public-shell.an-editorial .an-cat-hero-copy h1` |
| `clamp(2.4rem, 12vw, 3.6rem)` | 2 | `pages/CatalogStage.css:385` `.an-public-shell.an-editorial .an-cat-hero-copy h1` |
| `clamp(2rem, 4.4vw, 4.2rem)` | 2 | `pages/EcosystemPages.css:274` `.nf-section-title h2` |
| `clamp(1.6rem, 3.2vw, 2.6rem)` | 2 | `pages/EpkReady.css:102` `.an-epk-hero-card-copy strong` |
| `clamp(1.2rem, 6.7vw, 2.33rem) !important` | 2 | `pages/Home.css:1944` `.an-site .hero-copy .hero-title-editorial` |
| `clamp(1.98rem, 4.8vw, 5.16rem) !important` | 1 | `CinematicReference.css:129` `.nf-page-hero h1,
.nf-epk-hero h1` |
| `clamp(2.6rem, 6vw, 6.7rem) !important` | 1 | `CinematicReference.css:159` `.nf-section-title h2,
.an-story-copy h2,
.an-booking-grid h2,
.an-archive-origin h2,
.an-archive-routes h2` |

## Token yang sudah ada tapi jarang dipakai (`var(--text-*)`)

`client/src/index.css` sudah mendefinisikan satu tangga (baris 269-277): `--text-hero`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-lede`, `--text-body`, `--text-small`, `--text-meta`. [FAKTA] Tapi dari 728 deklarasi di seluruh CSS, hanya **21** yang benar-benar memakainya:


| token | jumlah |
|---|---:|
| `var(--text-hero)` | 2 |
| `var(--text-h2)` | 3 |
| `var(--text-h3)` | 1 |
| `var(--text-lede)` | 8 |
| `var(--text-body)` | 7 |

[TAFSIR] Tangga lama sudah ada, hanya tidak dipakai. Masalahnya bukan "tidak ada token", tapi 513 deklarasi nilai tetap lain yang menulis angka sendiri-sendiri di luar token itu.


## Lainnya

- `font-size: 0` × 2 — contoh `pages/EcosystemPages.css:1174` `.nf-signal` (dipakai untuk menyembunyikan teks dari tampilan visual tapi tetap terbaca screen reader, bukan bagian dari skala).


## Kesimpulan untuk nomor 3

[TAFSIR] Angkanya membenarkan arah Fase 7: ukuran yang ada sekarang rapat sekali di pita 0,5–1rem (88,3% dari semua nilai tetap), nyaris tidak menyentuh ekstrem kecil (mikro, di bawah 0,5rem) atau ekstrem besar (raksasa, nilai tetap di atas 1,5rem — yang besar semuanya lewat `clamp()` ad-hoc per komponen, bukan token bersama). Tangga baru (`--step--1` … `--step-7`, nomor 3) perlu rasio yang jauh lebih besar dari pola yang sudah ada, dan bagian tengahnya boleh kosong karena memang tidak ada yang memakainya sekarang juga.
