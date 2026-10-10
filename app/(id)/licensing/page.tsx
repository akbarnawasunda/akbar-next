import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/licensing');

export default function Page() {
  return <SitePage pathname='/licensing' route='licensing' />;
}
