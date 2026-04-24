import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const labels: Record<string, string> = {
  admin: "Admin",
  products: "Products",
  orders: "Orders",
  users: "Users",
  categories: "Categories",
  reviews: "Reviews",
  analytics: "Analytics",
  coupons: "Coupons",
  settings: "Settings",
  new: "New",
  edit: "Edit",
  login: "Login",
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((p, i) => ({
    name: labels[p] ?? p,
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));
  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      <Link to="/admin" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-3 w-3" />
      </Link>
      {crumbs.slice(1).map((c, i) => (
        <span key={c.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {i === crumbs.length - 2 ? (
            <span className="text-foreground font-medium">{c.name}</span>
          ) : (
            <Link to={c.href} className="hover:text-foreground">
              {c.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
