import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "~/utils/utils";
import { motion } from "motion/react";
import { Button } from "~/components/ui/shared/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";

interface NavItem {
  name: string;
  url: string;
}

const useVisibleSection = (items: NavItem[]) => {
  const [visibleSection, setVisibleSection] = useState("");
  const location = useRouter().state.location;

  const isElementVisible = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const visibleRatio =
      Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
    return visibleRatio > windowHeight * 0.3;
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      const sections = items
        .map((item) => item.url.split("#")[1])
        .filter(Boolean)
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section !== null);

      const visibleSection = sections.find((section) =>
        isElementVisible(section)
      );
      setVisibleSection(visibleSection ? `#${visibleSection.id}` : "");
    };

    let timeoutId: number | undefined;
    const throttledScroll = () => {
      if (timeoutId) return;
      timeoutId = window.setTimeout(() => {
        handleScroll();
        timeoutId = undefined;
      }, 100);
    };

    window.addEventListener("scroll", throttledScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [items, location.pathname, isElementVisible]);

  return visibleSection;
};

interface NavBarProps {
  items?: NavItem[];
  className?: string;
}

const defaultWorkItems: NavItem[] = [
  { name: "Web", url: "/#web" },
  { name: "Branding", url: "/#branding" },
  { name: "Photos", url: "/#photos" },
  { name: "Posters", url: "/#posters" },
];

const desktopMenuItems: NavItem[] = [
  { name: "Studio", url: "/" },
  { name: "Blog", url: "/blog" },
  { name: "Store", url: "/store" },
];

const mobileMenuItems: NavItem[] = [
  { name: "Studio", url: "/" },
  { name: "Blog", url: "/blog" },
  { name: "Store", url: "/store" },
  {
    name: "Resume",
    url: "https://assets.rublevsky.studio/PDF/Resume%20Alexander%20Rublevsky.pdf",
  },
];

const DropdownNavMenu = ({ items }: { items: NavItem[] }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex w-fit rounded-full border border-black bg-background hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem] focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        <span className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-4 md:py-2 md:text-sm">
          Menu
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="mb-2 rounded-2xl border border-black bg-background text-foreground"
      >
        {items.map((item) => (
          <DropdownMenuItem key={item.url} asChild>
            {item.url.startsWith("http") ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex w-full cursor-default select-none items-center py-2 px-3 text-sm outline-none focus:bg-black focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-black hover:text-white transition-colors duration-200"
              >
                {item.name}
              </a>
            ) : (
              <Link
                to={item.url}
                className="relative flex w-full cursor-default select-none items-center py-2 px-3 text-sm outline-none focus:bg-black focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-black hover:text-white transition-colors duration-200"
              >
                {item.name}
              </Link>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface TabProps {
  children: React.ReactNode;
  setPosition: (position: {
    left: number;
    width: number;
    opacity: number;
  }) => void;
  href: string;
  isActive: boolean;
}

const Tab = ({ children, setPosition, href, isActive }: TabProps) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <Link to={href}>
      <li
        ref={ref}
        onMouseEnter={() => {
          if (!ref.current) return;
          const { width } = ref.current.getBoundingClientRect();
          setPosition({
            width,
            opacity: 1,
            left: ref.current.offsetLeft,
          });
        }}
        className={cn(
          "relative z-10 block cursor-pointer px-2.5 md:px-4 py-1.5 text-xs  text-white mix-blend-difference md:py-2 md:text-sm",
          isActive && "underline underline-offset-4"
        )}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 z-0 rounded-full bg-black/10"
          />
        )}
      </li>
    </Link>
  );
};

const Cursor = ({
  position,
}: {
  position: { left: number; width: number; opacity: number };
}) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-7 rounded-full bg-black md:h-9"
    />
  );
};

interface NavGroupProps {
  items: NavItem[];
  className?: string;
}

const NavGroup = ({ items, className }: NavGroupProps) => {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const activeSection = useVisibleSection(items);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className={cn(
        "relative flex w-fit rounded-full border border-black bg-background p-[0.3rem]",
        className
      )}
      onMouseLeave={() => setPosition((prev) => ({ ...prev, opacity: 0 }))}
    >
      {items.map((item) => (
        <Tab
          key={item.url}
          setPosition={setPosition}
          href={item.url}
          isActive={
            item.url.includes("#")
              ? pathname === "/" && activeSection === item.url.split("/").pop()
              : pathname === item.url
          }
        >
          {item.name}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
};

const GoBackButton = () => {
  return (
    <div className="absolute bottom-full mb-2 w-full rounded-full border border-black bg-background hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem]">
      <Button asChild variant="outline" className="font-normal">
        <Link
          to="/"
          hash="#branding"
          className="relative z-10 block w-full text-center cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-4 md:py-2 md:text-sm"
        >
          Go Back
        </Link>
      </Button>
    </div>
  );
};

export function NavBar({ className }: Omit<NavBarProps, "items">) {
  const router = useRouter();
  const routerState = useRouterState();
  const pathname = router.state.location.pathname;

  const showGoBackButton =
    routerState.location.pathname.startsWith("/branding/");

  const showOther = !routerState.location.pathname.startsWith("/dashboard");

  // Check if we should show the work sections (on homepage or branding detail pages)
  const showWorkSections =
    pathname === "/" || routerState.location.pathname.startsWith("/branding/");

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[40] mb-3 flex justify-between items-center px-3 pointer-events-none",
        className
      )}
    >
      {showWorkSections ? (
        <>
          <div className="hidden md:block pointer-events-auto">
            <DropdownNavMenu items={desktopMenuItems} />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block pointer-events-auto">
            <div className="relative">
              {showGoBackButton && <GoBackButton />}
              <NavGroup items={defaultWorkItems} />
            </div>
          </div>
          <div className="md:hidden pointer-events-auto">
            <DropdownNavMenu items={mobileMenuItems} />
          </div>
          <div className="hidden md:block pointer-events-auto">
            <div className="relative flex w-fit rounded-full border border-black bg-background hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem]">
              <button
                onClick={() => {
                  window.open(
                    "https://assets.rublevsky.studio/PDF/Resume%20Alexander%20Rublevsky.pdf?",
                    "_blank"
                  );
                }}
                className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-4 md:py-2 md:text-sm"
              >
                Resume
              </button>
            </div>
          </div>
          <div className="md:hidden pointer-events-auto">
            <div className="relative">
              {showGoBackButton && <GoBackButton />}
              <NavGroup items={defaultWorkItems} />
            </div>
          </div>
        </>
      ) : showOther ? (
        <>
          <div className="hidden md:block pointer-events-auto">
            <DropdownNavMenu items={desktopMenuItems} />
          </div>
          <div className="md:hidden pointer-events-auto">
            <DropdownNavMenu items={mobileMenuItems} />
          </div>
        </>
      ) : null}
    </nav>
  );
}
