/**
 * STUDIO SHELL v2 — lebih tenang, lebih jelas.
 * Sidebar: 2 grup saja (Konten & Sistem), label ringkas, tanpa glow berlebihan.
 */
import {
  ArrowUpRight,
  ChevronRight,
  Command as CommandIcon,
  ExternalLink,
  FilePenLine,
  FolderOpen,
  Globe2,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Radio,
  Rocket,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAuth } from "@/_core/hooks/useAuth";
import { jakartaTimeLabel } from "@/lib/jakartaTime";
import { useJakartaNow } from "./StudioClock";
import OwnerLoginCard from "./OwnerLoginCard";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import "@/studio/studio.css";

type MenuItem = {
  icon: typeof LayoutDashboard;
  label: string;
  caption: string;
  path: string;
  group: "Konten" | "Sistem";
  external?: boolean;
};

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Ringkasan",
    caption: "Status & jalan pintas",
    path: "/admin",
    group: "Konten",
  },
  {
    icon: FilePenLine,
    label: "Editor",
    caption: "Tulis & kelola halaman",
    path: "/studio",
    group: "Konten",
  },
  {
    icon: FolderOpen,
    label: "Media",
    caption: "Gambar, audio, file",
    path: "/assets",
    group: "Konten",
  },
  {
    icon: Inbox,
    label: "Inbox",
    caption: "Booking & kerja sama",
    path: "/studio/inquiries",
    group: "Sistem",
  },
  {
    icon: Radio,
    label: "Siaran",
    caption: "Fan Signal",
    path: "/studio/broadcasts",
    group: "Sistem",
  },
  {
    icon: Globe2,
    label: "Lihat Website",
    caption: "Buka situs publik",
    path: "/",
    group: "Sistem",
    external: true,
  },
];

const dockItems = menuItems.filter(item =>
  ["/admin", "/studio", "/assets", "/studio/inquiries"].includes(item.path)
);

const RAIL_KEY = "studio-rail-collapsed-v2";

function initialsOf(value?: string | null) {
  if (!value) return "A";
  return value.trim().charAt(0).toUpperCase() || "A";
}

function activeItemFor(location: string) {
  const matches = menuItems
    .filter(item => item.path !== "/" && location.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length);
  return matches[0] ?? menuItems[0];
}

