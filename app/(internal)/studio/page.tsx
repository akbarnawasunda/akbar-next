import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/studio');

export default function Page() {
  return <SitePage pathname='/studio' route='contentStudio' />;
}
