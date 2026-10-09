import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/inquire');

export default function Page() {
  return <SitePage pathname='/inquire' route='inquire' />;
}
