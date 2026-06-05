import { useState, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import ScanLoader from "@/components/ScanLoader";
import ScanResults from "@/components/ScanResults";
import type { ScanReport } from "@/lib/report-types";
import {
  Search,
  ShieldCheck,
  Cookie,
  Radar,
  Lock,
  ArrowLeft,
} from "lucide-react";

const EXAMPLES = ["nytimes.com", "amazon.com", "cnn.com"];

export default function Home() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<ScanReport | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scan = trpc.scan.run.useMutation({
    onSuccess: data => {
      setReport(data as ScanReport);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    onError: err => {
      toast.error(err.message || "حدث خطأ أثناء الفحص، حاول مرة أخرى.");
    },
  });

  const handleScan = (target?: string) => {
    const value = (target ?? url).trim();
    if (!value) {
      toast.error("الرجاء إدخال رابط موقع للفحص.");
      return;
    }
    if (target) setUrl(target);
    setReport(null);
    scan.mutate({ url: value });
  };

  const reset = () => {
    setReport(null);
    setUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isScanning = scan.isPending;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero + input */}
      <section className="relative overflow-hidden bg-grid">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        <div className="container relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              مبني على نظام حماية البيانات الشخصية السعودي
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              افحص خصوصية أي موقع
              <br />
              <span className="text-primary">والتزامه بنظام PDPL</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              اكتشف كيف تتعقّبك المواقع وما إذا كانت تحترم بياناتك — بدون أي خبرة
              تقنية. فقط الصق الرابط واضغط فحص.
            </p>

            {/* Input */}
            <div className="mx-auto mt-9 max-w-2xl">
              <Card className="flex flex-col gap-3 p-3 shadow-lg sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleScan();
                    }}
                    placeholder="مثال: example.com.sa"
                    dir="ltr"
                    disabled={isScanning}
                    className="h-12 border-0 bg-transparent pr-10 text-base shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={() => handleScan()}
                  disabled={isScanning}
                  className="h-12 gap-2 px-7 text-base"
                >
                  <Search className="h-5 w-5" />
                  {isScanning ? "جاري الفحص…" : "افحص الموقع"}
                </Button>
              </Card>

              {!isScanning && !report && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>جرّب:</span>
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      onClick={() => handleScan(ex)}
                      dir="ltr"
                      className="rounded-full border border-border bg-card px-3 py-1 transition-colors hover:border-primary hover:text-primary"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results / Loader area */}
      <section ref={resultsRef} className="container scroll-mt-20 pb-20">
        {isScanning && (
          <Card className="mx-auto max-w-2xl">
            <ScanLoader hostname={url} />
          </Card>
        )}

        {!isScanning && report && (
          <div className="mx-auto max-w-3xl pt-4">
            <ScanResults report={report} onReset={reset} />
          </div>
        )}

        {/* Feature highlights (only before scanning) */}
        {!isScanning && !report && (
          <div className="mx-auto max-w-5xl pt-8">
            <div className="grid gap-5 md:grid-cols-3">
              <FeatureCard
                icon={<Cookie className="h-6 w-6" />}
                title="كشف الكوكيز"
                desc="نرصد ملفات تعريف الارتباط التي يضعها الموقع على جهازك."
              />
              <FeatureCard
                icon={<Radar className="h-6 w-6" />}
                title="رصد أدوات التتبع"
                desc="نتعرّف على شركات الإعلانات والتحليلات التي تراقب سلوكك."
              />
              <FeatureCard
                icon={<Lock className="h-6 w-6" />}
                title="تقييم PDPL"
                desc="نقيّم مدى التزام الموقع بنظام حماية البيانات الشخصية السعودي."
              />
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                ما هو نظام حماية البيانات الشخصية (PDPL)؟
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          أداة استرشادية للتوعية بالخصوصية — لا تُعدّ استشارة قانونية.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="p-6 text-center transition-transform hover:-translate-y-1">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </Card>
  );
}
