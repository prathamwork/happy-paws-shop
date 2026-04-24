import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuthFormProps {
  mode: "login" | "register" | "forgot";
}

const titles = {
  login: { h: "Welcome back", p: "Sign in to your account" },
  register: { h: "Join the pack", p: "Create your Pawsome account" },
  forgot: { h: "Forgot password?", p: "We'll send you a reset link" },
};

const AuthForm = ({ mode }: AuthFormProps) => {
  const t = titles[mode];
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(mode === "forgot" ? "Reset link sent (demo)" : "Welcome to Pawsome! 🐾");
    if (mode !== "forgot") navigate("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center container py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex size-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-warm mb-4">
            <PawPrint className="size-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl font-bold">{t.h}</h1>
          <p className="text-muted-foreground mt-2">{t.p}</p>
        </div>

        <form onSubmit={submit} className="bg-card border border-border rounded-3xl p-7 shadow-card space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full name</label>
              <input required className="w-full h-12 px-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input required type="email" className="w-full h-12 px-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {mode !== "forgot" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <input required type="password" className="w-full h-12 px-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary" />
            </div>
          )}

          <Button type="submit" size="lg" className="w-full rounded-full shadow-warm mt-2">
            {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-2">
            {mode === "login" && (
              <>
                <Link to="/forgot-password" className="hover:text-primary transition">Forgot password?</Link>
                <p className="mt-3">No account? <Link to="/register" className="text-primary font-medium">Sign up</Link></p>
              </>
            )}
            {mode === "register" && (
              <p>Already a member? <Link to="/login" className="text-primary font-medium">Sign in</Link></p>
            )}
            {mode === "forgot" && (
              <Link to="/login" className="text-primary font-medium">← Back to sign in</Link>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthForm;
