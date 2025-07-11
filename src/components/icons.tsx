import { DollarSign, CheckCircle } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <div className="p-2 bg-primary/10 rounded-lg">
        <DollarSign className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-xl font-bold tracking-tighter text-foreground">
        SmartFeeTracker<span className="text-primary">+</span>
      </h1>
    </div>
  );
}
