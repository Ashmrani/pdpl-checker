// Mirror of server ScanReport for frontend typing convenience.
export type TrackerCategory =
  | "advertising"
  | "analytics"
  | "social"
  | "tagmanager"
  | "fingerprinting"
  | "session_replay";

export type PdplStatus = "compliant" | "needs_improvement" | "non_compliant";

export interface DetectedTracker {
  company: string;
  category: TrackerCategory;
  domain: string;
}

export interface DetectedCookie {
  name: string;
  thirdParty: boolean;
}

export interface PdplCheck {
  id: string;
  label: string;
  passed: boolean;
  explanation: string;
}

export interface ScanReport {
  url: string;
  hostname: string;
  finalUrl: string;
  fetchedOk: boolean;
  errorMessage?: string;
  score: number;
  grade: string;
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
  summary: string;
  scannedAt: number;
}

export const CATEGORY_LABELS_AR: Record<TrackerCategory, string> = {
  advertising: "إعلانات",
  analytics: "تحليلات",
  social: "شبكات اجتماعية",
  tagmanager: "مدير وسوم",
  fingerprinting: "بصمة الجهاز",
  session_replay: "تسجيل الجلسات",
};

export const PDPL_STATUS_AR: Record<PdplStatus, string> = {
  compliant: "ملتزم",
  needs_improvement: "يحتاج تحسين",
  non_compliant: "غير ملتزم",
};