export default function DashboardLayout({
  children,
  title,
  kicker,
}: {
  children: ReactNode;
  title?: string;
  kicker?: string;
}) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [rail, setRail] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const now = useJakartaNow(1000);

  useEffect(() => {
    try {
      setRail(localStorage.getItem(RAIL_KEY) === "1");
    } catch {}
  }, []);

  const toggleRail = useCallback(() => {
    setRail(previous => {
      const next = !previous;
      try {
        localStorage.setItem(RAIL_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => setDrawer(false), [location]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(open => !open);
      }
      if (meta && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleRail();
      }
      if (event.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleRail]);

  const active = useMemo(() => activeItemFor(location), [location]);

  const go = useCallback(
    (item: MenuItem) => {
      if (item.external) window.open(item.path, "_blank", "noreferrer");
      else setLocation(item.path);
    },
    [setLocation]
  );

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user)
    return (
      <OwnerLoginCard
        title="Studio access"
        description="Masuk dengan kredensial owner untuk membuka workspace."
      />
    );

  const clock = now ? jakartaTimeLabel(now) : "—:—";

  return (
    <div className="studio-os">
      <div className="studio-frame" data-rail={rail}>
        {drawer ? (
          <div
            className="studio-scrim lg:hidden"
            role="presentation"
            onClick={() => setDrawer(false)}
          />
        ) : null}

        <aside
          className="studio-side"
          data-rail={rail}
          data-open={drawer}
          aria-label="Studio navigation"
        >
          <div className="studio-side-head">
            <span className="studio-mark" aria-hidden>
              AN
            </span>
            <div className="studio-side-id">
              <b>Studio</b>
              <span>Akbar Nawasunda</span>
            </div>
            <button
              type="button"
              className="studio-rail-toggle hidden lg:grid"
              onClick={toggleRail}
              aria-label="Ciutkan navigasi"
              title="Ciutkan (⌘B)"
            >
              <PanelLeftClose size={14} />
            </button>
            <button
              type="button"
              className="studio-rail-toggle lg:hidden"
              onClick={() => setDrawer(false)}
              aria-label="Tutup navigasi"
            >
              <X size={14} />
            </button>
          </div>

          <div className="studio-pulse">
            <span className="studio-dot" aria-hidden />
            <div className="studio-pulse-copy">
              <b>Live</b>
              <span>WIB {clock}</span>
            </div>
          </div>

          <div className="studio-side-scroll">
            {(["Konten", "Sistem"] as const).map(group => (
              <div className="studio-nav-group" key={group}>
                <p className="studio-nav-label">
                  <span>{group}</span>
                  <i />
                </p>
                {menuItems
                  .filter(item => item.group === group)
                  .map(item => {
                    const isActive =
                      !item.external && active.path === item.path;
                    return (
                      <button
                        key={item.path}
                        type="button"
                        className="studio-nav-item"
                        data-active={isActive}
                        onClick={() => go(item)}
                        title={rail ? item.label : undefined}
                      >
                        <span className="studio-nav-icon">
                          <item.icon size={14} />
                        </span>
                        <span className="studio-nav-text">
                          <b>{item.label}</b>
                          <span>{item.caption}</span>
                        </span>
                        {item.external ? (
                          <ExternalLink size={11} className="opacity-40" />
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            ))}

            <button
              type="button"
              className="studio-nav-item"
              onClick={() => setPalette(true)}
            >
              <span className="studio-nav-icon">
                <CommandIcon size={14} />
              </span>
              <span className="studio-nav-text">
                <b>Cari cepat</b>
                <span>Lompat halaman · ⌘K</span>
              </span>
            </button>
          </div>

          <div className="studio-side-foot">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/[0.04]"
                >
                  <span className="studio-avatar">
                    {initialsOf(user.name || user.email)}
                  </span>
                  <span className="studio-user-copy">
                    <b>{user.name || "Owner"}</b>
                    <span>{user.email || "private"}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-zinc-800 bg-zinc-900 text-white"
              >
                <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Sesi owner
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
                  onClick={() => window.open("/", "_blank", "noreferrer")}
                >
                  <Globe2 className="mr-2 h-4 w-4" /> Buka situs publik
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-300 focus:bg-red-950/50 focus:text-red-200"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div className="studio-main">
          <header className="studio-top">
            <button
              type="button"
              className="studio-iconbtn lg:hidden"
              onClick={() => setDrawer(true)}
              aria-label="Buka navigasi"
            >
              <Menu size={15} />
            </button>
            {rail ? (
              <button
                type="button"
                className="studio-iconbtn hidden lg:grid"
                onClick={toggleRail}
                aria-label="Buka navigasi"
                title="Buka navigasi (⌘B)"
              >
                <PanelLeft size={15} />
              </button>
            ) : null}

            <nav className="studio-crumbs" aria-label="Breadcrumb">
              <span>{kicker || "Studio"}</span>
              <ChevronRight size={12} className="studio-crumb-sep" />
              <b>{title || active.label}</b>
            </nav>

            <button
              type="button"
              className="studio-chip hidden sm:inline-flex"
              onClick={() => setPalette(true)}
            >
              <CommandIcon size={12} />
              Cari
              <kbd>⌘K</kbd>
            </button>
            <button
              type="button"
              className="studio-iconbtn sm:hidden"
              onClick={() => setPalette(true)}
              aria-label="Command palette"
            >
              <CommandIcon size={14} />
            </button>
            <a
              className="studio-chip hidden md:inline-flex"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              <Globe2 size={12} />
              Live
              <ArrowUpRight size={11} />
            </a>
          </header>

          <main className="studio-body">
            <div className="studio-canvas">{children}</div>
          </main>
        </div>

        <nav className="studio-dock" aria-label="Studio quick navigation">
          {dockItems.map(item => (
            <button
              key={item.path}
              type="button"
              data-active={active.path === item.path}
              onClick={() => go(item)}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
          <button type="button" onClick={() => setPalette(true)}>
            <CommandIcon size={16} />
            Cari
          </button>
        </nav>
      </div>

      <CommandDialog
        open={palette}
        onOpenChange={setPalette}
        title="Studio command"
        description="Lompat ke bagian workspace."
      >
        <CommandInput placeholder="Ketik halaman atau aksi…" />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          <CommandGroup heading="Halaman">
            {menuItems.map(item => (
              <CommandItem
                key={item.path}
                value={`${item.label} ${item.caption}`}
                onSelect={() => {
                  setPalette(false);
                  go(item);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                <CommandShortcut>{item.path}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Aksi">
            <CommandItem
              value="rilisan baru"
              onSelect={() => {
                setPalette(false);
                setLocation("/studio?compose=release");
              }}
            >
              <Rocket className="mr-2 h-4 w-4" /> Tulis rilisan baru
            </CommandItem>
            <CommandItem
              value="upload asset"
              onSelect={() => {
                setPalette(false);
                setLocation("/assets");
              }}
            >
              <FolderOpen className="mr-2 h-4 w-4" /> Upload media
            </CommandItem>
            <CommandItem
              value="toggle sidebar"
              onSelect={() => {
                setPalette(false);
                toggleRail();
              }}
            >
              <PanelLeft className="mr-2 h-4 w-4" /> Ciutkan sidebar
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="logout"
              onSelect={() => {
                setPalette(false);
                void logout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Keluar
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
