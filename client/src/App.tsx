import { TooltipProvider } from "@/components/ui/tooltip";
import { createElement, lazy, Suspense, useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
type PreloadableComponent<T extends React.ComponentType<any>> = T & {
  preload: () => Promise<{ default: T }>;
};

function lazyWithPreload<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
): PreloadableComponent<T> {
  let loaded: T | null = null;
  let promise: Promise<{ default: T }> | null = null;
  const load = () => {
    promise ||= loader().then(module => {
      loaded = module.default;
      return module;
    });
    return promise;
  };
  const component = ((props: React.ComponentProps<T>) => {
    const Loaded = loaded;
    if (!Loaded) throw load();
    return createElement(Loaded, props);
  }) as PreloadableComponent<T>;
  component.preload = load;
  return component;
}

const Home = lazyWithPreload(() => import("./pages/Home"));
const Music = lazyWithPreload(() => import("./pages/Music"));
const Visuals = lazyWithPreload(() => import("./pages/Visuals"));
const VisualPortraitGallery = lazyWithPreload(() => import("./pages/VisualPortraitGallery"));
const Live = lazyWithPreload(() => import("./pages/Live"));
const Universe = lazyWithPreload(() => import("./pages/Universe"));
const PressKit = lazyWithPreload(() => import("./pages/PressKit"));
const About = lazyWithPreload(() => import("./pages/About"));
const ReleaseDetail = lazyWithPreload(() => import("./pages/ReleaseDetail"));
const Inquiry = lazyWithPreload(() => import("./pages/Inquiry"));
const Licensing = lazyWithPreload(() => import("./pages/Licensing"));
const GameJedagRun = lazyWithPreload(() => import("./pages/GameJedagRun"));
const EnglishGameJedagRun = lazyWithPreload(() => import("./pages/GameJedagRun").then(module => ({ default: module.EnglishGameJedagRun })));
const GameJedagRunRoute = () => <GameJedagRun />;
const EnglishGameJedagRunRoute = () => <EnglishGameJedagRun />;
const PrivacyPolicy = lazyWithPreload(() => import("./pages/PrivacyPolicy"));
const EnglishPages = () => import("./pages/EnglishPages");
const EnglishHome = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishHome })));
const EnglishMusic = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishMusic })));
const EnglishVisuals = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishVisuals })));
const EnglishVisualPortraitGallery = lazyWithPreload(() => import("./pages/VisualPortraitGallery").then(module => ({ default: module.EnglishVisualPortraitGallery })));
const EnglishLive = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishLive })));
const EnglishUniverse = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishUniverse })));
const EnglishAbout = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishAbout })));
const EnglishEpk = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishEpk })));
const EnglishInquiry = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishInquiry })));
const EnglishLicensing = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishLicensing })));
const EnglishPrivacy = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishPrivacy })));
const EnglishReleaseDetail = lazyWithPreload(() => EnglishPages().then(module => ({ default: module.EnglishReleaseDetail })));

// Auth-gated routes stay code-split and are explicitly noindex in the SSR head.
const ContentStudio = lazy(() => import("./pages/ContentStudio"));
const AssetLibrary = lazy(() => import("./pages/AssetLibrary"));
const InquiryStudio = lazy(() => import("./pages/InquiryStudio"));
const Admin = lazy(() => import("./pages/Admin"));
const BroadcastStudio = lazy(() => import("./pages/BroadcastStudio"));

