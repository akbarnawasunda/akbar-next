/**
 * STUDIO SHELL — chrome untuk seluruh workspace owner.
 *
 * Satu kerangka dipakai oleh /admin, /studio, /studio/inquiries,
 * /studio/broadcasts, dan /assets: sidebar rail yang bisa diciutkan,
 * topbar lengket dengan breadcrumb + jam WIB, command palette (⌘K),
 * dan dock navigasi khusus layar kecil. Nama berkas dipertahankan
 * (`DashboardLayout`) supaya seluruh halaman studio tidak perlu diubah.
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
  Satellite,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "@/lib/navigation";
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
  group: string;
  external?: boolean;
};

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Control Room",
    caption: "Ringkasan & jalur kerja",
    path: "/admin",
    group: "Operate",
  },
  {
    icon: FilePenLine,
    label: "Content Studio",
    caption: "Editor isi website",
    path: "/studio",
    group: "Operate",
  },
  {
    icon: FolderOpen,
    label: "Asset Library",
    caption: "Gambar, audio, video, PDF",
    path: "/assets",
    group: "Operate",
  },
  {
    icon: Inbox,
    label: "Inquiry Inbox",
    caption: "Booking & kolaborasi",
    path: "/studio/inquiries",
    group: "Signals",
  },
  {
    icon: Satellite,
    label: "Broadcast",
    caption: "Fan Signal (paused)",
    path: "/studio/broadcasts",
    group: "Signals",
  },
  {
    icon: Globe2,
    label: "Public Site",
    caption: "Buka website publik",
    path: "/",
    group: "Signals",
    external: true,
  },
];

const dockItems = menuItems.filter(item =>
  ["/admin", "/studio", "/assets", "/studio/inquiries"].includes(item.path)
);

const RAIL_KEY = "studio-rail-collapsed";

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

  const clock = now ? jakartaTimeLabel(now) : "—.—.—";

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
              <span className="studio-mark-glyph">AN</span>
            </span>
            <div className="studio-side-id">
              <b>Akbar Nawasunda</b>
              <span>Studio OS</span>
            </div>
            <button
              type="button"
              className="studio-rail-toggle hidden lg:grid"
              onClick={toggleRail}
              aria-label="Ciutkan navigasi"
              title="Ciutkan navigasi (⌘B)"
            >
              <PanelLeftClose size={15} />
            </button>
            <button
              type="button"
              className="studio-rail-toggle lg:hidden"
              onClick={() => setDrawer(false)}
              aria-label="Tutup navigasi"
            >
              <X size={15} />
            </button>
          </div>

          <div className="studio-pulse">
            <span className="studio-dot" aria-hidden />
            <div className="studio-pulse-copy">
              <b>Live site</b>
              <span>WIB {clock}</span>
            </div>
          </div>

          <div className="studio-side-scroll">
            {["Operate", "Signals"].map(group => (
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
                          <item.icon size={15} />
                        </span>
                        <span className="studio-nav-text">
                          <b>{item.label}</b>
                          <span>{item.caption}</span>
                        </span>
                        {item.external ? (
                          <ExternalLink size={12} className="opacity-40" />
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
              title="Command palette"
            >
              <span className="studio-nav-icon">
                <CommandIcon size={15} />
              </span>
              <span className="studio-nav-text">
                <b>Command palette</b>
                <span>Lompat cepat · ⌘K</span>
              </span>
            </button>
          </div>

          <div className="studio-side-foot">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/[0.05]"
                >
                  <span className="studio-avatar">
                    {initialsOf(user.name || user.email)}
                  </span>
                  <span className="studio-user-copy">
                    <b>{user.name || "Owner"}</b>
                    <span>{user.email || "private session"}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-white/10 bg-[#0d1016] text-white"
              >
                <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  Owner session
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer text-white/75 focus:bg-white/10 focus:text-white"
                  onClick={() => window.open("/", "_blank", "noreferrer")}
                >
                  <Globe2 className="mr-2 h-4 w-4" /> Buka situs publik
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-200 focus:bg-red-400/10 focus:text-red-100"
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
              <Menu size={16} />
            </button>
            {rail ? (
              <button
                type="button"
                className="studio-iconbtn hidden lg:grid"
                onClick={toggleRail}
                aria-label="Buka navigasi"
                title="Buka navigasi (⌘B)"
              >
                <PanelLeft size={16} />
              </button>
            ) : null}

            <nav className="studio-crumbs" aria-label="Breadcrumb">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                {kicker || "AN // Studio"}
              </span>
              <ChevronRight size={13} className="studio-crumb-sep" />
              <b>{title || active.label}</b>
            </nav>

            <button
              type="button"
              className="studio-chip hidden sm:inline-flex"
              onClick={() => setPalette(true)}
            >
              <CommandIcon size={13} />
              Cari & lompat
              <kbd>⌘K</kbd>
            </button>
            <button
              type="button"
              className="studio-iconbtn sm:hidden"
              onClick={() => setPalette(true)}
              aria-label="Command palette"
            >
              <CommandIcon size={16} />
            </button>
            <a
              className="studio-chip hidden md:inline-flex"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              <Radio size={13} className="text-emerald-300" />
              Live
              <ArrowUpRight size={12} />
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
              <item.icon size={17} />
              {item.label.split(" ")[0]}
            </button>
          ))}
          <button type="button" onClick={() => setPalette(true)}>
            <CommandIcon size={17} />
            Jump
          </button>
        </nav>
      </div>

      <CommandDialog
        open={palette}
        onOpenChange={setPalette}
        title="Studio command"
        description="Lompat ke bagian workspace atau jalankan aksi cepat."
      >
        <CommandInput placeholder="Ketik halaman atau aksi…" />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          <CommandGroup heading="Navigasi">
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
          <CommandGroup heading="Aksi cepat">
            <CommandItem
              value="rilisan baru release"
              onSelect={() => {
                setPalette(false);
                setLocation("/studio?compose=release");
              }}
            >
              <Rocket className="mr-2 h-4 w-4" /> Tulis rilisan baru
            </CommandItem>
            <CommandItem
              value="upload asset media"
              onSelect={() => {
                setPalette(false);
                setLocation("/assets");
              }}
            >
              <FolderOpen className="mr-2 h-4 w-4" /> Upload media baru
            </CommandItem>
            <CommandItem
              value="toggle sidebar rail"
              onSelect={() => {
                setPalette(false);
                toggleRail();
              }}
            >
              <PanelLeft className="mr-2 h-4 w-4" /> Ciutkan / buka sidebar
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="logout keluar"
              onSelect={() => {
                setPalette(false);
                void logout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Keluar dari studio
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
