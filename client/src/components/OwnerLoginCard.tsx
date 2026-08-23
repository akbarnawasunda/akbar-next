import { FormEvent, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OwnerLoginCard({
  title = "Owner access",
  description = "Sign in with the private owner credentials to manage the website.",
}: {
  title?: string;
  description?: string;
}) {
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("owner");
  const [password, setPassword] = useState("");
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
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <section className="w-full max-w-md rounded-2xl border bg-card p-7 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">AN // PRIVATE DASHBOARD</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        <form className="mt-7 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm">
            Username
            <Input
              value={username}
              onChange={event => setUsername(event.target.value)}
              autoComplete="username"
              maxLength={64}
              required
            />
          </label>
          <label className="grid gap-2 text-sm">
            Password
            <Input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              maxLength={512}
              required
            />
          </label>
          {login.error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {login.error.message}
            </p>
          ) : null}
          <Button type="submit" className="mt-2 w-full" disabled={login.isPending}>
            <LockKeyhole className="mr-2 h-4 w-4" />
            {login.isPending ? "Checking access…" : "Sign in securely"}
          </Button>
        </form>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          This access is protected by a server-side environment secret. The website never stores the password in the browser or repository.
        </p>
      </section>
    </main>
  );
}
