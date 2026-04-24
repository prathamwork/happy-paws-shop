import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Contact = () => {
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Message sent! We'll be in touch soon.");
    e.currentTarget.reset();
  };

  return (
    <div className="container py-10 md:py-14">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Get in touch</h1>
        <p className="text-muted-foreground mt-3">Questions about your order, products, or just want to say hi to our office dogs? 🐶</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <form onSubmit={submit} className="bg-card border border-border rounded-3xl p-7 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name" />
            <Field label="Email" type="email" />
          </div>
          <Field label="Subject" />
          <div>
            <label className="text-sm font-medium mb-1.5 block">Message</label>
            <textarea required rows={6} className="w-full p-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <Button type="submit" size="lg" className="rounded-full shadow-warm">Send message</Button>
        </form>

        <aside className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <Info icon={Mail} label="Email" value="hello@pawsome.com" />
            <Info icon={Phone} label="Phone" value="+1 (555) 010-2030" />
            <Info icon={MapPin} label="Office" value="123 Maple St, Brooklyn NY" />
          </div>
          <div className="rounded-3xl overflow-hidden border border-border h-64 bg-muted">
            <iframe
              title="Pawsome HQ"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-73.9966,40.6868,-73.9806,40.6968&layer=mapnik"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, type = "text" }: { label: string; type?: string }) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block">{label}</label>
    <input required type={type} className="w-full h-11 px-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary" />
  </div>
);

const Info = ({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="size-10 rounded-xl bg-secondary grid place-items-center shrink-0">
      <Icon className="size-4 text-secondary-foreground" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export default Contact;
