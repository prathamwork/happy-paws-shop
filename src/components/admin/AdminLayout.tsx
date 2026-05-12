import { Outlet, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useAuth } from "@/store/auth";

const ALLOWED_ROLES = ["admin", "manager"] as const;

const AdminLayout = () => {
  const { user, hydrated } = useAuth();
  const location = useLocation();

  // Wait for zustand to rehydrate from localStorage before deciding
  if (!hydrated) return null;

  // Not logged in or not an admin/manager — redirect to login
  if (!user || !ALLOWED_ROLES.includes(user.role as typeof ALLOWED_ROLES[number])) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar />
          <div className="px-4 md:px-6 pt-3">
            <Breadcrumbs />
          </div>
          <main className="flex-1 p-4 md:p-6 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;