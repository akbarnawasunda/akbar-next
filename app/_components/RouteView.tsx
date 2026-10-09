"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { PageLoading } from "@/components/RouteTransition";

const page = (loader: () => Promise<ComponentType<any> | { default: ComponentType<any> }>) =>
  dynamic(loader, { loading: () => <PageLoading /> });

const routes = {
  home: page(() => import("@/pages/Home")),
  music: page(() => import("@/pages/Music")),
  release: page(() => import("@/pages/ReleaseDetail")),
  visuals: page(() => import("@/pages/Visuals")),
  live: page(() => import("@/pages/Live")),
  universe: page(() => import("@/pages/Universe")),
  about: page(() => import("@/pages/About")),
  epk: page(() => import("@/pages/PressKit")),
  inquire: page(() => import("@/pages/Inquiry")),
  licensing: page(() => import("@/pages/Licensing")),
  game: page(() => import("@/pages/GameJedagRun")),
  privacy: page(() => import("@/pages/PrivacyPolicy")),
  notFound: page(() => import("./RouteNotFound")),
  admin: page(() => import("@/pages/Admin")),
  assetLibrary: page(() => import("@/pages/AssetLibrary")),
  contentStudio: page(() => import("@/pages/ContentStudio")),
  inquiryStudio: page(() => import("@/pages/InquiryStudio")),
  broadcastStudio: page(() => import("@/pages/BroadcastStudio")),
  enHome: page(() => import("@/pages/EnglishPages").then(m => m.EnglishHome)),
  enMusic: page(() => import("@/pages/EnglishPages").then(m => m.EnglishMusic)),
  enRelease: page(() => import("@/pages/EnglishPages").then(m => m.EnglishReleaseDetail)),
  enVisuals: page(() => import("@/pages/EnglishPages").then(m => m.EnglishVisuals)),
  enLive: page(() => import("@/pages/EnglishPages").then(m => m.EnglishLive)),
  enUniverse: page(() => import("@/pages/EnglishPages").then(m => m.EnglishUniverse)),
  enAbout: page(() => import("@/pages/EnglishPages").then(m => m.EnglishAbout)),
  enEpk: page(() => import("@/pages/EnglishPages").then(m => m.EnglishEpk)),
  enInquire: page(() => import("@/pages/EnglishPages").then(m => m.EnglishInquiry)),
  enLicensing: page(() => import("@/pages/EnglishPages").then(m => m.EnglishLicensing)),
  enPrivacy: page(() => import("@/pages/EnglishPages").then(m => m.EnglishPrivacy)),
  enGame: page(() => import("@/pages/GameJedagRun").then(m => m.EnglishGameJedagRun)),
} satisfies Record<string, ComponentType<any>>;

export type SiteRoute = keyof typeof routes;

export function RouteView({ route }: { route: SiteRoute }) {
  const Page = routes[route];
  return <Page />;
}
