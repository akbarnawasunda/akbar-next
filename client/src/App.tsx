import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ContentStudio from "./pages/ContentStudio";
import AssetLibrary from "./pages/AssetLibrary";
import LegacyDocument from "./components/LegacyDocument";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/lab"} component={() => <LegacyDocument source="/legacy/index.html" />} />
      <Route path={"/assets"} component={AssetLibrary} />
      <Route path={"/studio"} component={ContentStudio} />
      <Route path={"/admin"} component={() => <LegacyDocument source="/legacy/admin.html" scripts="admin" />} />
      <Route path={"/epk"} component={() => <LegacyDocument source="/legacy/epk.html" />} />
      <Route path={"/privacy"} component={() => <LegacyDocument source="/legacy/privacy.html" />} />
      <Route path={"/404"} component={() => <LegacyDocument source="/legacy/404.html" />} />
      {/* Final fallback route */}
      <Route component={() => <LegacyDocument source="/legacy/404.html" />} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
