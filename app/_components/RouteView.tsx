"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { MotionOrchestrator } from "@/components/MotionOrchestrator";
import { PageLoading } from "@/components/RouteTransition";

// [BUGFIX #418] `MotionOrchestrator` memutasi `className` section lewat
// classList di effect. Jika ia ter-mount sebagai saudara yang berada DI LUAR
// modul halaman lazy (mis. di shell), effect-nya bisa berjalan SEBELUM subtree
// halaman yang lazy selesai di-hydrate — React lalu menemukan kelas tambahan
// (`reveal-pending`, `is-motion-in-view`) pada node yang belum di-hydrate →
// hydration mismatch className yang meng-regenerasi seluruh pohon. Karena itu
// ia dibungkus ke DALAM modul halaman itu sendiri: komponen baru render (dan
// effect-nya jalan) dalam commit yang sama dengan — atau setelah — hidrasi
// halaman. `MotionOrchestrator` mengembalikan null, jadi markup SSR tidak
// berubah.
function page(
  loader: () => Promise<ComponentType<any> | { default: ComponentType<any> }>,
) {
  return dynamic(
    () =>
      loader().then(mod => {
        const Component =
          (mod as { default?: ComponentType<any> }).default ??
          (mod as ComponentType<any>);
        const PageWithMotion = (props: Record<string, unknown>) => (
          <>
            <Component {...props} />
            <MotionOrchestrator />
          </>
        );
        return { default: PageWithMotion };
      }),
    { loading: () => <PageLoading /> },
  );
}

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
