import { Bell, Moon, Search, Sun, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/store/theme";
import { useAuth } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function AdminTopbar() {
  const { dark, toggle } = useTheme();
  const { logout, user } = useAuth(); // ✅ correct store
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur md:px-6">
      <SidebarTrigger />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products, orders, users…" className="pl-9 h-9 rounded-full" />
      </div>
      <div className="flex-1 md:hidden" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold">Notifications</p>
            <Badge variant="secondary">3 new</Badge>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="rounded-md border p-2">
              <p className="font-medium">New order #PWS-1027</p>
              <p className="text-muted-foreground">Olivia placed an order — $84.50</p>
            </li>
            <li className="rounded-md border p-2">
              <p className="font-medium">Low stock</p>
              <p className="text-muted-foreground">Aquarium Starter Tank · 8 left</p>
            </li>
            <li className="rounded-md border p-2">
              <p className="font-medium">New review pending</p>
              <p className="text-muted-foreground">5★ on Cozy Cloud Pet Bed</p>
            </li>
          </ul>
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <div className="h-7 w-7 rounded-full bg-gradient-primary grid place-items-center text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <span className="hidden sm:inline text-sm font-medium">
              {user?.name?.split(" ")[0] ?? "Admin"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
            <User className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}