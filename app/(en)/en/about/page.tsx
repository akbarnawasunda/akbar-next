import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/en/about');

export default function Page() {
  return <SitePage pathname='/en/about' route='enAbout' />;
}
