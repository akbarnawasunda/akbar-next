import { MobileNav, defaultIdNavItems, defaultEnNavItems } from "./MobileNav";
import type { MobileNavItem } from "./MobileNav";

export type NavItemConfig = MobileNavItem;
export { defaultIdNavItems, defaultEnNavItems };
export { MobileNav };

export interface MobileSlideMenuProps {
  open: boolean;
  pathname: string;
  active?: string;
  onClose: () => void;
  lang?: "id" | "en";
  navItems?: NavItemConfig[];
}

/**
 * MobileSlideMenu forwards to MobileNav, whose drawer transition is CSS-based.
 */
export function MobileSlideMenu({
  open,
  pathname,
  active,
  onClose,
  lang = "id",
  navItems,
}: MobileSlideMenuProps) {
  return (
    <MobileNav
      isOpen={open}
      pathname={pathname}
      active={active}
      onClose={onClose}
      lang={lang}
      navItems={navItems}
    />
  );
}
