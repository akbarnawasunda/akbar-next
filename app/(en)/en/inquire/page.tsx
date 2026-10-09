import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/en/inquire');

export default function Page() {
  return <SitePage pathname='/en/inquire' route='enInquire' />;
}
