import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
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
import LegacyDocument from "./components/LegacyDocument";
import { ScrollProgress } from "./components/ScrollProgress";
import { MotionOrchestrator } from "./components/MotionOrchestrator";
import "./components/PlasmaRefinement.css";
import "./components/EditorialSimplification.css";
import "./components/MaturePalette.css";
import "./components/RouteMotion.css";
import "./components/BrandSystem.css";
import "./components/InteractionSystem.css";

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

function CmsMetadata() {
  useEffect(() => {
    let active = true;
    import("./sanity/siteSettings")
      .then(({ fetchSiteSettings }) => fetchSiteSettings())
      .then((settings) => {
        if (!active || !settings) return;
        if (settings.siteTitle?.trim()) document.title = settings.siteTitle.trim();
        const setMeta = (selector: string, attribute: string, value?: string) => {
          if (!value?.trim()) return;
          const existing = document.head.querySelector<HTMLMetaElement>(selector);
          const meta = existing || document.head.appendChild(document.createElement("meta"));
          meta.setAttribute(attribute, value.trim());
        };
        const setLink = (rel: string, href?: string) => {
          if (!href?.trim()) return;
          const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
          const link = existing || document.head.appendChild(document.createElement("link"));
          link.rel = rel;
          link.href = href.trim();
        };
        setMeta('meta[name="description"]', "name", settings.metaDescription);
        setMeta('meta[property="og:title"]', "property", settings.ogTitle || settings.siteTitle);
        setMeta('meta[property="og:description"]', "property", settings.ogDescription || settings.metaDescription);
        setMeta('meta[property="og:image"]', "property", settings.socialPreviewUrl);
        setMeta('meta[property="og:url"]', "property", settings.canonicalUrl);
        setLink("canonical", settings.canonicalUrl);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

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
          <MotionOrchestrator />
          <RouteMotion />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
