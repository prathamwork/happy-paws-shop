import { useEffect, useMemo, useState } from "react";
import { Check, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/admin/StatusPill";
import { toast } from "sonner";

interface Review {
  id: number;
  productName: string;
  user: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

async function fetchReviews(): Promise<Review[]> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const token = localStorage.getItem("pawsome-access-token"); // 👈 match your actual key

  const res = await fetch(`${base}/admin/reviews/`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch reviews (${res.status})`);
  const json = await res.json();
  return (json.data ?? []).map((r: any) => ({
    id: r.id,
    productName: r.product,
    user: r.user,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    created_at: r.created_at,
  }));
}

async function updateReviewStatus(
  id: number,
  status: "approved" | "rejected",
): Promise<void> {
  const res = await fetch(`/api/admin/reviews/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update review (${res.status})`);
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  // Fetch on mount
  useEffect(() => {
    setLoading(true);
    fetchReviews()
      .then((data) => {
        setReviews(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      reviews.filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (
          q &&
          !`${r.productName} ${r.user} ${r.comment}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
          return false;
        return true;
      }),
    [reviews, q, status],
  );

  const handleStatusChange = async (
    id: number,
    newStatus: "approved" | "rejected",
  ) => {
    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );

    try {
      await updateReviewStatus(id, newStatus);
      toast.success(newStatus === "approved" ? "Approved" : "Rejected");
    } catch (err: any) {
      // Rollback on failure
      toast.error(`Failed to update: ${err.message}`);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: r.status } : r)),
      );
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${filtered.length} reviews`}
        </p>
      </div>

      <Card className="p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search reviews…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
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
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading reviews…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                fetchReviews()
                  .then((data) => {
                    setReviews(data);
                    setError(null);
                  })
                  .catch((err) => setError(err.message))
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            No reviews found.
          </div>
        ) : (
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
                    <TableCell className="font-medium max-w-[220px] truncate">
                      {r.productName}
                    </TableCell>
                    <TableCell>{r.user}</TableCell>
                    <TableCell>
                      {"★".repeat(r.rating)}
                      <span className="text-muted-foreground">
                        {"★".repeat(5 - r.rating)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[320px] text-sm text-muted-foreground truncate">
                      {r.comment}
                    </TableCell>
                    <TableCell>
                      <StatusPill value={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={r.status === "approved"}
                          onClick={() => handleStatusChange(r.id, "approved")}
                        >
                          <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={r.status === "rejected"}
                          onClick={() => handleStatusChange(r.id, "rejected")}
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
        )}
      </Card>
    </div>
  );
}
