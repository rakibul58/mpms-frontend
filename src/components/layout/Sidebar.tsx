"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  InspectionPanel,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";
import { ROUTES } from "@/lib/constants";
import { USER_ROLES } from "@/lib/constants";

const mainNavItems = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.MEMBER],
  },
  {
    title: "Projects",
    href: ROUTES.PROJECTS,
    icon: FolderKanban,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.MEMBER],
  },
  {
    title: "Sprints",
    href: ROUTES.SPRINTS,
    icon: InspectionPanel,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.MEMBER],
  },
  {
    title: "My Tasks",
    href: ROUTES.MY_TASKS,
    icon: CheckSquare,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.MEMBER],
  },
  {
    title: "Team",
    href: ROUTES.TEAM,
    icon: Users,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
  {
    title: "Reports",
    href: ROUTES.REPORTS,
    icon: BarChart3,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const filteredNavItems = mainNavItems.filter(
    (item) => user && (item.roles as string[]).includes(user.role)
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
        sidebarOpen ? "w-64" : "w-[70px]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {sidebarOpen && (
            <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  M
                </span>
              </div>
              <span className="font-bold text-xl">MPMS</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className={cn(!sidebarOpen && "mx-auto")}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform",
                !sidebarOpen && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-2 border-t">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.title}</span>}
              </Link>
            );
          })}

          <Separator className="my-2" />

          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              !sidebarOpen && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
