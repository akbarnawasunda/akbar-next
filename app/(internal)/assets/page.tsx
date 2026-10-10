import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/assets');

export default function Page() {
  return <SitePage pathname='/assets' route='assetLibrary' />;
}
