import { officialBrand } from "@/content/artistPlatform";
import "./ArtistSignalMotion.css";

export function ArtistSignalMotion({ className = "" }: { className?: string }) {
  return <div className={`an-signal-motion ${className}`} aria-hidden="true"><div className="an-particle-field">{Array.from({ length: 26 }, (_, index) => <i key={index} style={{ "--particle": index } as React.CSSProperties} />)}</div><div className="an-vinyl"><span className="an-vinyl-groove groove-one" /><span className="an-vinyl-groove groove-two" /><span className="an-vinyl-groove groove-three" /><span className="an-vinyl-label"><img src={officialBrand.logo} alt="" /></span></div></div>;
}
