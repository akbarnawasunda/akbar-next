import { allPlatformLinks } from "@/content/artistPlatform";
import { PlatformIcon } from "./PlatformIcon";
import "./PlatformTicker.css";

export function PlatformTicker() {
  const items = [...allPlatformLinks, ...allPlatformLinks];
  return <section className="an-platform-ticker" aria-label="Official music platforms"><div className="an-platform-ticker-track" aria-hidden="true">{items.map((platform, index) => <span key={`${platform.label}-${index}`}><PlatformIcon label={platform.label} /><b>{platform.label}</b><i>•</i></span>)}</div><nav className="an-platform-ticker-links" aria-label="Official platform links">{allPlatformLinks.map(platform => <a href={platform.href} target="_blank" rel="noreferrer" key={platform.label}>{platform.label}</a>)}</nav></section>;
}
