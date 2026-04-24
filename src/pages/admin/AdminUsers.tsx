import { useMemo, useState } from "react";
import { Search, Shield, ShieldOff } from "lucide-react";
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
import { useAdmin } from "@/store/admin";
import { formatPrice } from "@/lib/format";
import type { AdminUser } from "@/data/admin";
import { toast } from "sonner";

export default function AdminUsers() {
  const { users, toggleBlock } = useAdmin();
  const [q, setQ] = useState("");
  const [view, setView] = useState<AdminUser | null>(null);

  const filtered = useMemo(
    () => users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())),
    [users, q],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} users</p>
      </div>

      <Card className="p-4 shadow-card">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </Card>

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
              {filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/40">
                  <TableCell>
                    <button onClick={() => setView(u)} className="flex items-center gap-3 text-left">
                      <div className="h-9 w-9 rounded-full bg-gradient-warm grid place-items-center font-semibold text-sm">
                        {u.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium hover:underline">{u.name}</span>
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(u.joined).toLocaleDateString()}</TableCell>
                  <TableCell>{u.orders}</TableCell>
                  <TableCell className="font-semibold">{formatPrice(u.spent)}</TableCell>
                  <TableCell>
                    {u.blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge className="bg-success/15 text-[hsl(var(--success))] hover:bg-success/15">Active</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toggleBlock(u.id);
                        toast.success(u.blocked ? "User unblocked" : "User blocked");
                      }}
                    >
                      {u.blocked ? <Shield className="h-4 w-4 mr-1" /> : <ShieldOff className="h-4 w-4 mr-1" />}
                      {u.blocked ? "Unblock" : "Block"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-warm grid place-items-center font-semibold">
                  {view.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">{view.name}</p>
                  <p className="text-sm text-muted-foreground">{view.email}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Role</dt><dd className="font-medium capitalize">{view.role}</dd></div>
                <div><dt className="text-muted-foreground">Joined</dt><dd className="font-medium">{new Date(view.joined).toLocaleDateString()}</dd></div>
                <div><dt className="text-muted-foreground">Orders</dt><dd className="font-medium">{view.orders}</dd></div>
                <div><dt className="text-muted-foreground">Total spent</dt><dd className="font-medium">{formatPrice(view.spent)}</dd></div>
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
