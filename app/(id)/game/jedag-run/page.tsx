import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/game/jedag-run');

export default function Page() {
  return <SitePage pathname='/game/jedag-run' route='game' />;
}
