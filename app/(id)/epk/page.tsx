import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/epk');

export default function Page() {
  return <SitePage pathname='/epk' route='epk' />;
}
