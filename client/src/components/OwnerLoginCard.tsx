import { FormEvent, useState } from "react";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
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
      <section className="st-panel st-rise relative z-[1] w-full max-w-[400px]">
        <div className="st-panel-body !p-7">
          <div className="flex items-center gap-3">
            <span className="studio-mark" aria-hidden>AN</span>
            <div>
              <p className="st-eyebrow">Private</p>
              <h1 className="mt-1 text-[18px] font-semibold tracking-tight text-white">{title}</h1>
            </div>
          </div>
          <p className="st-sub mt-3">{description}</p>

          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <label className="grid gap-2">
              <span className="st-field-label">Username</span>
              <input className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[13px] text-white outline-none placeholder:text-zinc-600 focus:border-zinc-700" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" maxLength={64} required />
            </label>
            <label className="grid gap-2">
              <span className="st-field-label">Password</span>
              <span className="relative block">
                <input className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 pr-10 text-[13px] text-white outline-none placeholder:text-zinc-600 focus:border-zinc-700" type={reveal ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" maxLength={512} required />
                <button type="button" onClick={() => setReveal(v => !v)} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white" aria-label={reveal ? "Sembunyikan" : "Tampilkan"}>{reveal ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </span>
            </label>

            {login.error ? <p className="rounded-lg border border-red-900/30 bg-red-950/30 px-3 py-2.5 text-[12px] leading-5 text-red-200">{login.error.message}</p> : null}

            <button type="submit" className="st-btn mt-1 h-10 w-full" data-variant="primary" disabled={login.isPending}><LockKeyhole size={14} />{login.isPending ? "Memeriksa…" : "Masuk ke Studio"}</button>
          </form>

          <div className="mt-6 flex items-start gap-2.5 border-t border-zinc-800 pt-5">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-zinc-500" />
            <p className="text-[11px] leading-5 text-zinc-500">Akses dijaga secret server. Password tidak disimpan di browser maupun repo.</p>
          </div>

          <a className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-white" href="/">Kembali ke publik <ArrowUpRight size={12} /></a>
        </div>
      </section>
    </main>
  );
}
