import { createPageMetadata, SitePage } from "@app/_lib/site-page";

export const generateMetadata = () => createPageMetadata('/en/game/jedag-run');

export default function Page() {
  return <SitePage pathname='/en/game/jedag-run' route='enGame' />;
}
