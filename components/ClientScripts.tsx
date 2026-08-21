"use client";

/** Design philosophy: Analog Signal Desk — load the original instruments intact, in a deliberate browser-only sequence. */
import { useEffect } from "react";

const sharedScripts = [
  "/assets/js/translations.js?v=1",
  "/assets/js/audio.js?v=1",
  "/assets/js/jedag-run.js?v=1",
  "/assets/js/share-card.js?v=2",
  "/assets/js/app.js?v=16",
  "/assets/js/wav-export.js?v=1",
  "/assets/js/content-render.js?v=14",
  "/assets/js/fx.js?v=2",
  "/assets/js/particles.js?v=6",
  "/assets/js/previews.js?v=2",
  "/assets/js/embed-skin.js?v=3",
  "/assets/js/footer.js?v=2",
  "/assets/js/newsletter.js?v=1",
  "/assets/js/smart-collab.js?v=1",
  "/assets/js/seo-jsonld.js?v=1",
];

type ClientScriptsProps = { scriptSet: "home" | "admin" };

export default function ClientScripts({ scriptSet }: ClientScriptsProps) {
  useEffect(() => {
    const sources = scriptSet === "home" ? sharedScripts : ["/assets/js/admin.js?v=1"];
    const scripts: HTMLScriptElement[] = [];
    let cancelled = false;
    const load = async () => {
      if (scriptSet === "home") {
        await new Promise<void>((resolve) => {
          if ((window as Window & { THREE?: unknown }).THREE) return resolve();
          const three = document.createElement("script");
          three.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
          three.onload = () => resolve();
          three.onerror = () => resolve();
          document.head.appendChild(three);
          scripts.push(three);
        });
      }
      for (const source of sources) {
        if (cancelled) return;
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = source;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          document.body.appendChild(script);
          scripts.push(script);
        });
      }
      if (!cancelled && "serviceWorker" in navigator) {
        window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined), { once: true });
      }
    };
    void load();
    return () => {
      cancelled = true;
      scripts.forEach((script) => script.remove());
    };
  }, [scriptSet]);

  return null;
}
