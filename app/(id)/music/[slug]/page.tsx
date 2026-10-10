import { createPageMetadata, SitePage } from "@app/_lib/site-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return createPageMetadata('/music' + "/" + slug);
}

export default async function ReleasePage({ params }: Props) {
  const { slug } = await params;
  return <SitePage pathname={'/music' + "/" + slug} route='release' />;
}
