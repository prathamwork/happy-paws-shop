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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/store/admin";
import type { Category } from "@/data/products";
import { toast } from "sonner";
import placeholder from "@/assets/p-toy.jpg";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  brand: z.string().trim().min(1, "Brand is required").max(60),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be > 0").max(100000),
  originalPrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().max(100000),
  rating: z.coerce.number().min(0).max(5).default(4.5),
  description: z.string().trim().min(10, "Add a short description").max(1000),
  tags: z.string().max(200).optional(),
});
type FormValues = {
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  description: string;
  tags?: string;
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, categories } = useAdmin();
  const editing = id ? products.find((p) => p.id === id) : null;
  const [image, setImage] = useState<string>(editing?.image ?? placeholder);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing?.name ?? "",
      brand: editing?.brand ?? "",
      category: editing?.category ?? "dogs",
      price: editing?.price ?? 0,
      originalPrice: editing?.originalPrice ?? undefined,
      stock: editing?.stock ?? 0,
      rating: editing?.rating ?? 4.5,
      description: editing?.description ?? "",
      tags: editing?.tags?.join(", ") ?? "",
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        brand: editing.brand,
        category: editing.category,
        price: editing.price,
        originalPrice: editing.originalPrice,
        stock: editing.stock,
        rating: editing.rating,
        description: editing.description,
        tags: editing.tags.join(", "),
      });
      setImage(editing.image);
    }
  }, [editing, reset]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  const onSubmit = (v: FormValues) => {
    const tags = (v.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    if (editing) {
      updateProduct(editing.id, { ...v, category: v.category as Category, image, tags });
      toast.success("Product updated");
    } else {
      addProduct({
        id: `p-${Date.now()}`,
        name: v.name,
        brand: v.brand,
        category: v.category as Category,
        price: v.price,
        originalPrice: v.originalPrice,
        stock: v.stock,
        rating: v.rating,
        reviews: 0,
        image,
        description: v.description,
        tags,
      });
      toast.success("Product created");
    }
    navigate("/admin/products");
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 mb-1">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="font-display text-2xl font-bold">{editing ? "Edit Product" : "New Product"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-[1fr_280px]">
        <Card className="p-5 shadow-card space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" {...register("brand")} />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                defaultValue={editing?.category ?? "dogs"}
                onValueChange={(v) => reset((prev) => ({ ...prev, category: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("category")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input id="originalPrice" type="number" step="0.01" {...register("originalPrice")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...register("stock")} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" placeholder="grain-free, premium" {...register("tags")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" /> {editing ? "Save changes" : "Create product"}
            </Button>
          </div>
        </Card>

        <Card className="p-5 shadow-card h-fit space-y-3">
          <Label>Product image</Label>
          <div className="aspect-square overflow-hidden rounded-xl border bg-muted/40">
            <img src={image} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" /> Upload image
          </Button>
          <p className="text-xs text-muted-foreground">Square images, 800×800 or larger.</p>
        </Card>
      </form>
    </div>
  );
}
