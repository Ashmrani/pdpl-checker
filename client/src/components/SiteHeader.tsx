import { Link } from "wouter";
import { ShieldCheck, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import InstallButton from "./InstallButton";

export default function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
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
          <span className="mx-1 hidden sm:inline-flex">
            <InstallButton />
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            className="ms-1 h-9 w-9 rounded-lg"
          >
            {theme === "dark" ? (
              <Sun className="h-[1.15rem] w-[1.15rem]" />
            ) : (
              <Moon className="h-[1.15rem] w-[1.15rem]" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
