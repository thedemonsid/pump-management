import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuBadge,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Fuel,
  Database,
  Gauge,
  Users,
  UserCog,
  Clock,
  CalendarX,
  Zap,
  Sparkles,
  Truck,
  UserCircle,
  CreditCard,
  Receipt,
  BarChart3,
  FolderTree,
  Wallet,
  KeyRound,
  Activity,
  BadgeDollarSign,
} from "lucide-react";

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Products",
    url: "/products",
    icon: Fuel,
  },
  {
    title: "Tanks",
    url: "/tanks",
    icon: Database,
  },
  {
    title: "Dip Readings",
    url: "/dip-readings",
    icon: Activity,
  },
  {
    title: "Nozzles",
    url: "/nozzles",
    icon: Gauge,
  },
];

const partnersItems = [
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: Truck,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UserCircle,
  },
  {
    title: "Purchases",
    url: "/purchases",
    icon: Sparkles,
  },
  {
    title: "Fuel Purchases",
    url: "/fuel-purchases",
    icon: Fuel,
  },
  {
    title: "Expense Heads",
    url: "/expense-heads",
    icon: FolderTree,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: Wallet,
  },
  {
    title: "Bank Accounts",
    url: "/bank-accounts",
    icon: CreditCard,
  },
  {
    title: "Bills",
    url: "/bills",
    icon: Receipt,
  },
];

const managementItems = [
  {
    title: "Salesmen",
    url: "/salesmen",
    icon: Users,
  },
  {
    title: "Managers",
    url: "/managers",
    icon: UserCog,
    requiredRoles: ["ADMIN"],
  },
  {
    title: "Absences",
    url: "/user-absences",
    icon: CalendarX,
  },
  {
    title: "Salary Config",
    url: "/employee-salary-config",
    icon: BadgeDollarSign,
  },
  {
    title: "Shifts",
    url: "/shifts",
    icon: Clock,
  },
];

const salesmanItems = [
  {
    title: "My Active Shift",
    url: "/my-shift",
    icon: Zap,
  },
  {
    title: "Shifts",
    url: "/shifts",
    icon: Clock,
  },
];

const settingsItems = [
  {
    title: "Change Password",
    url: "/settings/change-password",
    icon: KeyRound,
  },
];
// const systemItems = [
//   {
//     title: 'Settings',
//     url: '/settings',
//     icon: Settings,
//   },
// ];

interface SidebarMenuItemProps {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  requiredRoles?: string[];
}

function NavItem({ title, url, icon: Icon }: SidebarMenuItemProps) {
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();
  const isActive =
    location.pathname === url ||
    (location.pathname.startsWith(url) &&
      (location.pathname[url.length] === "/" ||
        location.pathname.length === url.length)) ||
    (title === "Dashboard" && location.pathname === "/dashboard");

  const handleClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={url}
          onClick={handleClick}
          data-active={isActive ? "true" : undefined}
          className={[
            "relative flex items-center gap-2 rounded-md transition-colors duration-150",
            "text-sm px-2.5 py-2 font-medium outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring/50",
            "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
            isActive
              ? "bg-sidebar-accent/70 text-sidebar-accent-foreground shadow-xs after:absolute after:left-0 after:top-1 after:bottom-1 after:w-[3px] after:rounded-r-sm after:bg-primary/90"
              : "text-sidebar-foreground/85",
          ].join(" ")}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{title}</span>
          {title === "Nozzle Readings" && (
            <SidebarMenuBadge className="ml-auto bg-primary/10 text-primary-foreground/80 dark:bg-primary/20">
              •
            </SidebarMenuBadge>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

const renderMenuItems = (
  items: SidebarMenuItemProps[],
  role: string
): React.ReactNode =>
  items
    .filter((i) => !i.requiredRoles || i.requiredRoles.includes(role))
    .map((i) => <NavItem key={i.title} {...i} />);

interface AppSidebarProps {
  role: string;
  pumpName?: string;
}

export function AppSidebar({ role, pumpName }: AppSidebarProps) {
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  return (
    <Sidebar
      collapsible="icon"
      className="bg-gradient-soft dark:bg-gradient-soft relative z-20 flex flex-col border-r border-sidebar-border shadow-md"
    >
      <SidebarHeader className="px-4 pt-4 pb-3 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:pt-3">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 group group-data-[state=collapsed]:justify-center"
        >
          <div className="relative">
            <Zap className="h-7 w-7 text-primary drop-shadow-sm" />
            <Sparkles className="h-3 w-3 text-warning absolute -right-1 -top-1 animate-pulse" />
          </div>
          <div className="flex flex-col leading-tight group-data-[state=collapsed]:hidden">
            <span className="font-semibold text-sm tracking-tight group-hover:text-primary transition-colors">
              {pumpName || "Main Pump Station"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Pump Station
            </span>
          </div>
        </NavLink>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto group-data-[state=collapsed]:px-1">
        {isAdminOrManager && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-wide text-[10px] font-semibold text-sidebar-foreground/60">
              Pump Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(mainItems, role)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {isAdminOrManager && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="uppercase tracking-wide text-[10px] font-semibold text-sidebar-foreground/60">
                Partners
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {renderMenuItems(partnersItems, role)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="uppercase tracking-wide text-[10px] font-semibold text-sidebar-foreground/60">
                Staff & Shifts
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {renderMenuItems(managementItems, role)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        {role === "SALESMAN" && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-wide text-[10px] font-semibold text-sidebar-foreground/60">
              My Work
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(salesmanItems, role)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {role === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-wide text-[10px] font-semibold text-sidebar-foreground/60">
              Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(settingsItems, role)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarSeparator className="opacity-60 group-data-[state=collapsed]:hidden" />
      <SidebarFooter className="px-4 py-1 group-data-[state=collapsed]:px-1 group-data-[state=collapsed]:py-2">
        <div className="flex flex-col gap-3 group-data-[state=collapsed]:items-center w-full">
          {/* Full toggle row */}
          <div className="flex items-center justify-between w-full group-data-[state=collapsed]:hidden">
            <span className="text-xs font-medium text-muted-foreground">
              Theme
            </span>
            <ThemeToggle />
          </div>
          {/* Compact toggle when collapsed */}
          <div className="hidden group-data-[state=collapsed]:flex w-full items-center justify-center">
            <ThemeToggle compact />
          </div>
          <div className="rounded-md border bg-background/50 backdrop-blur-sm p-3 flex flex-col gap-1 shadow-xs w-full group-data-[state=collapsed]:hidden">
            <div className="text-sm font-semibold tracking-tight">
              Easy Pump
            </div>
            <div className="text-[11px] text-muted-foreground">
              Real Link Web Tech
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground/70 tracking-wide group-data-[state=collapsed]:hidden">
            &copy; {new Date().getFullYear()} Fuel Pump System
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