export async function preloadPublicRoute(pathname: string) {
  const path = pathname.split("?")[0] || "/";
  const jobs: Promise<unknown>[] = [];
  const add = (component: PreloadableComponent<React.ComponentType<any>>) => jobs.push(component.preload());
  if (path === "/") add(Home);
  else if (path === "/music") add(Music);
  else if (path.startsWith("/music/")) add(ReleaseDetail);
  else if (path === "/visuals") add(Visuals);
  else if (path === "/visuals/portraits") add(VisualPortraitGallery);
  else if (path === "/live") add(Live);
  else if (path === "/universe") add(Universe);
  else if (path === "/about") add(About);
  else if (path === "/inquire") add(Inquiry);
  else if (path === "/licensing") add(Licensing);
  else if (path === "/game/jedag-run") add(GameJedagRun);
  else if (path === "/epk") add(PressKit);
  else if (path === "/privacy") add(PrivacyPolicy);
  else if (path === "/en") add(EnglishHome);
  else if (path === "/en/music") add(EnglishMusic);
  else if (path.startsWith("/en/music/")) add(EnglishReleaseDetail);
  else if (path === "/en/visuals") add(EnglishVisuals);
  else if (path === "/en/visuals/portraits") add(EnglishVisualPortraitGallery);
  else if (path === "/en/live") add(EnglishLive);
  else if (path === "/en/universe") add(EnglishUniverse);
  else if (path === "/en/about") add(EnglishAbout);
  else if (path === "/en/epk") add(EnglishEpk);
  else if (path === "/en/inquire") add(EnglishInquiry);
  else if (path === "/en/licensing") add(EnglishLicensing);
  else if (path === "/en/game/jedag-run") add(EnglishGameJedagRun);
  else if (path === "/en/privacy") add(EnglishPrivacy);
  await Promise.all(jobs);
}
import LegacyDocument from "./components/LegacyDocument";
import { ScrollProgress } from "./components/ScrollProgress";
import { MotionOrchestrator } from "./components/MotionOrchestrator";
import { NightFrequencySignature } from "./components/NightFrequencySignature";
import { StructuredData } from "./components/StructuredData";
import { trpc } from "./lib/trpc";
import { customDocumentsToPublicContent } from "./content/publicContent";
import { publicMediaUrl } from "./lib/publicMedia";
import "./components/PlasmaRefinement.css";
import "./components/EditorialSimplification.css";
import "./components/MaturePalette.css";
import "./components/RouteMotion.css";
import "./components/BrandSystem.css";
import "./components/InteractionSystem.css";
import "./components/NightFrequencySignature.css";
import "./components/SignalNoirSystem.css";
import "./components/ResponsiveRepair.css";
import "./components/ScrollReplay.css";
import "./components/SignalTuningMotion.css";
import "./components/HumanEditorialSystem.css";
import "./components/SafeMotion.css";
import "./components/EditorialTypography.css";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/music"} component={Music} />
      <Route path={"/music/:slug"} component={ReleaseDetail} />
      <Route path={"/visuals"} component={Visuals} />
      <Route path={"/visuals/portraits"} component={VisualPortraitGallery} />
      <Route path={"/live"} component={Live} />
      <Route path={"/universe"} component={Universe} />
      <Route path={"/about"} component={About} />
      <Route path={"/inquire"} component={Inquiry} />
      <Route path={"/licensing"} component={Licensing} />
      <Route path={"/game/jedag-run"} component={GameJedagRunRoute} />
      <Route path={"/assets"} component={AssetLibrary} />
      <Route path={"/studio"} component={ContentStudio} />
      <Route path={"/studio/inquiries"} component={InquiryStudio} />
      <Route path={"/studio/broadcasts"} component={BroadcastStudio} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/epk"} component={PressKit} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/en"} component={EnglishHome} />
      <Route path={"/en/music/:slug"} component={EnglishReleaseDetail} />
      <Route path={"/en/music"} component={EnglishMusic} />
      <Route path={"/en/visuals"} component={EnglishVisuals} />
      <Route path={"/en/visuals/portraits"} component={EnglishVisualPortraitGallery} />
      <Route path={"/en/live"} component={EnglishLive} />
      <Route path={"/en/universe"} component={EnglishUniverse} />
      <Route path={"/en/about"} component={EnglishAbout} />
      <Route path={"/en/inquire"} component={EnglishInquiry} />
      <Route path={"/en/licensing"} component={EnglishLicensing} />
      <Route path={"/en/game/jedag-run"} component={EnglishGameJedagRunRoute} />
      <Route path={"/en/epk"} component={EnglishEpk} />
      <Route path={"/en/privacy"} component={EnglishPrivacy} />
      <Route
        path={"/404"}
        component={() => <LegacyDocument source="/legacy/404.html" scripts="none" />}
      />
      {/* Final fallback route */}
      <Route component={() => <LegacyDocument source="/legacy/404.html" scripts="none" />} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

