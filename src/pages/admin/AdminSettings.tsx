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

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  email: string;
}

interface StoreSettings {
  site_name: string;
  support_email: string;
  currency: string;
  tax_percentage: number;
  shipping_charge: number;
  maintenance_mode: boolean;
  logo: string | null;
}

// ── Auth header helper ────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("pawsome-access-token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  // Profile
  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  // Store
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeSaving, setStoreSaving] = useState(false);

  // ── GET /admin/settings/profile/ ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setProfileLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/admin/settings/profile/`,
          { headers: authHeaders() }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error("API error");
        setProfile(json.data);
      } catch (err) {
        toast.error(`Failed to load profile: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

  // ── GET /admin/settings/store/ ───────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setStoreLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/admin/settings/store/`,
          { headers: authHeaders() }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error("API error");
        setStore(json.data);
      } catch (err) {
        toast.error(`Failed to load store settings: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setStoreLoading(false);
      }
    })();
  }, []);

  // ── PATCH /admin/settings/profile/ ───────────────────────────────────────
  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/settings/profile/`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ name: profile.name, email: profile.email }),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "Failed to save");
      setProfile(json.data);
      toast.success(json.message ?? "Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setProfileSaving(false);
    }
  };

  // ── PATCH /admin/settings/password/ ──────────────────────────────────────
  const savePassword = async () => {
    if (!pwd.current) {
      toast.error("Please enter your current password");
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/settings/password/`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({
            current_password: pwd.current,
            new_password: pwd.next,
            confirm_password: pwd.confirm,
          }),
        }
      );
      const json = await res.json();
      if (!json.success) {
        // message can be a string or an array of validation strings
        const msg = Array.isArray(json.message)
          ? json.message.join(" ")
          : (json.message ?? "Failed to update password");
        toast.error(msg);
        return;
      }
      toast.success(json.message ?? "Password updated successfully");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPwdSaving(false);
    }
  };

  // ── PATCH /admin/settings/store/ ─────────────────────────────────────────
  const saveStore = async () => {
    if (!store) return;
    setStoreSaving(true);
    try {
      const { logo: _logo, ...body } = store; // logo is read-only, omit from request
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/settings/store/`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "Failed to save");
      setStore(json.data);
      toast.success(json.message ?? "Store settings updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setStoreSaving(false);
    }
  };

  const updateStore = (patch: Partial<StoreSettings>) =>
    setStore((prev) => (prev ? { ...prev, ...patch } : prev));

  // ── Skeleton ──────────────────────────────────────────────────────────────
  const Skeleton = ({ count = 2 }: { count?: number }) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-10 rounded-md bg-muted/40 animate-pulse" />
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
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

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card className="p-5 shadow-card space-y-4">
            {profileLoading ? (
              <Skeleton count={2} />
            ) : (
              <>
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
                  <Button onClick={saveProfile} disabled={profileSaving}>
                    {profileSaving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        {/* ── Password ─────────────────────────────────────────────────────── */}
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
              <Button onClick={savePassword} disabled={pwdSaving}>
                {pwdSaving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Store ────────────────────────────────────────────────────────── */}
        <TabsContent value="store">
          <Card className="p-5 shadow-card space-y-4">
            {storeLoading ? (
              <Skeleton count={6} />
            ) : store ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Site name</Label>
                    <Input
                      value={store.site_name}
                      onChange={(e) => updateStore({ site_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Support email</Label>
                    <Input
                      type="email"
                      value={store.support_email}
                      onChange={(e) => updateStore({ support_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select
                      value={store.currency}
                      onValueChange={(v) => updateStore({ currency: v })}
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
                      value={store.tax_percentage}
                      onChange={(e) => updateStore({ tax_percentage: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Shipping charge</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={store.shipping_charge}
                      onChange={(e) => updateStore({ shipping_charge: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Maintenance mode</Label>
                    <Select
                      value={store.maintenance_mode ? "true" : "false"}
                      onValueChange={(v) => updateStore({ maintenance_mode: v === "true" })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Off</SelectItem>
                        <SelectItem value="true">On</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Logo preview — read-only */}
                {store.logo && (
                  <div className="space-y-1.5">
                    <Label>Logo</Label>
                    <img
                      src={store.logo}
                      alt="Store logo"
                      className="h-12 w-auto rounded-md object-contain border border-border p-1"
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={saveStore} disabled={storeSaving}>
                    {storeSaving ? "Saving…" : "Save"}
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