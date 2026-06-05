/**
 * Website privacy scanner engine.
 * Fetches a target URL server-side, analyzes HTML + HTTP headers to detect
 * cookies, third-party trackers, consent banners, and privacy policies.
 * Then evaluates PDPL compliance heuristically.
 */

import {
  TRACKER_DB,
  CONSENT_SIGNATURES,
  PRIVACY_SIGNATURES,
  type TrackerCategory,
} from "./trackers";

export interface DetectedTracker {
  company: string;
  category: TrackerCategory;
  domain: string;
}

export interface DetectedCookie {
  name: string;
  thirdParty: boolean;
}

export type PdplStatus = "compliant" | "needs_improvement" | "non_compliant";

export interface PdplCheck {
  id: string;
  label: string; // Arabic label
  passed: boolean;
  explanation: string; // simple Arabic explanation
}

export interface ScanReport {
  url: string;
  hostname: string;
  finalUrl: string;
  fetchedOk: boolean;
  errorMessage?: string;
  score: number; // 0-100
  grade: string; // A-F
  cookieCount: number;
  trackerCount: number;
  pdplStatus: PdplStatus;
  cookies: DetectedCookie[];
  trackers: DetectedTracker[];
  trackersByCategory: Record<string, number>;
  pdplChecks: PdplCheck[];
  hasPrivacyPolicy: boolean;
  hasConsentBanner: boolean;
  usesHttps: boolean;
  summary: string; // AI-generated simple Arabic summary
  scannedAt: number;
}

const FETCH_TIMEOUT_MS = 12000;
const MAX_HTML_BYTES = 3_000_000; // 3MB cap

function normalizeUrl(input: string): { url: string; hostname: string } {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) {
    raw = "https://" + raw;
  }
  const u = new URL(raw);
  return { url: u.toString(), hostname: u.hostname };
}

function getRootDomain(hostname: string): string {
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
}

interface FetchResult {
  html: string;
  setCookieHeaders: string[];
  finalUrl: string;
  ok: boolean;
  error?: string;
}