const supportedLanguagePaths = [
  "/",
  "/music",
  "/visuals",
  "/visuals/portraits",
  "/live",
  "/universe",
  "/about",
  "/inquire",
  "/licensing",
  "/game/jedag-run",
  "/epk",
  "/privacy",
];

function isSupportedLanguagePath(pathname: string) {
  return supportedLanguagePaths.includes(pathname) || /^\/music\/[a-z0-9-]+$/i.test(pathname);
}

function languagePair(pathname: string) {
  if (pathname.startsWith("/en") && isSupportedLanguagePath(pathname.replace(/^\/en/, "") || "/")) {
    return { id: pathname.replace(/^\/en/, "") || "/", en: pathname };
  }
  if (isSupportedLanguagePath(pathname)) return { id: pathname, en: pathname === "/" ? "/en" : `/en${pathname}` };
  return null;
}

const idTitles: Record<string, string> = {
  "/": "Akbar Nawasunda | Official Website",
  "/music": "Music by Akbar Nawasunda",
  "/visuals": "Videos by Akbar Nawasunda",
  "/visuals/portraits": "Portrait Studies | Akbar Nawasunda",
  "/live": "Live Dates | Akbar Nawasunda",
  "/universe": "About the Work | Akbar Nawasunda",
  "/about": "About the Artist | Akbar Nawasunda",
  "/epk": "Press & Booking EPK | Akbar Nawasunda",
  "/inquire": "Inquire | Akbar Nawasunda",
  "/licensing": "Music Licensing | Akbar Nawasunda",
  "/game/jedag-run": "JEDAG RUN — Night Frequency | Akbar Nawasunda",
  "/privacy": "Privacy Policy | Akbar Nawasunda",
};

const englishTitles: Record<string, string> = {
  "/en": "Akbar Nawasunda | Official Website",
  "/en/music": "Music by Akbar Nawasunda",
  "/en/visuals": "Videos by Akbar Nawasunda",
  "/en/visuals/portraits": "Portrait Studies | Akbar Nawasunda",
  "/en/live": "Live Dates | Akbar Nawasunda",
  "/en/universe": "About the Work | Akbar Nawasunda",
  "/en/about": "About the Artist | Akbar Nawasunda",
  "/en/epk": "Press & Booking EPK | Akbar Nawasunda",
  "/en/inquire": "Inquire | Akbar Nawasunda",
  "/en/licensing": "Music Licensing | Akbar Nawasunda",
  "/en/game/jedag-run": "JEDAG RUN — Night Frequency | Akbar Nawasunda",
  "/en/privacy": "Privacy Policy | Akbar Nawasunda",
};

