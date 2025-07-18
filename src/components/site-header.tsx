import { Separator } from "~/components/ui/dashboard/separator";
import { SidebarTrigger } from "~/components/ui/dashboard/sidebar";
import { data } from "~/components/ui/dashboard/DashboardSidebar";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function SiteHeader() {
  const router = useRouter();
  const routerState = useRouterState();
  const path = router.state.location.pathname;
  const currentPage =
    path === "/dashboard"
      ? "Dashboard"
      : path
          .replace("/dashboard/", "")
          .charAt(0)
          .toUpperCase() + path.replace("/dashboard/", "").slice(1);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="!text-base !font-medium">{currentPage}</h1>
      </div>
    </header>
  );
}
