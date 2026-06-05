import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS_AR,
  PDPL_STATUS_AR,
  type ScanReport,
  type TrackerCategory,
} from "@/lib/report-types";
import {
  Cookie,
  Radar,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Printer,
  RotateCcw,
  Lock,
  Building2,
} from "lucide-react";

interface Props {
  report: ScanReport;
  onReset: () => void;
}

function statusVisuals(status: ScanReport["pdplStatus"]) {
  switch (status) {
    case "compliant":
      return {
        label: PDPL_STATUS_AR.compliant,
        className: "bg-success/15 text-success border-success/30",
        Icon: ShieldCheck,
      };
    case "needs_improvement":
      return {
        label: PDPL_STATUS_AR.needs_improvement,
        className: "bg-warning/15 text-warning-foreground border-warning/40",
        Icon: AlertTriangle,
      };
    default:
      return {
        label: PDPL_STATUS_AR.non_compliant,
        className: "bg-destructive/10 text-destructive border-destructive/30",
        Icon: X,
      };
  }
}

const CATEGORY_COLORS: Record<TrackerCategory, string> = {
  advertising: "bg-[oklch(0.62_0.21_27)]",
  analytics: "bg-[oklch(0.55_0.14_255)]",
  social: "bg-[oklch(0.6_0.13_300)]",
  tagmanager: "bg-[oklch(0.7_0.13_85)]",
  fingerprinting: "bg-[oklch(0.5_0.1_30)]",
  session_replay: "bg-[oklch(0.55_0.12_330)]",
};

import ScoreGauge from "./ScoreGauge";

export default function ScanResults({ report, onReset }: Props) {
  const status = statusVisuals(report.pdplStatus);
  const StatusIcon = status.Icon;
  const passedChecks = report.pdplChecks.filter(c => c.passed).length;

  const categoryEntries = Object.entries(report.trackersByCategory) as [
    TrackerCategory,
    number,
  ][];
  const maxCat = Math.max(1, ...categoryEntries.map(([, n]) => n));

  if (!report.fetchedOk) {
    return (
      <div className="animate-fade-up">
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mt-5 text-2xl font-bold">تعذّر فحص الموقع</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {report.summary || report.errorMessage}
          </p>
          <p className="mt-2 text-sm text-muted-foreground" dir="ltr">
            {report.hostname}
          </p>
          <Button onClick={onReset} className="mt-6 gap-2">
            <RotateCcw className="h-4 w-4" /> فحص موقع آخر
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up print:space-y-4">
      {/* Header / Overall */}
      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 p-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex justify-center">
            <ScoreGauge score={report.score} grade={report.grade} />
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">نتيجة فحص الموقع</p>
            <h2
              className="mt-1 text-3xl font-extrabold tracking-tight break-all"
              dir="ltr"
            >
              {report.hostname}
            </h2>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${status.className}`}
              >
                <StatusIcon className="h-4 w-4" />
                {status.label} لنظام PDPL
              </span>
              {report.usesHttps && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                  <Lock className="h-3.5 w-3.5" /> اتصال مشفّر
                </span>
              )}
            </div>
            <p className="mt-5 leading-relaxed text-foreground/90">
              {report.summary}
            </p>
          </div>
        </div>
      </Card>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<Cookie className="h-6 w-6" />}
          value={report.cookieCount}
          label="ملفات الكوكيز"
          hint="ملفات صغيرة يحفظها الموقع على جهازك لتذكّرك أو تتبّعك."
        />
        <MetricCard
          icon={<Radar className="h-6 w-6" />}
          value={report.trackerCount}
          label="أدوات التتبع الخارجية"
          hint="خدمات من شركات أخرى تراقب سلوكك على الموقع."
          danger={report.trackerCount > 5}
        />
        <MetricCard
          icon={<ShieldCheck className="h-6 w-6" />}
          value={`${passedChecks}/${report.pdplChecks.length}`}
          label="معايير PDPL المجتازة"
          hint="عدد متطلبات نظام حماية البيانات التي يحققها الموقع."
        />
      </div>

      {/* PDPL breakdown */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold">تفاصيل الالتزام بنظام PDPL</h3>
        </div>
        <div className="divide-y">
          {report.pdplChecks.map(check => (
            <div
              key={check.id}
              className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  check.passed
                    ? "bg-success/15 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {check.passed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{check.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {check.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trackers breakdown */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Radar className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold">أدوات التتبع والكوكيز</h3>
        </div>

        {report.trackerCount === 0 ? (
          <div className="rounded-lg bg-success/10 p-4 text-success">
            لم نرصد أي أدوات تتبع معروفة على هذا الموقع — خبر جيد لخصوصيتك.
          </div>
        ) : (
          <>
            {/* Category bars */}
            <div className="space-y-3">
              {categoryEntries
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {CATEGORY_LABELS_AR[cat] ?? cat}
                      </span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${CATEGORY_COLORS[cat] ?? "bg-primary"}`}
                        style={{
                          width: `${(count / maxCat) * 100}%`,
                          transition:
                            "width 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* Companies */}
            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" /> الشركات التي تتعقّب الزائر
              </p>
              <div className="flex flex-wrap gap-2">
                {report.trackers.map(t => (
                  <Badge
                    key={t.company}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm font-normal"
                  >
                    {t.company}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 print:hidden">
        <Button onClick={onReset} variant="outline" className="gap-2 bg-card">
          <RotateCcw className="h-4 w-4" /> فحص موقع آخر
        </Button>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> طباعة / حفظ كـ PDF
        </Button>
      </div>

      <p className="pb-4 text-center text-xs leading-relaxed text-muted-foreground">
        هذا الفحص استرشادي ويعتمد على تحليل صفحة الموقع وملفاته الظاهرة، وقد لا
        يكتشف أدوات التتبع التي تُحمّل لاحقاً. النتيجة لا تُعدّ استشارة قانونية.
      </p>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
  hint,
  danger,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  hint: string;
  danger?: boolean;
}) {
  return (
    <Card className="p-5">
      <div
        className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
          danger
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="mt-1 font-semibold">{label}</div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </Card>
  );
}
