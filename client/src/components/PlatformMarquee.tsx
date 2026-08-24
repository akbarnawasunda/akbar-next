import { PlatformIcon } from "@/components/PlatformIcon";
import { allPlatformLinks } from "@/content/artistPlatform";
import type { CmsPlatformLink } from "@/content/publicContent";

type PlatformLink = CmsPlatformLink;

function MarqueeRow({
  links,
  reverse,
}: {
  links: PlatformLink[];
  reverse?: boolean;
}) {
  return (
    <div className={`an-platform-marquee-row${reverse ? " is-reverse" : ""}`}>
      <div className="an-platform-marquee-track">
        <div className="an-platform-marquee-set">
          {links.map(platform => (
            <a
              className="an-platform-marquee-item"
              href={platform.href}
              key={`${reverse ? "reverse" : "forward"}-${platform.label}`}
              target="_blank"
              rel="noreferrer"
            >
              <PlatformIcon label={platform.label} />
              <span>{platform.label}</span>
            </a>
          ))}
        </div>
        <div className="an-platform-marquee-set" aria-hidden="true">
          {links.map(platform => (
            <span
              className="an-platform-marquee-item"
              key={`${reverse ? "reverse-copy" : "forward-copy"}-${platform.label}`}
            >
              <PlatformIcon label={platform.label} />
              <span>{platform.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlatformMarquee({ links = allPlatformLinks }: { links?: PlatformLink[] }) {
  const splitAt = Math.ceil(links.length / 2);
  const rows = [links.slice(0, splitAt), links.slice(splitAt)];
  return (
    <div className="an-platform-marquee" aria-label="Platform musik resmi">
      <div className="an-platform-marquee-heading">
        <span>PLATFORM RESMI</span>
        <span>GESER UNTUK LIHAT</span>
      </div>
      <MarqueeRow links={rows[0]} reverse />
      <MarqueeRow links={rows[1]} />
    </div>
  );
}

export function SectionIndex({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="an-section-index" aria-hidden="true">
      <span>{number}</span>
      <i />
      <span>{label}</span>
    </div>
  );
}
