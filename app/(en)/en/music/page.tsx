import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/en/music');

export default function Page() {
  return <SitePage pathname='/en/music' route='enMusic' />;
}
