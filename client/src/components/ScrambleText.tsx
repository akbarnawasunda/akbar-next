import "./ScrambleText.css";

type HeadingTag = "span" | "p" | "h1" | "h2" | "h3";

export function ScrambleText({ text, className = "", as: Tag = "span", id }: { text: string; className?: string; as?: HeadingTag; delay?: number; interactive?: boolean; signature?: boolean; duration?: number; autoStart?: boolean; id?: string }) {
  return <Tag id={id} className={`an-scramble ${className}`}><span>{text}</span></Tag>;
}
