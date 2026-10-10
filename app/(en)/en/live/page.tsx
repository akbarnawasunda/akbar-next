import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/en/live');

export default function Page() {
  return <SitePage pathname='/en/live' route='enLive' />;
}
