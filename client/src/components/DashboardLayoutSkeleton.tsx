import "@/studio/studio.css";

export function DashboardLayoutSkeleton() {
  return (
    <div className="studio-os">
      <div className="studio-frame">
        <aside className="studio-side">
          <div className="studio-side-head">
            <span className="studio-mark" aria-hidden>AN</span>
            <div className="studio-side-id">
              <b>Studio</b>
              <span>Loading</span>
            </div>
          </div>
          <div className="studio-side-scroll space-y-2 pt-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-zinc-900" style={{ animationDelay: `${index * 70}ms` }} />
            ))}
          </div>
        </aside>
        <div className="studio-main">
          <header className="studio-top">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
          </header>
          <main className="studio-body">
            <div className="studio-canvas space-y-5">
              <div className="h-36 animate-pulse rounded-2xl bg-zinc-900" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-xl bg-zinc-900" style={{ animationDelay: `${index * 80}ms` }} />
                ))}
              </div>
              <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
            </div>
          </main>
        </div>
      </div>
      <p className="pointer-events-none fixed inset-x-0 bottom-6 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600">Memeriksa sesi owner…</p>
    </div>
  );
}
