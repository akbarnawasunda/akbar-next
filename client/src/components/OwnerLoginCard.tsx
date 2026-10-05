import { FormEvent, useState } from "react";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import "@/studio/studio.css";

export default function OwnerLoginCard({
  title = "Owner access",
  description = "Masuk dengan kredensial owner privat untuk mengelola website.",
}: {
  title?: string;
  description?: string;
}) {
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("owner");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const login = trpc.auth.dashboardLogin.useMutation({
    onSuccess: async () => {
      setPassword("");
      await utils.auth.me.invalidate();
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ username, password });
  }

  return (
    <main className="studio-os grid min-h-dvh place-items-center p-5">
      <section className="st-panel st-rise relative z-[1] w-full max-w-[420px]">
        <div className="st-panel-body !p-7">
          <div className="flex items-center gap-3">
            <span className="studio-mark" aria-hidden>
              <span className="studio-mark-glyph">AN</span>
            </span>
            <div>
              <p className="st-eyebrow">Private dashboard</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
                {title}
              </h1>
            </div>
          </div>
          <p className="st-sub mt-4">{description}</p>

          <form className="mt-7 grid gap-4" onSubmit={submit}>
            <label className="grid gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                Username
              </span>
              <input
                className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200/50"
                value={username}
                onChange={event => setUsername(event.target.value)}
                autoComplete="username"
                maxLength={64}
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                Password
              </span>
              <span className="relative block">
                <input
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 pr-11 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200/50"
                  type={reveal ? "text" : "password"}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="current-password"
                  maxLength={512}
                  required
                />
                <button
                  type="button"
                  onClick={() => setReveal(value => !value)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-cyan-200"
                  aria-label={
                    reveal ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {reveal ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
            </label>

            {login.error ? (
              <p className="rounded-xl border border-red-300/25 bg-red-400/[0.08] px-3 py-2.5 text-xs leading-5 text-red-100">
                {login.error.message}
              </p>
            ) : null}

            <button
              type="submit"
              className="st-btn mt-1 h-11 w-full"
              data-variant="primary"
              disabled={login.isPending}
            >
              <LockKeyhole size={15} />
              {login.isPending ? "Memeriksa akses…" : "Masuk ke Studio"}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2.5 border-t border-white/[0.07] pt-5">
            <ShieldCheck
              size={14}
              className="mt-0.5 shrink-0 text-emerald-300/80"
            />
            <p className="text-[11px] leading-5 text-white/35">
              Akses ini dijaga secret sisi server. Password tidak pernah
              disimpan di browser maupun di repository.
            </p>
          </div>

          <a
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-cyan-100/70 transition hover:text-cyan-100"
            href="/"
          >
            Kembali ke situs publik <ArrowUpRight size={13} />
          </a>
        </div>
      </section>
    </main>
  );
}
