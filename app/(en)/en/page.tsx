import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/en');

export default function Page() {
  return <SitePage pathname='/en' route='enHome' />;
}
