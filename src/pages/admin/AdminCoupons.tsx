import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAdmin } from "@/store/admin";
import { StatusPill } from "@/components/admin/StatusPill";
import { toast } from "sonner";

export default function AdminCoupons() {
  const { coupons, addCoupon, toggleCoupon, removeCoupon } = useAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: 10, expiry: "" });

  const submit = () => {
    if (!form.code.trim() || !form.expiry) {
      toast.error("Code and expiry are required");
      return;
    }
    addCoupon({
      id: `C-${Date.now()}`,
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      expiry: form.expiry,
      active: true,
      uses: 0,
    });
    toast.success("Coupon created");
    setOpen(false);
    setForm({ code: "", type: "percent", value: 10, expiry: "" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground">{coupons.length} promo codes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create coupon</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "percent" | "fixed" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percent (%)</SelectItem>
                      <SelectItem value="fixed">Fixed ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Value</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Expiry</Label>
                <Input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
              </div>
            </div>
            <DialogFooter><Button onClick={submit}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => {
                const expired = new Date(c.expiry) < new Date();
                return (
                  <TableRow key={c.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                    <TableCell>{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</TableCell>
                    <TableCell className={expired ? "text-destructive" : "text-muted-foreground"}>
                      {new Date(c.expiry).toLocaleDateString()} {expired && "(expired)"}
                    </TableCell>
                    <TableCell>{c.uses}</TableCell>
                    <TableCell><StatusPill value={c.active ? "active" : "inactive"} /></TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Switch checked={c.active} onCheckedChange={() => toggleCoupon(c.id)} />
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { removeCoupon(c.id); toast.success("Coupon removed"); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
