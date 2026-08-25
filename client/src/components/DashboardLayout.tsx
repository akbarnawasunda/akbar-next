import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import OwnerLoginCard from "./OwnerLoginCard";
import { useIsMobile } from "@/hooks/useMobile";
import { FilePenLine, FolderOpen, Globe2, Inbox, LayoutDashboard, LogOut, PanelLeft, Radio, Sparkles } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: LayoutDashboard, label: "Control Room", caption: "Overview", path: "/admin", group: "Operate" },
  { icon: FilePenLine, label: "Content Studio", caption: "Edit public content", path: "/studio", group: "Operate" },
  { icon: FolderOpen, label: "Asset Library", caption: "Media storage", path: "/assets", group: "Operate" },
  { icon: Inbox, label: "Inquiry Inbox", caption: "Booking & collab leads", path: "/studio/inquiries", group: "Signals" },
  { icon: Globe2, label: "Public Site", caption: "Open live website", path: "/", group: "Signals" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 220;
const MAX_WIDTH = 480;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_WIDTH;
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    return Number.isFinite(parsed) ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parsed)) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <OwnerLoginCard />;

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const nextWidth = event.clientX - sidebarLeft;
      if (nextWidth >= MIN_WIDTH && nextWidth <= MAX_WIDTH) setSidebarWidth(nextWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-white/[0.08] bg-[#0b0c10] text-white" disableTransition={isResizing}>
          <SidebarHeader className="h-auto border-b border-white/[0.08] px-3 py-4 group-data-[collapsible=icon]:px-2">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Toggle navigation">
                <PanelLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Akbar Nawasunda</p>
                <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.16em] text-white/45">Control Room</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" /></span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55 group-data-[collapsible=icon]:hidden">Live site</span>
              </div>
              <Radio className="h-3.5 w-3.5 text-emerald-300/80 group-data-[collapsible=icon]:hidden" />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-5">
            {(["Operate", "Signals"] as const).map(group => (
              <div key={group} className="mb-6 last:mb-0">
                <div className="mb-2 flex items-center gap-2 px-3 group-data-[collapsible=icon]:hidden">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-white/30">{group}</span>
                  <span className="h-px flex-1 bg-white/[0.08]" />
                </div>
                <SidebarMenu>
                  {menuItems.filter(item => item.group === group).map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.path)} tooltip={item.label} className="group/nav relative mb-1 h-auto min-h-12 rounded-xl px-3 py-2.5 text-white/55 transition-all hover:bg-white/[0.06] hover:text-white data-[active=true]:bg-cyan-300/[0.12] data-[active=true]:text-white data-[active=true]:shadow-[inset_3px_0_0_#67e8f9] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
                          <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-cyan-200" : "text-white/35 group-hover/nav:text-white/75"}`} />
                          <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><span className="block truncate text-[13px] font-medium">{item.label}</span><span className="mt-0.5 block truncate text-[10px] text-white/30 group-data-[active=true]:text-cyan-100/55">{item.caption}</span></span>
                          {isActive ? <Sparkles className="h-3 w-3 text-cyan-200/80 group-data-[collapsible=icon]:hidden" /> : null}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-white/[0.08] p-3 group-data-[collapsible=icon]:px-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left transition hover:border-white/10 hover:bg-white/[0.05] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                  <Avatar className="h-9 w-9 shrink-0 border border-cyan-200/30 bg-cyan-300/10"><AvatarFallback className="bg-transparent text-xs font-semibold text-cyan-100">{user?.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-semibold text-white/85">{user?.name || "Owner"}</p><p className="mt-1 truncate font-mono text-[10px] text-white/35">{user?.email || "private session"}</p></div>
                  <span className="text-white/25 group-data-[collapsible=icon]:hidden">•••</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 border-white/10 bg-[#12141a] text-white">
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-200 focus:bg-red-400/10 focus:text-red-100"><LogOut className="mr-2 h-4 w-4" /><span>Sign out</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-cyan-300/30 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }} style={{ zIndex: 50 }} />
      </div>

      <SidebarInset className="bg-[#08090c]">
        {isMobile ? <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#0b0c10]/95 px-3 backdrop-blur-xl"><div className="flex items-center gap-3"><SidebarTrigger className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.04] text-white/70" /><div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-200/70">AN // CONTROL ROOM</p><p className="mt-0.5 text-sm font-medium text-white/80">{activeMenuItem?.label ?? "Menu"}</p></div></div><span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-200/70"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Live</span></div> : null}
        <main className="min-h-svh flex-1 bg-[radial-gradient(circle_at_84%_4%,rgba(34,211,238,0.07),transparent_30%),radial-gradient(circle_at_8%_94%,rgba(168,85,247,0.05),transparent_30%)] p-4 text-white sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
