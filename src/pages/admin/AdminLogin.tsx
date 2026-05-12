import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PawPrint, Lock, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(100),
});
type FormValues = z.infer<typeof schema>;

const ALLOWED_ROLES = ["admin", "manager"] as const;

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { from?: { pathname?: string } };
  };

  // Destructure logout from the hook — same reference, triggers subscribers correctly
  const { user, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const fromRef = useRef(location.state?.from?.pathname ?? "/admin");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // Redirect if already logged in as admin/manager on mount
  useEffect(() => {
    if (user?.role === "admin" || user?.role === "manager") {
      navigate(fromRef.current, { replace: true });
    }
  }, [user?.role, navigate]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const loggedInUser = await login(values.email, values.password);

      if (!loggedInUser) {
        toast.error("Login failed: no user returned");
        return;
      }

      // Only admin / manager may access the admin panel
      if (
        !ALLOWED_ROLES.includes(
          loggedInUser.role as (typeof ALLOWED_ROLES)[number],
        )
      ) {
        toast.error("Access denied: admin or manager account required");
        // Use logout from the hook, not getState(), so persist clears correctly
        logout();
        return;
      }

      toast.success("Welcome back, Admin");
      navigate(fromRef.current, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-float border-border/60">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-warm">
              <PawPrint className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">
              Pawsome Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your store
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}