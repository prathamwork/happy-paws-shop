import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Star,
  BarChart3,
  Ticket,
  Settings,
  PawPrint,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Categories", url: "/admin/categories", icon: Tags },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
];

const insights = [
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Coupons", url: "/admin/coupons", icon: Ticket },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-warm">
            <PawPrint className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold">Pawsome</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted/60"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {insights.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted/60"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
