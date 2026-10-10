import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/music');

export default function Page() {
  return <SitePage pathname='/music' route='music' />;
}
