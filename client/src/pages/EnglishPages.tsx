import type { ReactNode } from "react";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { PrivacyView } from "./PrivacyPolicy";
import { LiveView } from "./Live";
import { InquiryView } from "./Inquiry";
import { PressView } from "./PressKit";
import { AboutView } from "./About";
import { UniverseView } from "./Universe";
import { VisualsView } from "./Visuals";
import { HomeView } from "./Home";
import { ReleaseDetailView } from "./ReleaseDetail";
import { MusicView } from "./Music";
import { LicensingView } from "./Licensing";

import "./EcosystemPages.css";
import "@/components/OfficialBrand.css";
import "./Home.css";
import "@/components/EnglishLayer.css";

function EnglishFrame({ children }: { children: ReactNode }) {
  return (
    <div className="nf-page en-page an-site">
      <NightHeader lang="en" />
      {children}
      <NightFooter lang="en" />
    </div>
  );
}

export function EnglishHome() {
  return (
    // `.an-site` saja, PERSIS seperti beranda ID (bukan `.en-page`): kelas
    // itu memicu overlay grid + background gradasi generik dari
    // CinematicReference.css (lihat `.nf-page, .en-page { ... !important }`)
    // yang TIDAK pernah dipakai beranda ID — sebelumnya beranda EN diam-diam
    // dapat lapisan itu lewat EnglishFrame padahal beranda ID tidak,
    // membuat kedua bahasa terasa beda meski komposisinya sama persis.
    <div className="an-site" data-page="home">
      <NightHeader lang="en" />
      <HomeView locale="en" />
      <NightFooter lang="en" />
    </div>
  );
}

export function EnglishMusic() {
  return (
    <EnglishFrame>
      <MusicView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishVisuals() {
  return (
    <EnglishFrame>
      <VisualsView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishLive() {
  return (
    <EnglishFrame>
      <LiveView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishUniverse() {
  return (
    <EnglishFrame>
      <UniverseView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishAbout() {
  return (
    <EnglishFrame>
      <AboutView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishEpk() {
  return (
    <EnglishFrame>
      <PressView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishInquiry() {
  return (
    <EnglishFrame>
      <InquiryView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishLicensing() {
  return (
    <EnglishFrame>
      <LicensingView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishPrivacy() {
  return (
    <EnglishFrame>
      <PrivacyView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishReleaseDetail() {
  return (
    <EnglishFrame>
      <ReleaseDetailView locale="en" />
    </EnglishFrame>
  );
}
