import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/store/admin";
import { toast } from "sonner";

export default function AdminSettings() {
  const { store, updateStore } = useAdmin();
  const [profile, setProfile] = useState({ name: "Admin", email: "admin@pawsome.shop" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and store preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-5 shadow-card space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => toast.success("Profile saved")}>Save</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="p-5 shadow-card space-y-4">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm new password</Label>
                <Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (!pwd.next || pwd.next !== pwd.confirm) {
                    toast.error("Passwords do not match");
                    return;
                  }
                  toast.success("Password updated");
                  setPwd({ current: "", next: "", confirm: "" });
                }}
              >
                Update password
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card className="p-5 shadow-card space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Store name</Label>
                <Input value={store.name} onChange={(e) => updateStore({ name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Logo text</Label>
                <Input value={store.logoText} onChange={(e) => updateStore({ logoText: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={store.currency} onValueChange={(v) => updateStore({ currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound</SelectItem>
                    <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => toast.success("Store settings saved")}>Save</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
