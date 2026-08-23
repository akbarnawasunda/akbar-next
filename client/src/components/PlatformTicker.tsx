import { publicPlatformLinks, usePublicArtistContent } from "@/content/publicContent";
import { PlatformIcon } from "./PlatformIcon";
import "./PlatformTicker.css";

export function PlatformTicker() {
  const cms = usePublicArtistContent();
  const links = publicPlatformLinks(cms.data);
  const items = [...links, ...links];
  return <section className="an-platform-ticker" aria-label="Official music platforms"><div className="an-platform-ticker-track" aria-hidden="true">{items.map((platform, index) => <span key={`${platform.label}-${index}`}><PlatformIcon label={platform.label} /><b>{platform.label}</b><i>•</i></span>)}</div><nav className="an-platform-ticker-links" aria-label="Official platform links">{links.map(platform => <a href={platform.href} target="_blank" rel="noreferrer" key={platform.label}>{platform.label}</a>)}</nav></section>;
}
