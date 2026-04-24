import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/store/admin";
import { StatusPill } from "@/components/admin/StatusPill";
import { toast } from "sonner";

export default function AdminReviews() {
  const { reviews, setReviewStatus } = useAdmin();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => reviews.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (q && !`${r.productName} ${r.user} ${r.comment}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [reviews, q, status]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} reviews</p>
      </div>

      <Card className="p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search reviews…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium max-w-[220px] truncate">{r.productName}</TableCell>
                  <TableCell>{r.user}</TableCell>
                  <TableCell>{"★".repeat(r.rating)}<span className="text-muted-foreground">{"★".repeat(5 - r.rating)}</span></TableCell>
                  <TableCell className="max-w-[320px] text-sm text-muted-foreground truncate">{r.comment}</TableCell>
                  <TableCell><StatusPill value={r.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setReviewStatus(r.id, "approved"); toast.success("Approved"); }}
                      >
                        <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setReviewStatus(r.id, "rejected"); toast.success("Rejected"); }}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
