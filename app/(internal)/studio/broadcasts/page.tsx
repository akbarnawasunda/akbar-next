import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/studio/broadcasts');

export default function Page() {
  return <SitePage pathname='/studio/broadcasts' route='broadcastStudio' />;
}
