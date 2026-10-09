import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/admin');

export default function Page() {
  return <SitePage pathname='/admin' route='admin' />;
}
