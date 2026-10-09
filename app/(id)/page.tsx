import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/');

export default function Page() {
  return <SitePage pathname='/' route='home' />;
}
