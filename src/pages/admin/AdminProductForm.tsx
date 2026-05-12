import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Save, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { toast } from "sonner";
import placeholder from "@/assets/p-toy.jpg";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  brand: z.string().trim().max(60).default(""),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be > 0").max(100000),
  original_price: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().max(100000),
  description: z.string().trim().min(10, "Add a short description").max(1000),
  is_active: z.boolean().default(true),
});
type FormValues = z.infer<typeof schema>;

interface AdminProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  original_price?: number;
  stock: number;
  rating: number;
  image: string;
  description: string;
  is_active: boolean;
}

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [imagePreview, setImagePreview] = useState<string>(placeholder);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ── NEW: add-category state ──────────────────────────────────────────
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  // ─────────────────────────────────────────────────────────────────────

  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      stock: 0,
      description: "",
      is_active: true,
    },
  });

  // Load categories from dedicated API
  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => {
        const data: { name: string }[] | string[] =
          res.data?.data ?? res.data ?? [];
        // Handle both [{name: "Toys"}, ...] and ["Toys", ...] response shapes
        const names = data.map((c) => (typeof c === "string" ? c : c.name));
        setCategories(names);
      })
      .catch(() => {});
  }, []);

  // Load product when editing
  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}/`)
      .then((res) => {
        const p: AdminProduct = res.data?.data ?? res.data;
        reset({
          name: p.name,
          category: p.category,
          price: p.price,
          original_price: p.original_price,
          stock: p.stock,
          description: p.description ?? "",
          is_active: p.is_active,
        });
        setImagePreview(p.image);
      })
      .catch(() => toast.error("Failed to load product"));
  }, [id, reset]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(f);
  };

  // ── NEW: confirm new category ────────────────────────────────────────
  const confirmNewCategory = () => {
    const val = newCategoryInput.trim();
    if (!val) return;
    if (!categories.includes(val)) {
      setCategories((prev) => [...prev, val]);
    }
    setValue("category", val, { shouldValidate: true });
    setShowNewCategoryInput(false);
    setNewCategoryInput("");
    toast.success(`Category "${val}" added`);
  };
  // ─────────────────────────────────────────────────────────────────────

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", v.name);
      // fd.append("brand",       v.brand ?? "");
      fd.append("category", v.category);
      fd.append("price", String(v.price));
      fd.append("stock", String(v.stock));
      fd.append("description", v.description);
      fd.append("is_active", String(v.is_active));
      if (v.original_price != null)
        fd.append("original_price", String(v.original_price));
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) {
        await api.patch(`/products/${id}/`, fd);
        toast.success("Product updated");
      } else {
        await api.post("/products/", fd);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = watch("category");

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="-ml-2 mb-1"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="font-display text-2xl font-bold">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-5 md:grid-cols-[1fr_280px]"
      >
        <Card className="p-5 shadow-card space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* ── Category with "Add new" option ── */}
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(v) => {
                  if (v === "__new__") {
                    setShowNewCategoryInput(true);
                    setValue("category", "", { shouldValidate: false });
                  } else {
                    setShowNewCategoryInput(false);
                    setValue("category", v, { shouldValidate: true });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  {/* <SelectItem value="__new__">
                    ➕ Add new category...
                  </SelectItem> */}
                </SelectContent>
              </Select>

              {/* Inline new-category input */}
              {showNewCategoryInput && (
                <div className="flex gap-2 mt-1">
                  <Input
                    autoFocus
                    placeholder="New category name..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        confirmNewCategory();
                      }
                      if (e.key === "Escape") {
                        setShowNewCategoryInput(false);
                        setNewCategoryInput("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={confirmNewCategory}
                    disabled={!newCategoryInput.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}

              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            {/* <div className="space-y-1.5">
              <Label htmlFor="original_price">Original Price</Label>
              <Input id="original_price" type="number" step="0.01" {...register("original_price")} />
            </div> */}
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...register("stock")} />
              {errors.stock && (
                <p className="text-xs text-destructive">
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} {...register("description")} />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active"
              className="h-4 w-4 rounded border"
              {...register("is_active")}
            />
            <Label htmlFor="is_active">Active (visible in store)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              <Save className="h-4 w-4" />{" "}
              {isEdit ? "Save changes" : "Create product"}
            </Button>
          </div>
        </Card>

        <Card className="p-5 shadow-card h-fit space-y-3">
          <Label>Product image</Label>
          <div className="aspect-square overflow-hidden rounded-xl border bg-muted/40">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" /> Upload image
          </Button>
          <p className="text-xs text-muted-foreground">
            Square images, 800×800 or larger.
          </p>
        </Card>
      </form>
    </div>
  );
}