async function fetchTarget(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 PDPLChecker/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ar,en;q=0.9",
      },
    });

    // Collect set-cookie headers (Node fetch exposes getSetCookie on Headers)
    let setCookieHeaders: string[] = [];
    const anyHeaders = res.headers as unknown as {
      getSetCookie?: () => string[];
    };
    if (typeof anyHeaders.getSetCookie === "function") {
      setCookieHeaders = anyHeaders.getSetCookie();
    } else {
      const single = res.headers.get("set-cookie");
      if (single) setCookieHeaders = [single];
    }

    // Read body with size cap
    const reader = res.body?.getReader();
    let received = 0;
    const chunks: Uint8Array[] = [];
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          received += value.length;
          chunks.push(value);
          if (received > MAX_HTML_BYTES) {
            try {
              await reader.cancel();
            } catch {
              /* noop */
            }
            break;
          }
        }
      }
    }
    const buf = Buffer.concat(chunks.map(c => Buffer.from(c)));
    const html = buf.toString("utf-8");

    return {
      html,
      setCookieHeaders,
      finalUrl: res.url || url,
      ok: res.ok || (res.status >= 200 && res.status < 400),
    };
  } catch (err) {
    return {
      html: "",
      setCookieHeaders: [],
      finalUrl: url,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function detectTrackers(
  html: string,
  rootDomain: string
): DetectedTracker[] {
  const lower = html.toLowerCase();
  const found = new Map<string, DetectedTracker>();
  for (const def of TRACKER_DB) {
    if (lower.includes(def.match.toLowerCase())) {
      // Key by company to dedupe
      if (!found.has(def.company)) {
        found.set(def.company, {
          company: def.company,
          category: def.category,
          domain: def.match,
        });
      }
    }
  }
  return Array.from(found.values());
}

function detectHeaderCookies(
  setCookieHeaders: string[],
  rootDomain: string
): DetectedCookie[] {
  const cookies: DetectedCookie[] = [];
  for (const header of setCookieHeaders) {
    // A single header line may technically contain one cookie
    const namePart = header.split(";")[0];
    const eqIdx = namePart.indexOf("=");
    const name = eqIdx >= 0 ? namePart.slice(0, eqIdx).trim() : namePart.trim();
    if (!name) continue;
    // Detect domain attribute for third-party determination
    const domainMatch = header.match(/domain=([^;]+)/i);
    let thirdParty = false;
    if (domainMatch) {
      const cookieDomain = domainMatch[1].trim().replace(/^\./, "");
      thirdParty = !cookieDomain.endsWith(rootDomain);
    }
    cookies.push({ name, thirdParty });
  }
  return cookies;
}

function detectSignature(html: string, signatures: string[]): boolean {
  const lower = html.toLowerCase();
  return signatures.some(sig => lower.includes(sig.toLowerCase()));
}

function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  if (score >= 30) return "E";
  return "F";
}

/**
 * Builds the PDPL compliance checks based on detected signals.
 */
function buildPdplChecks(opts: {
  hasPrivacyPolicy: boolean;
  hasConsentBanner: boolean;
  trackers: DetectedTracker[];
  cookies: DetectedCookie[];
  usesHttps: boolean;
}): PdplCheck[] {
  const advertisingTrackers = opts.trackers.filter(
    t => t.category === "advertising"
  ).length;
  const thirdPartyCookies = opts.cookies.filter(c => c.thirdParty).length;

  const checks: PdplCheck[] = [
    {
      id: "privacy_policy",
      label: "وجود سياسة خصوصية واضحة",
      passed: opts.hasPrivacyPolicy,
      explanation:
        "يُلزم نظام حماية البيانات الشخصية (PDPL) الجهات بنشر سياسة خصوصية واضحة توضّح ما هي البيانات التي تُجمع ولماذا.",
    },
    {
      id: "consent_banner",
      label: "طلب الموافقة قبل التتبع (بانر الكوكيز)",
      passed: opts.hasConsentBanner,
      explanation:
        "يجب الحصول على موافقة المستخدم قبل تشغيل أدوات التتبع غير الضرورية، عبر إشعار أو بانر للكوكيز.",
    },
    {
      id: "data_minimization",
      label: "تقليل جمع البيانات (أدوات تتبع محدودة)",
      // Heuristic: pass if few advertising trackers
      passed: advertisingTrackers <= 2,
      explanation:
        "يقتضي مبدأ تقليل البيانات أن يجمع الموقع الحد الأدنى الضروري فقط. كثرة أدوات الإعلانات تدل على جمع بيانات أكثر من اللازم.",
    },
    {
      id: "no_forced_consent",
      label: "عدم فرض الموافقة (تتبع معتدل)",
      // Heuristic: pass if it has a banner OR has very few trackers
      passed: opts.hasConsentBanner || opts.trackers.length <= 1,
      explanation:
        "يجب أن يتمكّن المستخدم من تصفّح الموقع حتى لو رفض ملفات التتبع غير الأساسية، دون إجباره على القبول.",
    },
    {
      id: "secure_connection",
      label: "اتصال آمن ومشفّر (HTTPS)",
      passed: opts.usesHttps,
      explanation:
        "يتطلب النظام اتخاذ تدابير تقنية لحماية البيانات، ومنها تشفير الاتصال عبر HTTPS.",
    },
  ];
  return checks;
}

function computeScore(checks: PdplCheck[], trackerCount: number): number {
  // Base: each passed check worth weight
  const weights: Record<string, number> = {
    privacy_policy: 18,
    consent_banner: 26,
    data_minimization: 18,
    no_forced_consent: 20,
    secure_connection: 8,
  };
  let score = 0;
  for (const c of checks) {
    if (c.passed) score += weights[c.id] ?? 0;
  }
  // Remaining 10 points: tracker penalty band
  let trackerScore = 10;
  if (trackerCount > 10) trackerScore = 0;
  else if (trackerCount > 6) trackerScore = 3;
  else if (trackerCount > 3) trackerScore = 6;
  score += trackerScore;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function pdplStatusFromScore(score: number): PdplStatus {
  if (score >= 75) return "compliant";
  if (score >= 45) return "needs_improvement";
  return "non_compliant";
}

/**
 * Main scan function. Returns a full report (without AI summary; summary is
 * attached separately by the caller to keep this function testable & pure-ish).
 */
export async function scanWebsite(input: string): Promise<ScanReport> {
  const { url, hostname } = normalizeUrl(input);
  const rootDomain = getRootDomain(hostname);
  const fetched = await fetchTarget(url);
  const usesHttps = url.toLowerCase().startsWith("https://");

  if (!fetched.ok && !fetched.html) {
    // Fetch failed entirely
    const checks = buildPdplChecks({
      hasPrivacyPolicy: false,
      hasConsentBanner: false,
      trackers: [],
      cookies: [],
      usesHttps,
    });
    return {
      url,
      hostname,
      finalUrl: fetched.finalUrl,
      fetchedOk: false,
      errorMessage: fetched.error || "تعذّر الوصول إلى الموقع",
      score: 0,
      grade: "F",
      cookieCount: 0,
      trackerCount: 0,
      pdplStatus: "non_compliant",
      cookies: [],
      trackers: [],
      trackersByCategory: {},
      pdplChecks: checks,
      hasPrivacyPolicy: false,
      hasConsentBanner: false,
      usesHttps,
      summary: "",
      scannedAt: Date.now(),
    };
  }

  const trackers = detectTrackers(fetched.html, rootDomain);
  const cookies = detectHeaderCookies(fetched.setCookieHeaders, rootDomain);
  const hasPrivacyPolicy = detectSignature(fetched.html, PRIVACY_SIGNATURES);
  const hasConsentBanner = detectSignature(fetched.html, CONSENT_SIGNATURES);

  const trackersByCategory: Record<string, number> = {};
  for (const t of trackers) {
    trackersByCategory[t.category] = (trackersByCategory[t.category] ?? 0) + 1;
  }

  const checks = buildPdplChecks({
    hasPrivacyPolicy,
    hasConsentBanner,
    trackers,
    cookies,
    usesHttps,
  });

  const score = computeScore(checks, trackers.length);
  const grade = gradeFromScore(score);
  const pdplStatus = pdplStatusFromScore(score);

  return {
    url,
    hostname,
    finalUrl: fetched.finalUrl,
    fetchedOk: true,
    score,
    grade,
    cookieCount: cookies.length,
    trackerCount: trackers.length,
    pdplStatus,
    cookies,
    trackers,
    trackersByCategory,
    pdplChecks: checks,
    hasPrivacyPolicy,
    hasConsentBanner,
    usesHttps,
    summary: "",
    scannedAt: Date.now(),
  };
}