function CmsMetadata() {
  const [location] = useLocation();
  const customContent = trpc.content.documents.useQuery();
  const settings = useMemo(() => customDocumentsToPublicContent(customContent.data as Parameters<typeof customDocumentsToPublicContent>[0])?.siteSettings ?? null, [customContent.data]);

  useEffect(() => {
    const isEnglish = location === "/en" || location.startsWith("/en/");
    const siteOrigin = (settings?.canonicalUrl || "https://akbarnawasunda.my.id").replace(/\/$/, "");
    const pathname = location || "/";
    const pair = languagePair(pathname);
    const releaseTitleFromPath = pathname.startsWith("/en/music/") || pathname.startsWith("/music/")
      ? pathname.split("/").pop()?.split("-").map(word => word ? word[0].toUpperCase() + word.slice(1) : word).join(" ")
      : undefined;
    const defaultTitle = isEnglish
      ? englishTitles[pathname] || (releaseTitleFromPath ? `${releaseTitleFromPath} | Akbar Nawasunda` : "Akbar Nawasunda | Official Website")
      : idTitles[pathname] || (pathname.startsWith("/music/") ? `${releaseTitleFromPath || "Release"} | Akbar Nawasunda` : "Akbar Nawasunda | Official Website");
    const defaultDescription = isEnglish
      ? "Akbar Nawasunda is a producer, remixer, and electronic bass artist from Bandung Barat, Indonesia."
      : "Website resmi Akbar Nawasunda — producer, remixer, dan electronic bass artist dari Bandung Barat, Indonesia.";
    const setMeta = (selector: string, value: string) => {
      const existing = document.head.querySelector<HTMLMetaElement>(selector);
      const meta = existing || document.head.appendChild(document.createElement("meta"));
      const identity = selector.match(/meta\[(name|property)=["']([^"']+)["']\]/);
      if (identity) meta.setAttribute(identity[1], identity[2]);
      meta.setAttribute("content", value);
    };
    const setLink = (rel: string, href: string, attributes: Record<string, string> = {}) => {
      const selector = `link[rel="${rel}"]${attributes.hreflang ? `[hreflang="${attributes.hreflang}"]` : ""}`;
      const existing = document.head.querySelector<HTMLLinkElement>(selector);
      const link = existing || document.head.appendChild(document.createElement("link"));
      link.rel = rel;
      link.href = href;
      Object.entries(attributes).forEach(([key, value]) => link.setAttribute(key, value));
    };

    document.documentElement.lang = isEnglish ? "en" : "id";
    const isHome = pathname === "/" || pathname === "/en";
    const resolvedTitle = isEnglish ? defaultTitle : (isHome ? settings?.ogTitle?.trim() || settings?.siteTitle?.trim() : undefined) || defaultTitle;
    const resolvedDescription = isEnglish ? defaultDescription : settings?.ogDescription?.trim() || settings?.metaDescription?.trim() || defaultDescription;
    const resolvedImage = publicMediaUrl(settings?.socialPreviewUrl) || `${siteOrigin}/assets/akbar-social-preview-optimized.webp`;
    document.title = resolvedTitle;
    setMeta('meta[name="description"]', resolvedDescription);
    setMeta('meta[property="og:title"]', resolvedTitle);
    setMeta('meta[property="og:description"]', resolvedDescription);
    setMeta('meta[property="og:image"]', resolvedImage);
    setMeta('meta[property="og:url"]', `${siteOrigin}${pathname === "/" ? "/" : pathname}`);
    setMeta('meta[name="twitter:title"]', resolvedTitle);
    setMeta('meta[name="twitter:description"]', resolvedDescription);
    setMeta('meta[name="twitter:image"]', resolvedImage);
    setLink("canonical", `${siteOrigin}${pathname === "/" ? "/" : pathname}`);

    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots && isSupportedLanguagePath(pathname)) robots.remove();
    document.head.querySelectorAll('link[data-language-link="true"]').forEach(link => link.remove());
    if (pair) {
      const idUrl = `${siteOrigin}${pair.id === "/" ? "/" : pair.id}`;
      const enUrl = `${siteOrigin}${pair.en}`;
      const xDefaultUrl = idUrl;
      [
        ["id", idUrl],
        ["en", enUrl],
        ["x-default", xDefaultUrl],
      ].forEach(([hreflang, href]) => {
        const link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = hreflang;
        link.href = href;
        link.dataset.languageLink = "true";
        document.head.appendChild(link);
      });
    }
  }, [location, settings]);

  return null;
}

function RouteMotion() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return (
    <div className="route-motion" key={location} data-route={location}>
      <Suspense fallback={<div className="route-loading" role="status">MEMUAT HALAMAN…</div>}>
      <Router />
    </Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <ScrollProgress />
          <CmsMetadata />
          <StructuredData />
          <MotionOrchestrator />
          <RouteMotion />
          <NightFrequencySignature />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
