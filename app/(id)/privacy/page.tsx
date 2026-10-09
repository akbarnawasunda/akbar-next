import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/privacy');

export default function Page() {
  return <SitePage pathname='/privacy' route='privacy' />;
}
