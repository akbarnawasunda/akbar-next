import {
  siApplemusic,
  siDeezer,
  siInstagram,
  siSoundcloud,
  siSpotify,
  siTidal,
  siTiktok,
  siX,
  siYoutube,
} from "simple-icons";
import "./PlatformIcon.css";

const musicPlatforms: Record<string, string> = {
  spotify: siSpotify.path,
  youtube: siYoutube.path,
  soundcloud: siSoundcloud.path,
  instagram: siInstagram.path,
  "apple music": siApplemusic.path,
  deezer: siDeezer.path,
  tidal: siTidal.path,
  tiktok: siTiktok.path,
  x: siX.path,
};

const aliases: Record<string, string> = {
  applemusic: "apple music",
  amazonmusic: "amazon music",
  twitter: "x",
  twitterx: "x",
  xtwitter: "x",
  x: "x",
};

function AmazonMusicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5.7 16.5c3 2.1 7.9 2.4 11.8.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m15.7 15.8 2.2.3-.7 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 14.3V5.8l7-1.3v8.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.8" cy="15.2" r="2" fill="currentColor" />
      <circle cx="13.8" cy="13.9" r="2" fill="currentColor" />
    </svg>
  );
}

function GenericMusicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M9 18V6l9-2v12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
      <circle cx="15.5" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

function canonicalPlatformLabel(label: string) {
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/[\u00a0\s]+/g, " ");
  const compact = normalized.replace(/[^a-z0-9]+/g, "");
  return aliases[compact] ?? normalized;
}

export function PlatformIcon({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const canonicalLabel = canonicalPlatformLabel(label);
  const iconClass = canonicalLabel.replace(/\s+/g, "-");
  const iconPath = musicPlatforms[canonicalLabel];

  return (
    <span
      className={`an-platform-icon an-platform-${iconClass} ${className}`.trim()}
      aria-hidden="true"
    >
      {iconPath ? (
        <svg viewBox="0 0 24 24" focusable="false">
          <path d={iconPath} />
        </svg>
      ) : canonicalLabel === "amazon music" ? (
        <AmazonMusicIcon />
      ) : (
        <GenericMusicIcon />
      )}
    </span>
  );
}
