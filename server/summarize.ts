import { invokeLLM } from "./_core/llm";
import type { ScanReport } from "./scanner";

/**
 * Generates a short, friendly Arabic summary for a non-technical audience
 * explaining the scan result and PDPL compliance. Falls back to a deterministic
 * template if the LLM call fails.
 */
export async function generateSummary(report: ScanReport): Promise<string> {
  const statusAr =
    report.pdplStatus === "compliant"
      ? "ملتزم"
      : report.pdplStatus === "needs_improvement"
        ? "يحتاج تحسين"
        : "غير ملتزم";

  const fallback = buildFallback(report, statusAr);

  if (!report.fetchedOk) {
    return fallback;
  }

  try {
    const passed = report.pdplChecks.filter(c => c.passed).map(c => c.label);
    const failed = report.pdplChecks.filter(c => !c.passed).map(c => c.label);
    const topCompanies = report.trackers.slice(0, 6).map(t => t.company);

    const res = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "أنت مساعد متخصص في الخصوصية الرقمية وتشرح لغير التقنيين بلغة عربية بسيطة وودودة. اكتب فقرة قصيرة (3-4 جمل) بدون مقدمات أو عناوين. لا تستخدم مصطلحات تقنية معقدة. كن صادقاً وواضحاً.",
        },
        {
          role: "user",
          content: `لخّص نتيجة فحص خصوصية الموقع التالي لمستخدم عادي غير تقني:

الموقع: ${report.hostname}
التقييم العام: ${report.grade} (${report.score} من 100)
حالة الالتزام بنظام حماية البيانات السعودي PDPL: ${statusAr}
عدد ملفات الكوكيز: ${report.cookieCount}
عدد أدوات التتبع: ${report.trackerCount}
أبرز الشركات التي تتعقّب الزائر: ${topCompanies.length ? topCompanies.join("، ") : "لا يوجد"}
النقاط التي اجتازها الموقع: ${passed.length ? passed.join("، ") : "لا يوجد"}
النقاط التي أخفق فيها: ${failed.length ? failed.join("، ") : "لا يوجد"}

اكتب ملخصاً بسيطاً يوضح: هل هذا الموقع يحترم خصوصيتي؟ وماذا يعني ذلك لي كزائر؟ وإن كان هناك مشاكل، اذكرها بلطف.`,
        },
      ],
      maxTokens: 400,
    });

    const content = res.choices?.[0]?.message?.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .map(p => (p.type === "text" ? p.text : ""))
              .join(" ")
              .trim()
          : "";
    return text.trim() || fallback;
  } catch (err) {
    console.warn("[summarize] LLM failed, using fallback:", err);
    return fallback;
  }
}

function buildFallback(report: ScanReport, statusAr: string): string {
  if (!report.fetchedOk) {
    return `تعذّر فحص الموقع ${report.hostname}. قد يكون الموقع غير متاح، أو يمنع الفحص الآلي، أو أن الرابط غير صحيح. حاول التأكد من الرابط والمحاولة مرة أخرى.`;
  }
  const trackerPart =
    report.trackerCount === 0
      ? "ولم يتم رصد أدوات تتبع معروفة"
      : `ورصدنا ${report.trackerCount} من أدوات التتبع`;
  return `حصل موقع ${report.hostname} على تقييم ${report.grade} فيما يخص الخصوصية، وحالته بالنسبة لنظام حماية البيانات الشخصية السعودي هي: ${statusAr}. يستخدم الموقع ${report.cookieCount} من ملفات الكوكيز ${trackerPart}. ${report.hasConsentBanner ? "ويبدو أنه يطلب موافقتك قبل التتبع." : "ولم نلاحظ طلب موافقتك بوضوح قبل التتبع."}`;
}
