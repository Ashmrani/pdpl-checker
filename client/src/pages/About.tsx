import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import {
  ShieldCheck,
  FileText,
  Bell,
  Minimize2,
  UserCheck,
  Lock,
  Search,
} from "lucide-react";

const PRINCIPLES = [
  {
    icon: Bell,
    title: "الموافقة قبل التتبع",
    text: "يجب على الموقع الحصول على موافقتك الواضحة قبل تشغيل أدوات التتبع غير الضرورية، وعادة يكون ذلك عبر بانر للكوكيز يتيح لك القبول أو الرفض.",
  },
  {
    icon: FileText,
    title: "سياسة خصوصية واضحة",
    text: "يلزم النظام الجهات بنشر سياسة خصوصية مكتوبة بلغة مفهومة، توضّح ما هي البيانات التي تُجمع، ولأي غرض، ومع من تُشارك.",
  },
  {
    icon: Minimize2,
    title: "تقليل جمع البيانات",
    text: "ينبغي ألا يجمع الموقع سوى الحد الأدنى من البيانات اللازمة لتقديم الخدمة، دون إفراط أو جمع لبيانات لا حاجة لها.",
  },
  {
    icon: UserCheck,
    title: "عدم فرض الموافقة",
    text: "من حقك استخدام الموقع حتى لو رفضت ملفات التتبع غير الأساسية، فلا يجوز إجبارك على القبول مقابل الوصول للخدمة.",
  },
  {
    icon: Lock,
    title: "حماية وتأمين البيانات",
    text: "يتطلب النظام اتخاذ تدابير تقنية وتنظيمية لحماية البيانات، ومنها تشفير الاتصال عبر HTTPS وتأمين البيانات عند مشاركتها.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border/60 bg-grid">
        <div className="container py-14 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">
            نظام حماية البيانات الشخصية السعودي (PDPL)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            هو أول نظام شامل في المملكة العربية السعودية ينظّم معالجة البيانات
            الشخصية، ويهدف إلى حماية خصوصية الأفراد وضمان تعامل المواقع والشركات
            مع بياناتهم بشكل عادل وآمن ومشروع.
          </p>
        </div>
      </section>

      <section className="container max-w-4xl py-14">
        <h2 className="text-2xl font-bold">المبادئ التي نفحصها</h2>
        <p className="mt-2 text-muted-foreground">
          تعتمد أداتنا على المبادئ الأساسية للنظام لتقييم المواقع بشكل مبسّط:
        </p>

        <div className="mt-8 space-y-4">
          {PRINCIPLES.map(p => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">
                    {p.text}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-10 bg-primary/5 p-7 text-center">
          <h3 className="text-xl font-bold">جاهز لفحص موقع؟</h3>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            احصل على تقرير مبسّط خلال ثوانٍ يوضّح مدى احترام الموقع لخصوصيتك.
          </p>
          <Link href="/">
            <Button className="mt-5 gap-2">
              <Search className="h-4 w-4" /> ابدأ الفحص الآن
            </Button>
          </Link>
        </Card>

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          المعلومات هنا لأغراض التوعية فقط ولا تُعدّ استشارة قانونية. للاطلاع على
          النص الرسمي يُرجى الرجوع إلى الهيئة السعودية للبيانات والذكاء الاصطناعي
          (سدايا).
        </p>
      </section>
    </div>
  );
}
