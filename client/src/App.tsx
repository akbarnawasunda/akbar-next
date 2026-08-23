import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
const Home = lazy(() => import("./pages/Home"));
const ContentStudio = lazy(() => import("./pages/ContentStudio"));
const Music = lazy(() => import("./pages/Music"));
const Visuals = lazy(() => import("./pages/Visuals"));
const Live = lazy(() => import("./pages/Live"));
const Universe = lazy(() => import("./pages/Universe"));
const PressKit = lazy(() => import("./pages/PressKit"));
const AssetLibrary = lazy(() => import("./pages/AssetLibrary"));
const About = lazy(() => import("./pages/About"));
const ReleaseDetail = lazy(() => import("./pages/ReleaseDetail"));
const Inquiry = lazy(() => import("./pages/Inquiry"));
const Licensing = lazy(() => import("./pages/Licensing"));
const InquiryStudio = lazy(() => import("./pages/InquiryStudio"));
const Admin = lazy(() => import("./pages/Admin"));
const BroadcastStudio = lazy(() => import("./pages/BroadcastStudio"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const StructuredData = lazy(() => import("./components/StructuredData").then(module => ({ default: module.StructuredData })));
const { EnglishHome, EnglishMusic, EnglishVisuals, EnglishLive, EnglishUniverse, EnglishAbout, EnglishEpk, EnglishInquiry, EnglishLicensing, EnglishPrivacy, EnglishReleaseDetail } = {
  EnglishHome: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishHome }))),
  EnglishMusic: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishMusic }))),
  EnglishVisuals: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishVisuals }))),
  EnglishLive: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishLive }))),
  EnglishUniverse: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishUniverse }))),
  EnglishAbout: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishAbout }))),
  EnglishEpk: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishEpk }))),
  EnglishInquiry: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishInquiry }))),
  EnglishLicensing: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishLicensing }))),
  EnglishPrivacy: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishPrivacy }))),
  EnglishReleaseDetail: lazy(() => import("./pages/EnglishPages").then(module => ({ default: module.EnglishReleaseDetail }))),
};
import LegacyDocument from "./components/LegacyDocument";
import { ScrollProgress } from "./components/ScrollProgress";
import { MotionOrchestrator } from "./components/MotionOrchestrator";
import { NightFrequencySignature } from "./components/NightFrequencySignature";
import { trpc } from "./lib/trpc";
import { customDocumentsToPublicContent } from "./content/publicContent";
import "./components/PlasmaRefinement.css";
import "./components/EditorialSimplification.css";
import "./components/MaturePalette.css";
import "./components/RouteMotion.css";
import "./components/BrandSystem.css";
import "./components/InteractionSystem.css";
import "./components/NightFrequencySignature.css";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/music"} component={Music} />
      <Route path={"/music/:slug"} component={ReleaseDetail} />
      <Route path={"/visuals"} component={Visuals} />
      <Route path={"/live"} component={Live} />
      <Route path={"/universe"} component={Universe} />
      <Route path={"/about"} component={About} />
      <Route path={"/inquire"} component={Inquiry} />
      <Route path={"/licensing"} component={Licensing} />
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
      <Route path={"/en/live"} component={EnglishLive} />
      <Route path={"/en/universe"} component={EnglishUniverse} />
      <Route path={"/en/about"} component={EnglishAbout} />
      <Route path={"/en/inquire"} component={EnglishInquiry} />
      <Route path={"/en/licensing"} component={EnglishLicensing} />
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
  "/live",
  "/universe",
  "/about",
  "/inquire",
  "/licensing",
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
  "/music": "Music Archive | Akbar Nawasunda",
  "/visuals": "Visual Archive | Akbar Nawasunda",
  "/live": "Live Signal | Akbar Nawasunda",
  "/universe": "AN Archive | Akbar Nawasunda",
  "/about": "About the Artist | Akbar Nawasunda",
  "/epk": "Press & Booking EPK | Akbar Nawasunda",
  "/inquire": "Inquire | Akbar Nawasunda",
  "/licensing": "Music Licensing | Akbar Nawasunda",
  "/privacy": "Privacy Policy | Akbar Nawasunda",
};

const englishTitles: Record<string, string> = {
  "/en": "Akbar Nawasunda | Official Website",
  "/en/music": "Music Archive | Akbar Nawasunda",
  "/en/visuals": "Visual Archive | Akbar Nawasunda",
  "/en/live": "Live Signal | Akbar Nawasunda",
  "/en/universe": "The Universe | Akbar Nawasunda",
  "/en/about": "About the Artist | Akbar Nawasunda",
  "/en/epk": "Press & Booking EPK | Akbar Nawasunda",
  "/en/inquire": "Inquire | Akbar Nawasunda",
  "/en/licensing": "Music Licensing | Akbar Nawasunda",
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
    const setMeta = (selector: string, attribute: string, value: string) => {
      const existing = document.head.querySelector<HTMLMetaElement>(selector);
      const meta = existing || document.head.appendChild(document.createElement("meta"));
      meta.setAttribute(attribute, value);
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
    document.title = (isEnglish ? defaultTitle : settings?.siteTitle?.trim() || defaultTitle);
    setMeta('meta[name="description"]', "name", isEnglish ? defaultDescription : settings?.metaDescription?.trim() || defaultDescription);
    setMeta('meta[property="og:title"]', "property", isEnglish ? defaultTitle : settings?.ogTitle?.trim() || settings?.siteTitle?.trim() || defaultTitle);
    setMeta('meta[property="og:description"]', "property", isEnglish ? defaultDescription : settings?.ogDescription?.trim() || settings?.metaDescription?.trim() || defaultDescription);
    setMeta('meta[property="og:image"]', "property", settings?.socialPreviewUrl?.trim() || `${siteOrigin}/assets/akbar-social-preview.webp`);
    setMeta('meta[property="og:url"]', "property", `${siteOrigin}${pathname === "/" ? "/" : pathname}`);
    setLink("canonical", `${siteOrigin}${pathname === "/" ? "/" : pathname}`);

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
          <Suspense fallback={null}><StructuredData /></Suspense>
          <MotionOrchestrator />
          <RouteMotion />
          <NightFrequencySignature />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
