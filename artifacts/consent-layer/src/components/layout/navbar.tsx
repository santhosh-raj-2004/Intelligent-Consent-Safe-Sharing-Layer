import { Link, useLocation } from "wouter";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/30">
            <ShieldCheck className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            TrustLayer
          </span>
        </div>

        <nav className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
          <Link
            href="/"
            className={cn(
              "px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200",
              location === "/"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Consent Request
          </Link>
          <Link
            href="/control-panel"
            className={cn(
              "px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5",
              location === "/control-panel"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Control Panel
          </Link>
        </nav>
      </div>
    </header>
  );
}
