import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "PW-DEMO01";

  return (
    <div className="container py-20 text-center max-w-xl">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="size-24 rounded-full bg-success/10 grid place-items-center mx-auto mb-6"
      >
        <CheckCircle2 className="size-14 text-success" strokeWidth={1.5} />
      </motion.div>
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Order confirmed!</h1>
      <p className="text-muted-foreground text-lg mb-2">Thank you for shopping with Pawsome 🐾</p>
      <p className="text-sm text-muted-foreground mb-8">
        Order ID: <span className="font-mono font-semibold text-foreground">{id}</span>
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/dashboard"><Button variant="outline" className="rounded-full">View orders</Button></Link>
        <Link to="/shop"><Button className="rounded-full shadow-warm">Keep shopping</Button></Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
