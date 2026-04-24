import { Outlet, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useAdmin } from "@/store/admin";

const AdminLayout = () => {
  const authed = useAdmin((s) => s.authed);
  const location = useLocation();

  if (!authed && !location.pathname.startsWith("/admin/login")) {
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
