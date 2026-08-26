import type { CSSProperties, ImgHTMLAttributes } from "react";
import "./FragmentRevealImage.css";

type FragmentRevealImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  tileColumns?: number;
  tileRows?: number;
};

export function FragmentRevealImage({
  src,
  alt,
  className,
  tileColumns = 4,
  tileRows = 4,
  ...imageProps
}: FragmentRevealImageProps) {
  const tileCount = tileColumns * tileRows;
  const imageStyle = {
    "--fragment-image": `url("${String(src).replace(/"/g, '\\"')}")`,
    "--fragment-columns": tileColumns,
    "--fragment-rows": tileRows,
  } as CSSProperties;

  return (
    <span className="nf-fragment-image" style={imageStyle}>
      <img className={`nf-fragment-image-base${className ? ` ${className}` : ""}`} src={src} alt={alt} {...imageProps} />
      <span className="nf-fragment-image-tiles" aria-hidden="true">
        {Array.from({ length: tileCount }, (_, index) => (
          <i
            key={index}
            style={{ "--fragment-index": index } as CSSProperties}
          />
        ))}
      </span>
    </span>
  );
}
