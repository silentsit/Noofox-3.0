import { Lock, Package, ShieldCheck, Truck } from 'lucide-react';

const items = [
  { icon: Lock, label: 'SSL & private checkout' },
  { icon: ShieldCheck, label: 'Guaranteed delivery' },
  { icon: Truck, label: 'Tracked worldwide shipping' },
  { icon: Package, label: 'Discreet packaging' },
];

export function CheckoutTrustStrip() {
  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 text-sm"
        >
          <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
