import appleMusic from "simple-icons/icons/applemusic.svg?raw";
import deezer from "simple-icons/icons/deezer.svg?raw";
import instagram from "simple-icons/icons/instagram.svg?raw";
import soundcloud from "simple-icons/icons/soundcloud.svg?raw";
import spotify from "simple-icons/icons/spotify.svg?raw";
import tidal from "simple-icons/icons/tidal.svg?raw";
import tiktok from "simple-icons/icons/tiktok.svg?raw";
import x from "simple-icons/icons/x.svg?raw";
import youtube from "simple-icons/icons/youtube.svg?raw";
import "./PlatformIcon.css";

const amazonMusic = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.7 16.5c3 2.1 7.9 2.4 11.8.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m15.7 15.8 2.2.3-.7 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 14.3V5.8l7-1.3v8.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.8" cy="15.2" r="2" fill="currentColor"/><circle cx="13.8" cy="13.9" r="2" fill="currentColor"/></svg>';
const musicNote = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l9-2v12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="15.5" cy="16" r="2.5" fill="currentColor"/></svg>';

const iconMarkup: Record<string, string> = {
  spotify, youtube, soundcloud, instagram, "apple music": appleMusic, deezer, "amazon music": amazonMusic, tidal, tiktok, x,
};

export function PlatformIcon({ label, className = "" }: { label: string; className?: string }) {
  const markup = iconMarkup[label.toLowerCase()] || musicNote;
  return <span className={`an-platform-icon an-platform-${label.toLowerCase().replace(/\s+/g, "-")} ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />;
}
