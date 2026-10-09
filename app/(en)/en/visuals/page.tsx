import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/en/visuals');

export default function Page() {
  return <SitePage pathname='/en/visuals' route='enVisuals' />;
}
