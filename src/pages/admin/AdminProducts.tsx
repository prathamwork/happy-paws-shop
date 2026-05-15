import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { api } from "@/services/api";
import { toast } from "sonner";

interface AdminProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  average_rating: number;
  ratings: { id: number; rating: number; review: string }[];
  image: string;
  is_active: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [stock, setStock] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const categories = useMemo(() => {
    const seen = new Set<string>();
    return products
      .map((p) => p.category)
      .filter((c) => { if (seen.has(c)) return false; seen.add(c); return true; });
  }, [products]);

  useEffect(() => {
    api
      .get("/products/")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (product: AdminProduct) => {
    try {
      await api.delete(`/products/${product.id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(`"${product.name}" deleted`);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleStatusChange = async (product: AdminProduct, val: string) => {
    const newStatus = val === "active";
    try {
      await api.patch(`/products/${product.id}/`, { is_active: newStatus });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, is_active: newStatus } : item
        )
      );
      toast.success(`"${product.name}" marked as ${val}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (cat !== "all" && p.category.toLowerCase() !== cat.toLowerCase()) return false;
      if (stock === "low" && p.stock > 20) return false;
      if (stock === "out" && p.stock > 0) return false;
      if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products, q, cat, stock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${filtered.length} products`}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin/products/new"><Plus className="h-4 w-4" /> New Product</Link>
        </Button>
      </div>

      <Card className="p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or brand…"
              className="pl-9"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stock} onValueChange={(v) => { setStock(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Stock" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stock</SelectItem>
              <SelectItem value="low">Low (≤ 20)</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
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
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10 animate-pulse">
                    Loading products…
                  </TableCell>
                </TableRow>
              )}
              {!loading && pageItems.map((p) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b transition-colors hover:bg-muted/40"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={`${import.meta.env.VITE_API_IMAGE_URL}${p.image}`} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium leading-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand || "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{p.category}</TableCell>
                  <TableCell className="font-semibold">{formatPrice(p.price)}</TableCell>
                  <TableCell>
                    {p.stock === 0 ? (
                      <Badge variant="destructive">Out</Badge>
                    ) : p.stock <= 20 ? (
                      <Badge className="bg-warning/15 text-[hsl(var(--warning))] hover:bg-warning/15">
                        {p.stock} low
                      </Badge>
                    ) : (
                      <span>{p.stock}</span>
                    )}
                  </TableCell>
                  <TableCell>{p.average_rating > 0 ? `${p.average_rating} ★` : "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={p.is_active ? "active" : "inactive"}
                      onValueChange={(val) => handleStatusChange(p, val)}
                    >
                      <SelectTrigger className="h-7 w-[110px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                            Active
                          </span>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />
                            Inactive
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/admin/products/${p.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove "{p.name}" from your catalog.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(p)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
              {!loading && pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t p-3 text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}