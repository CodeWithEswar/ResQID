"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SidebarLeft01Icon, Menu01Icon } from "hugeicons-react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
type SidebarState = {
  collapsed: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggle: () => void;
  activeTooltip: string | null;
  setActiveTooltip: React.Dispatch<React.SetStateAction<string | null>>;
};
const Context = createContext<SidebarState | null>(null);
export function useSidebar() {
  const state = useContext(Context);
  if (!state) throw new Error("Sidebar components require SidebarProvider");
  return state;
}
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, updateMobileOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  function setMobileOpen(open: boolean) {
    setActiveTooltip(null);
    updateMobileOpen(open);
  }
  function toggle() {
    setActiveTooltip(null);
    if (window.matchMedia("(max-width: 767px)").matches)
      updateMobileOpen((value) => !value);
    else setCollapsed((value) => !value);
  }
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "b" &&
        (event.ctrlKey || event.metaKey) &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest("input,textarea,[contenteditable=true]")
        )
      ) {
        event.preventDefault();
        toggle();
      }
    };
    const media = window.matchMedia("(min-width: 768px)");
    const resize = () => {
      setActiveTooltip(null);
      if (media.matches) {
        updateMobileOpen(false);
      }
    };
    window.addEventListener("keydown", keydown);
    media.addEventListener("change", resize);
    return () => {
      window.removeEventListener("keydown", keydown);
      media.removeEventListener("change", resize);
    };
  }, []);
  return (
    <Context.Provider
      value={{
        collapsed,
        mobileOpen,
        setMobileOpen,
        toggle,
        activeTooltip,
        setActiveTooltip,
      }}
    >
      <TooltipProvider delayDuration={300} skipDelayDuration={0}>
        <div className="workspace-frame" data-collapsed={collapsed}>
          {children}
        </div>
      </TooltipProvider>
    </Context.Provider>
  );
}
export function SidebarTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const { collapsed, mobileOpen, activeTooltip, setActiveTooltip } =
    useSidebar();
  const enabled = collapsed && !mobileOpen;
  return (
    <Tooltip
      open={enabled && activeTooltip === label}
      onOpenChange={(open) => {
        if (open) {
          if (enabled) setActiveTooltip(label);
        } else {
          setActiveTooltip((current) => (current === label ? null : current));
        }
      }}
      disableHoverableContent
    >
      <TooltipTrigger
        asChild
        onPointerMove={(event) => {
          if (!enabled) event.preventDefault();
        }}
        onFocus={(event) => {
          if (!enabled) event.preventDefault();
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
export function Sidebar({ children }: { children: ReactNode }) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <>
      <aside
        id="desktop-workspace-navigation"
        className="workspace-sidebar hidden md:flex"
      >
        {children}
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          id="mobile-workspace-navigation"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("mobile-workspace-trigger")?.focus();
          }}
        >
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate your cases, search, reviews, and account.
          </SheetDescription>
          {children}
        </SheetContent>
      </Sheet>
    </>
  );
}
export function SidebarTrigger() {
  const { collapsed, mobileOpen, toggle } = useSidebar();
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        aria-controls="desktop-workspace-navigation"
        onClick={toggle}
      >
        <SidebarLeft01Icon size={19} aria-hidden="true" />
      </Button>
      <Button
        id="mobile-workspace-trigger"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        aria-controls="mobile-workspace-navigation"
        onClick={toggle}
      >
        <Menu01Icon size={20} aria-hidden="true" />
      </Button>
    </>
  );
}
