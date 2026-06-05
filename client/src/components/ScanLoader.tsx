import { useEffect, useState } from "react";
import { ShieldCheck, Cookie, Radar, FileSearch } from "lucide-react";

const STEPS = [
  { icon: Cookie, text: "نفحص ملفات الكوكيز…" },
  { icon: Radar, text: "نكتشف أدوات التتبع الخارجية…" },
  { icon: FileSearch, text: "نبحث عن سياسة الخصوصية وبانر الموافقة…" },
  { icon: ShieldCheck, text: "نُقيّم الالتزام بنظام حماية البيانات (PDPL)…" },
];

export default function ScanLoader({ hostname }: { hostname?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s + 1) % STEPS.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const Active = STEPS[step].icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-32 w-32 rounded-full bg-primary/20 animate-pulse-ring" />
        <span
          className="absolute h-32 w-32 rounded-full bg-primary/10 animate-pulse-ring"
          style={{ animationDelay: "0.6s" }}
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Radar className="h-10 w-10 animate-radar-spin" />
        </div>
      </div>

      <div className="mt-10 flex items-center gap-3 text-lg font-medium text-foreground">
        <Active className="h-5 w-5 text-primary" />
        <span>{STEPS[step].text}</span>
      </div>
      {hostname && (
        <p className="mt-3 text-sm text-muted-foreground" dir="ltr">
          {hostname}
        </p>
      )}

      <div className="mt-8 flex gap-2">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
