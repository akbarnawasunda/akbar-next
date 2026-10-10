import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/about');

export default function Page() {
  return <SitePage pathname='/about' route='about' />;
}
