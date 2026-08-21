"use client";

/** Design philosophy: Analog Signal Desk — preserve the legacy artifact while giving it a stable Next.js client boundary. */
import { useEffect, useState } from "react";
import ClientScripts from "./ClientScripts";

type LegacyDocumentProps = {
  source: string;
  scriptSet: "home" | "admin";
};

export default function LegacyDocument({ source, scriptSet }: LegacyDocumentProps) {
  const [markup, setMarkup] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(source)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${source}`);
        return response.text();
      })
      .then((html) => {
        if (!active) return;
        const parsed = new DOMParser().parseFromString(html, "text/html");
        const normalized = parsed.body.innerHTML
          .replaceAll('src="assets/', 'src="/assets/')
          .replaceAll("src='assets/", "src='/assets/")
          .replaceAll('href="assets/', 'href="/assets/')
          .replaceAll("href='assets/", "href='/assets/")
          .replaceAll('href="/favicon.png', 'href="/assets/media/favicon.png')
          .replaceAll("href='/favicon.png", "href='/assets/media/favicon.png");
        setMarkup(normalized);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [source]);

  if (error) {
    return (
      <main className="legacy-load-error" role="alert">
        <p>Unable to load this page right now.</p>
        <a href="/">Return to the archive</a>
      </main>
    );
  }

  return (
    <>
      <div className="legacy-root" dangerouslySetInnerHTML={{ __html: markup }} />
      {markup && <ClientScripts scriptSet={scriptSet} />}
    </>
  );
}
