import { createPageMetadata, SitePage } from "@app/_lib/site-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return createPageMetadata('/en/music' + "/" + slug);
}

export default async function ReleasePage({ params }: Props) {
  const { slug } = await params;
  return <SitePage pathname={'/en/music' + "/" + slug} route='enRelease' />;
}
