import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/live');

export default function Page() {
  return <SitePage pathname='/live' route='live' />;
}
