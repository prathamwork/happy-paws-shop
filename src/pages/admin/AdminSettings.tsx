import { useEffect, useState } from "react";
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
import { toast } from "sonner";

interface StoreSettings {
  site_name: string;
  support_email: string;
  currency: string;
  tax_percentage: number;
  shipping_charge: number;
  maintenance_mode: boolean;
  logo: string | null;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("pawsome-access-token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: "Admin", email: "admin@pawsome.shop" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  // ── Fetch settings on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/admin/settings/`,
          { headers: authHeaders() }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error("API returned success: false");
        setSettings(json.data);
      } catch (err) {
        toast.error(`Failed to load settings: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ── Save store settings ──────────────────────────────────────────────────
  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/settings/`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify(settings),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error("API returned success: false");
      toast.success("Store settings saved");
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (patch: Partial<StoreSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

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

        {/* ── Profile Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card className="p-5 shadow-card space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => toast.success("Profile saved")}>Save</Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Password Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="password">
          <Card className="p-5 shadow-card space-y-4">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input
                type="password"
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={pwd.next}
                  onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                />
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

        {/* ── Store Tab ────────────────────────────────────────────────────── */}
        <TabsContent value="store">
          <Card className="p-5 shadow-card space-y-4">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 rounded-md bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : settings ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Site name</Label>
                    <Input
                      value={settings.site_name}
                      onChange={(e) => updateSettings({ site_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Support email</Label>
                    <Input
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => updateSettings({ support_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(v) => updateSettings({ currency: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD — US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR — Euro</SelectItem>
                        <SelectItem value="GBP">GBP — British Pound</SelectItem>
                        <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tax percentage (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={settings.tax_percentage}
                      onChange={(e) => updateSettings({ tax_percentage: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Shipping charge</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={settings.shipping_charge}
                      onChange={(e) => updateSettings({ shipping_charge: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Maintenance mode</Label>
                    <Select
                      value={settings.maintenance_mode ? "true" : "false"}
                      onValueChange={(v) => updateSettings({ maintenance_mode: v === "true" })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Off</SelectItem>
                        <SelectItem value="true">On</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveSettings} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Could not load store settings.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}