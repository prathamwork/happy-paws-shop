import { useEffect, useRef, useState } from "react";
import { Edit2, ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  is_active: boolean;
  created_at: string;
}

function useImagePicker() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
  };

  const reset = () => { setFile(null); setPreview(""); };

  return { fileRef, file, preview, pick, reset };
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newId, setNewId]           = useState("");
  const [newName, setNewName]       = useState("");
  const [newSlug, setNewSlug]       = useState("");
  const [creating, setCreating]     = useState(false);
  const createImg = useImagePicker();

  // Edit dialog
  const [editing, setEditing]   = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving]     = useState(false);
  const editImg = useImagePicker();

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  // ── Toggle active ────────────────────────────────────────────────────────
  const handleToggleActive = async (category: Category) => {
    const newActive = !category.is_active;
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, is_active: newActive } : c))
    );
    try {
      await api.patch(`/categories/${category.id}/`, { is_active: newActive });
      toast.success(newActive ? `"${category.name}" activated` : `"${category.name}" deactivated`);
    } catch {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, is_active: category.is_active } : c))
      );
      toast.error("Failed to update category");
    }
  };

  // ── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const fd = new FormData();
      if (newId.trim()) fd.append("id", newId.trim());
      fd.append("name", newName.trim());
      if (newSlug.trim()) fd.append("slug", newSlug.trim());
      if (createImg.file) fd.append("image", createImg.file);

      const res = await api.post("/categories/", fd);
      const created: Category = res.data?.data ?? res.data;
      setCategories((prev) => [created, ...prev]);
      toast.success("Category created");
      setNewId("");
      setNewName("");
      setNewSlug("");
      createImg.reset();
      setCreateOpen(false);
    } catch {
      toast.error("Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (c: Category) => {
    setEditing(c);
    setEditName(c.name);
    editImg.reset();
  };

  const handleSave = async () => {
    if (!editing || !editName.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", editName.trim());
      if (editImg.file) fd.append("image", editImg.file);

      const res = await api.patch(`/categories/${editing.id}/`, fd);
      const updated: Category = res.data?.data ?? res.data;
      setCategories((prev) =>
        prev.map((c) => (c.id === editing.id ? updated : c))
      );
      toast.success("Category updated");
      setEditing(null);
    } catch {
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (category: Category) => {
    try {
      await api.delete(`/categories/${category.id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${categories.length} categories`}
          </p>
        </div>

        {/* ── Create dialog ── */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create category</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* <div className="space-y-1.5">
                <Label htmlFor="cat-id">ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="cat-id"
                  type="number"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div> */}
              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Reptiles"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-slug">Slug <span className="text-muted-foreground text-xs">(optional — auto-generated if blank)</span></Label>
                <Input
                  id="cat-slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="e.g. reptiles"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                {createImg.preview && (
                  <img src={createImg.preview} alt="preview" className="h-28 w-full object-cover rounded-lg" />
                )}
                <input ref={createImg.fileRef} type="file" accept="image/*" className="hidden" onChange={createImg.pick} />
                <Button
                  type="button" variant="outline" size="sm" className="gap-2"
                  onClick={() => createImg.fileRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" /> Upload image
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Category grid ── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5 shadow-card h-40 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="shadow-card overflow-hidden">
              {/* Category image */}
              {c.image && (
                <div className="relative">
                  <img
                    src={c.image}
                    alt={c.name}
                    className={`h-32 w-full object-cover transition-opacity ${!c.is_active ? "opacity-40" : ""}`}
                  />
                  {!c.is_active && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded">
                        Inactive
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold capitalize truncate">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-muted-foreground">/{c.slug}</p>
                    {/* Clickable active/inactive badge */}
                    <button
                      onClick={() => handleToggleActive(c)}
                      title={c.is_active ? "Click to deactivate" : "Click to activate"}
                      className="focus:outline-none"
                    >
                      <Badge
                        className={`text-xs cursor-pointer transition-opacity hover:opacity-70 ${
                          c.is_active
                            ? "bg-success/15 text-[hsl(var(--success))] hover:bg-success/15"
                            : "bg-destructive/15 text-destructive hover:bg-destructive/15"
                        }`}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{c.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Products in this category will keep their tag but the filter will be removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(c)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Edit dialog ── */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Image</Label>
              <img
                src={editImg.preview || editing?.image}
                alt="preview"
                className="h-28 w-full object-cover rounded-lg"
              />
              <input ref={editImg.fileRef} type="file" accept="image/*" className="hidden" onChange={editImg.pick} />
              <Button
                type="button" variant="outline" size="sm" className="gap-2"
                onClick={() => editImg.fileRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" /> Change image
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !editName.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}