import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { usePublicArtistContent, publicUpcomingEvents } from "@/content/publicContent";
import { releases as catalogReleases } from "@/content/artistPlatform";
import { useSignatureRuntime, useSignatureState } from "@/signature/useSignature";
import "./CommandPalette.css";

/**
 * Command palette (Cmd/Ctrl + K).
 *
 * Hanya hidup setelah interaksi di client — tidak pernah bocor ke HTML SSR.
 * Navigasi memakai router yang sudah ada (wouter), fokus terkunci selama
 * terbuka, ESC menutup, dan seluruh daftar bisa dijelajahi dengan panah.
 */

type Command = {
  id: string;
  label: string;
  hint: string;
  group: string;
  href?: string;
  external?: boolean;
  action?: () => void;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function CommandPalette() {
  const [, navigate] = useLocation();
  const { actions } = useSignatureRuntime();
  const lang = useSignatureState(snapshot => snapshot.route.lang);
  const frequency = useSignatureState(snapshot => snapshot.frequency);
  const cms = usePublicArtistContent();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const listId = useId();

  const copy =
    lang === "en"
      ? {
          title: "Search Akbar Nawasunda",
          placeholder: "Pages, releases, events, booking…",
          empty: "No match. Try another keyword.",
          footer: "ESC to close · ↑ ↓ to move · ENTER to open",
          pages: "PAGES",
          releases: "RELEASES",
          events: "EVENTS",
          actions: "ACTIONS",
        }
      : {
          title: "Cari di Akbar Nawasunda",
          placeholder: "Halaman, rilisan, jadwal, booking…",
          empty: "Tidak ada yang cocok. Coba kata lain.",
          footer: "ESC tutup · ↑ ↓ pindah · ENTER buka",
          pages: "HALAMAN",
          releases: "RILISAN",
          events: "JADWAL",
          actions: "AKSI",
        };

  const prefix = lang === "en" ? "/en" : "";

  const commands = useMemo<Command[]>(() => {
    const pages: [string, string, string][] =
      lang === "en"
        ? [
            ["Home", "/en", "Start page"],
            ["Music", "/en/music", "Official catalogue"],
            ["Visuals", "/en/visuals", "Videos & visual work"],
            ["Portrait studies", "/en/visuals/portraits", "Portrait gallery"],
            ["Live", "/en/live", "Dates & stage archive"],
            ["Archive", "/en/universe", "Eras & timeline"],
            ["About", "/en/about", "Artist biography"],
            ["EPK", "/en/epk", "Press kit & booking"],
            ["Inquire", "/en/inquire", "Direct inquiry"],
            ["Licensing", "/en/licensing", "Music licensing"],
            ["Jedag Run", "/en/game/jedag-run", "Browser game"],
            ["Privacy", "/en/privacy", "Privacy policy"],
          ]
        : [
            ["Beranda", "/", "Halaman utama"],
            ["Musik", "/music", "Katalog resmi"],
            ["Visual", "/visuals", "Video & karya visual"],
            ["Studi potret", "/visuals/portraits", "Galeri potret"],
            ["Jadwal live", "/live", "Jadwal & arsip panggung"],
            ["Arsip", "/universe", "Babak & linimasa"],
            ["Tentang", "/about", "Profil artis"],
            ["EPK", "/epk", "Press kit & booking"],
            ["Kontak", "/inquire", "Inquiry langsung"],
            ["Lisensi", "/licensing", "Lisensi musik"],
            ["Jedag Run", "/game/jedag-run", "Game browser"],
            ["Privasi", "/privacy", "Kebijakan privasi"],
          ];

    const pageCommands: Command[] = pages.map(([label, href, hint]) => ({
      id: `page:${href}`,
      label,
      hint,
      href,
      group: copy.pages,
    }));

    const cmsReleases = cms.data?.releases ?? [];
    const releaseList = cmsReleases.length
      ? cmsReleases.map(item => ({ title: item.title, year: item.year || "" }))
      : catalogReleases.map(item => ({ title: item.title, year: item.year }));
    const releaseCommands: Command[] = releaseList.slice(0, 12).map(item => ({
      id: `release:${item.title}`,
      label: item.title,
      hint: item.year || (lang === "en" ? "Release" : "Rilisan"),
      href: `${prefix}/music/${slugify(item.title)}`,
      group: copy.releases,
    }));

    const eventCommands: Command[] = publicUpcomingEvents(cms.data)
      .slice(0, 8)
      .map(event => ({
        id: `event:${event._id}`,
        label: event.title,
        hint: [event.date, event.city].filter(Boolean).join(" · "),
        href: `${prefix}/live`,
        group: copy.events,
      }));

    const actionCommands: Command[] = [
      {
        id: "action:booking",
        label: lang === "en" ? "Booking inquiry" : "Inquiry booking",
        hint: lang === "en" ? "Send a booking brief" : "Kirim brief booking",
        href: `${prefix}/inquire?type=booking&source=palette`,
        group: copy.actions,
      },
      {
        id: "action:remix",
        label: lang === "en" ? "Remix / collaboration" : "Remix / kolaborasi",
        hint: lang === "en" ? "Project brief" : "Brief project",
        href: `${prefix}/inquire?type=remix&source=palette`,
        group: copy.actions,
      },
      {
        id: "action:language",
        label: lang === "en" ? "Switch to Indonesian" : "Ganti ke bahasa Inggris",
        hint: lang === "en" ? "Bahasa Indonesia" : "English",
        href: lang === "en" ? "/" : "/en",
        group: copy.actions,
      },
      {
        id: "action:frequency",
        label:
          lang === "en"
            ? frequency.active
              ? "Turn off frequency mode"
              : "Turn on frequency mode"
            : frequency.active
              ? "Matikan mode frequency"
              : "Nyalakan mode frequency",
        hint: lang === "en" ? "Signature visual mode" : "Mode visual signature",
        group: copy.actions,
        action: () => actions.toggleFrequency(),
      },
      {
        id: "action:frequency-disable",
        label:
          lang === "en"
            ? frequency.enabled
              ? "Disable hidden frequency easter egg"
              : "Enable hidden frequency easter egg"
            : frequency.enabled
              ? "Nonaktifkan easter egg frequency"
              : "Aktifkan easter egg frequency",
        hint: lang === "en" ? "Session preference" : "Preferensi sesi",
        group: copy.actions,
        action: () => actions.setFrequencyEnabled(!frequency.enabled),
      },
    ];

    return [
      ...pageCommands,
      ...releaseCommands,
      ...eventCommands,
      ...actionCommands,
    ];
  }, [actions, cms.data, copy, frequency, lang, prefix]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter(command =>
      `${command.label} ${command.hint} ${command.group}`
        .toLowerCase()
        .includes(needle)
    );
  }, [commands, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(value => {
          if (!value) {
            triggerRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }
          return !value;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      const trigger = triggerRef.current;
      if (trigger) {
        const frame = requestAnimationFrame(() => trigger.focus());
        return () => cancelAnimationFrame(frame);
      }
      return;
    }
    setQuery("");
    setCursor(0);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const run = (command: Command) => {
    setOpen(false);
    if (command.action) {
      command.action();
      return;
    }
    if (!command.href) return;
    if (command.external) {
      window.open(command.href, "_blank", "noreferrer");
      return;
    }
    navigate(command.href);
  };

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor(value => (results.length ? (value + 1) % results.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor(value =>
        results.length ? (value - 1 + results.length) % results.length : 0
      );
      return;
    }
    if (event.key === "Enter") {
      const command = results[cursor];
      if (command) {
        event.preventDefault();
        run(command);
      }
      return;
    }
    if (event.key === "Tab") {
      // Focus trap sederhana: palette hanya punya input + daftar tombol.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "input, button"
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  let lastGroup = "";

  return (
    <div
      className="an-command-backdrop"
      role="presentation"
      onPointerDown={event => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        className="an-command"
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        ref={dialogRef}
        onKeyDown={onDialogKeyDown}
      >
        <label className="an-command-label" htmlFor="an-command-input">
          {copy.title}
        </label>
        <input
          id="an-command-input"
          ref={inputRef}
          type="text"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[cursor] ? `cmd-${cursor}` : undefined}
          onChange={event => {
            setQuery(event.target.value);
            setCursor(0);
          }}
          placeholder={copy.placeholder}
        />

        <div className="an-command-results" id={listId} role="listbox" aria-label={copy.title}>
          {results.length === 0 ? (
            <p className="an-command-empty">{copy.empty}</p>
          ) : (
            results.map((command, index) => {
              const showGroup = command.group !== lastGroup;
              lastGroup = command.group;
              return (
                <div key={command.id}>
                  {showGroup ? (
                    <p className="an-command-group">{command.group}</p>
                  ) : null}
                  <button
                    type="button"
                    id={`cmd-${index}`}
                    role="option"
                    aria-selected={index === cursor}
                    className={index === cursor ? "is-active" : undefined}
                    onPointerEnter={() => setCursor(index)}
                    onClick={() => run(command)}
                  >
                    <span>{command.label}</span>
                    <span className="an-command-hint">{command.hint}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <p className="an-command-footer">{copy.footer}</p>
      </div>
    </div>
  );
}
