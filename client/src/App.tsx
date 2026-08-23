import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ContentStudio from "./pages/ContentStudio";
import Music from "./pages/Music";
import Visuals from "./pages/Visuals";
import Live from "./pages/Live";
import Universe from "./pages/Universe";
import PressKit from "./pages/PressKit";
import AssetLibrary from "./pages/AssetLibrary";
import About from "./pages/About";
import ReleaseDetail from "./pages/ReleaseDetail";
import Inquiry from "./pages/Inquiry";
import Licensing from "./pages/Licensing";
import InquiryStudio from "./pages/InquiryStudio";
import Admin from "./pages/Admin";
import LegacyDocument from "./components/LegacyDocument";
import { ScrollProgress } from "./components/ScrollProgress";
import { MotionOrchestrator } from "./components/MotionOrchestrator";
import "./components/PlasmaRefinement.css";
import "./components/EditorialSimplification.css";
import "./components/MaturePalette.css";
import "./components/RouteMotion.css";
import "./components/BrandSystem.css";

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
      <Route path={"/admin"} component={Admin} />
      <Route path={"/epk"} component={PressKit} />
      <Route
        path={"/privacy"}
        component={() => <LegacyDocument source="/legacy/privacy.html" scripts="none" />}
      />
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

function RouteMotion() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return (
    <div className="route-motion" key={location} data-route={location}>
      <Router />
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
          <MotionOrchestrator />
          <RouteMotion />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
