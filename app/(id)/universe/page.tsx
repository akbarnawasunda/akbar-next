import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/universe');

export default function Page() {
  return <SitePage pathname='/universe' route='universe' />;
}
