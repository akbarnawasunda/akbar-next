import { useState } from "react";
import { officialBrand } from "@/content/artistPlatform";

type Props = {
  className: string;
  alt: string;
  /** Logo di masthead: di atas fold, jadi dimuat lebih awal. */
  priority?: boolean;
};

export function ResilientBrandImage({ className, alt, priority = false }: Props) {
  const [src, setSrc] = useState(officialBrand.logo);

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={512}
      height={357}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
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
