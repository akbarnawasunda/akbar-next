import "@/studio/studio.css";

/** Rangka studio saat sesi owner masih diverifikasi. */
export function DashboardLayoutSkeleton() {
  return (
    <div className="studio-os">
      <div className="studio-frame">
        <aside className="studio-side">
          <div className="studio-side-head">
            <span className="studio-mark" aria-hidden>
              <span className="studio-mark-glyph">AN</span>
            </span>
            <div className="studio-side-id">
              <b>Akbar Nawasunda</b>
              <span>Studio OS</span>
            </div>
          </div>
          <div className="studio-side-scroll space-y-2 pt-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-white/[0.045]"
                style={{ animationDelay: `${index * 70}ms` }}
              />
            ))}
          </div>
        </aside>
        <div className="studio-main">
          <header className="studio-top">
            <div className="h-4 w-40 animate-pulse rounded bg-white/[0.07]" />
          </header>
          <main className="studio-body">
            <div className="studio-canvas space-y-5">
              <div className="h-40 animate-pulse rounded-[22px] bg-white/[0.045]" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-2xl bg-white/[0.04]"
                    style={{ animationDelay: `${index * 80}ms` }}
                  />
                ))}
              </div>
              <div className="h-72 animate-pulse rounded-2xl bg-white/[0.035]" />
            </div>
          </main>
        </div>
      </div>
      <p className="pointer-events-none fixed inset-x-0 bottom-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
        Memeriksa sesi owner…
      </p>
    </div>
  );
}
