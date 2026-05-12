import { useEffect, useMemo, useState } from "react";
import { Search, Shield, ShieldOff, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/format";
import { api } from "@/services/api";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  joined: string | null;
  orders: number;
  spent: number;
  status: "Active" | "Blocked";
}

const ROLES = ["customer", "admin", "manager"] as const;
type Role = (typeof ROLES)[number];

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [q, setQ]                   = useState("");
  const [view, setView]             = useState<AdminUser | null>(null);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting]     = useState(false);

  // ── Fetch users ──────────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/admin/users/")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  // ── Block / Unblock ──────────────────────────────────────────────────────────
  const handleToggleBlock = async (user: AdminUser) => {
    const newStatus = user.status === "Active" ? "Blocked" : "Active";

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    if (view?.id === user.id) setView({ ...user, status: newStatus });

    try {
      await api.patch(`/users/assign-role/${user.id}/`, {
        is_active: newStatus === "Active",
      });
      toast.success(newStatus === "Blocked" ? "User blocked" : "User unblocked");
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
      if (view?.id === user.id) setView(user);
      toast.error("Failed to update user status");
    }
  };

  // ── Role update ──────────────────────────────────────────────────────────────
  const handleRoleChange = async (user: AdminUser, newRole: Role) => {
    if (newRole === user.role) return;

    setUpdatingRole(user.id);

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );
    if (view?.id === user.id) setView({ ...user, role: newRole });

    try {
      await api.patch(`/users/assign-role/${user.id}/`, { role: newRole });
      toast.success(`Role updated to "${newRole}"`);
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: user.role } : u))
      );
      if (view?.id === user.id) setView(user);
      toast.error("Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    // Optimistic removal
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    if (view?.id === deleteTarget.id) setView(null);
    setDeleteTarget(null);

    try {
      await api.delete(`/users/deleteuser/${deleteTarget.id}/`);
      toast.success(`${deleteTarget.name} has been deleted`);
    } catch {
      // Rollback
      setUsers((prev) => [...prev, deleteTarget]);
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      users.filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())
      ),
    [users, q],
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${filtered.length} users`}
        </p>
      </div>

      {/* Search */}
      <Card className="p-4 shadow-card">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search users…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-10 animate-pulse"
                  >
                    Loading users…
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    {/* Name */}
                    <TableCell>
                      <button
                        onClick={() => setView(u)}
                        className="flex items-center gap-3 text-left"
                      >
                        <div className="h-9 w-9 rounded-full bg-gradient-warm grid place-items-center font-semibold text-sm shrink-0">
                          {initials(u.name)}
                        </div>
                        <span className="font-medium hover:underline">{u.name}</span>
                      </button>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>

                    {/* Role */}
                    <TableCell>
                      <RoleDropdown
                        user={u}
                        loading={updatingRole === u.id}
                        onSelect={(role) => handleRoleChange(u, role)}
                      />
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="text-muted-foreground">
                      {u.joined ? new Date(u.joined).toLocaleDateString() : "—"}
                    </TableCell>

                    {/* Orders */}
                    <TableCell>{u.orders}</TableCell>

                    {/* Spent */}
                    <TableCell className="font-semibold">{formatPrice(u.spent)}</TableCell>

                    {/* Status */}
                    <TableCell>
                      {u.status === "Blocked" ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge className="bg-success/15 text-[hsl(var(--success))] hover:bg-success/15">
                          Active
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(u)}
                        >
                          {u.status === "Blocked" ? (
                            <><Shield className="h-4 w-4 mr-1" /> Unblock</>
                          ) : (
                            <><ShieldOff className="h-4 w-4 mr-1" /> Block</>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(u)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-10"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── User detail dialog ── */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
          </DialogHeader>

          {view && (
            <div className="space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-warm grid place-items-center font-semibold shrink-0">
                  {initials(view.name)}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">{view.name}</p>
                  <p className="text-sm text-muted-foreground">{view.email}</p>
                </div>
              </div>

              {/* Detail grid */}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground mb-1">Role</dt>
                  <dd>
                    <RoleDropdown
                      user={view}
                      loading={updatingRole === view.id}
                      onSelect={(role) => handleRoleChange(view, role)}
                    />
                  </dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="font-medium">
                    {view.joined ? new Date(view.joined).toLocaleDateString() : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Orders</dt>
                  <dd className="font-medium">{view.orders}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total spent</dt>
                  <dd className="font-medium">{formatPrice(view.spent)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium">{view.status}</dd>
                </div>
              </dl>

              {/* Block / Unblock + Delete */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={view.status === "Active" ? "text-destructive w-full" : "w-full"}
                  onClick={() => handleToggleBlock(view)}
                >
                  {view.status === "Blocked" ? (
                    <><Shield className="h-4 w-4 mr-1" /> Unblock user</>
                  ) : (
                    <><ShieldOff className="h-4 w-4 mr-1" /> Block user</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setView(null);
                    setDeleteTarget(view);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete user
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>{" "}
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── RoleDropdown ───────────────────────────────────────────────────────────────

interface RoleDropdownProps {
  user: AdminUser;
  loading: boolean;
  onSelect: (role: Role) => void;
}

function RoleDropdown({ user, loading, onSelect }: RoleDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          className="h-7 px-2 gap-1 capitalize"
        >
          <Badge
            variant={user.role === "admin" ? "default" : "secondary"}
            className="capitalize pointer-events-none"
          >
            {loading ? "Saving…" : user.role}
          </Badge>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            className="capitalize"
            onSelect={() => onSelect(role)}
            disabled={role === user.role}
          >
            {role}
            {role === user.role && (
              <span className="ml-auto text-xs text-muted-foreground">current</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}