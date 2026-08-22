# CMS Decision: Sanity for the Vercel-Facing Artist Platform

The Vercel deployment serves a Vite static application, so the existing Manus Express/tRPC Studio cannot provide public content management there. The selected replacement is **Sanity**: the owner works in a hosted browser-based Studio, while the public Vite application reads published artist content through Sanity’s Content Lake API.

| Requirement | Sanity approach |
|---|---|
| No-code owner editing | A browser-based Sanity Studio provides structured forms for artist settings, releases, videos, live status, and external links. |
| Compatible with Vercel static hosting | The public application can read published content at runtime from a public Sanity dataset; content changes do not require a GitHub code edit. |
| Media management | Artwork and images can be uploaded through the Sanity Studio and delivered through Sanity’s CDN. |
| Security | The public site uses only the public project ID and dataset. Write credentials remain in the owner-controlled Sanity Studio and are never embedded in the Vite application. |
| Future expansion | Additional schemas can cover event dates, booking materials, press assets, fan drops, and community content. |

## Owner setup required

The owner must create a Sanity account and a project with a public production dataset. The integration then requires only the project ID and dataset name for read-only public content. Sanity Studio access remains controlled by the owner’s Sanity account.

## References

- [Vercel Sanity Marketplace integration](https://vercel.com/marketplace/sanity)
- [Vercel headless-CMS integration overview](https://vercel.com/docs/integrations/cms)
