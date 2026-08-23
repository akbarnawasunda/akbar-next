import { useState } from "react";
import { officialBrand } from "@/content/artistPlatform";

type Props = {
  className: string;
  alt: string;
};

export function ResilientBrandImage({ className, alt }: Props) {
  const [src, setSrc] = useState(officialBrand.logo);

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={event => {
        if (src !== officialBrand.logoFallback) {
          setSrc(officialBrand.logoFallback);
        } else {
          event.currentTarget.style.visibility = "hidden";
        }
      }}
    />
  );
}
