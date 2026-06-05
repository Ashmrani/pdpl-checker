import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">
              فاحص PDPL
            </span>
            <span className="block text-[11px] text-muted-foreground">
              خصوصية المواقع بلمسة زر
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          >
            الفحص
          </Link>
          <Link
            href="/about"
            className="rounded-lg px-3 py-2 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          >
            عن النظام
          </Link>
        </nav>
      </div>
    </header>
  );
}
