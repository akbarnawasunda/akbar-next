import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/studio/inquiries');

export default function Page() {
  return <SitePage pathname='/studio/inquiries' route='inquiryStudio' />;
}
