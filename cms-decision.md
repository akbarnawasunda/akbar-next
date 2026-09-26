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

## Free-plan decision

Sanity’s official documentation states that every new project receives a limited Growth trial, but the trial does **not** automatically create a paid charge. At the end of the trial, doing nothing automatically downgrades the project to the Free plan; a payment method is only required if the owner actively upgrades to Growth. The Free plan is listed as `$0 forever`, includes Sanity Studio hosting, and is designed for individuals or smaller projects. This artist platform can remain on the Free plan because it uses a public dataset and requires only a single owner administrator. The paid-only trial features—such as private datasets, additional editing roles, scheduled drafts, comments, and AI Assist—are not required for the planned publishing workflow.

## Official sources

- [Sanity Pricing](https://www.sanity.io/pricing)
- [Understanding the Growth plan trial](https://www.sanity.io/docs/platform-management/growth-plan-trial)
- [Plans and payments](https://www.sanity.io/docs/platform-management/plans-and-payments)

## References

- [Vercel Sanity Marketplace integration](https://vercel.com/marketplace/sanity)
- [Vercel headless-CMS integration overview](https://vercel.com/docs/integrations/cms)
