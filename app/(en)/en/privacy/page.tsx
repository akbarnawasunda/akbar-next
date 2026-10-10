import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/en/privacy');

export default function Page() {
  return <SitePage pathname='/en/privacy' route='enPrivacy' />;
}
