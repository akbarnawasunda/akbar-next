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
 * MobileSlideMenu forwards to the Framer Motion powered MobileNav component
 * for smooth drawer animations and full accessibility.
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
