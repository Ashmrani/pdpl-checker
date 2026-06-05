/**
 * Known tracker domain database.
 * Each entry maps a domain substring to a company + category.
 * Categories: advertising, analytics, social, tagmanager, fingerprinting, session_replay, essential
 */

export type TrackerCategory =
  | "advertising"
  | "analytics"
  | "social"
  | "tagmanager"
  | "fingerprinting"
  | "session_replay";

export interface TrackerDef {
  match: string; // substring to look for in script src / domain
  company: string;
  category: TrackerCategory;
}

export const TRACKER_DB: TrackerDef[] = [
  // Google / Alphabet
  { match: "google-analytics.com", company: "Google Analytics", category: "analytics" },
  { match: "googletagmanager.com", company: "Google Tag Manager", category: "tagmanager" },
  { match: "gtag/js", company: "Google Analytics (gtag)", category: "analytics" },
  { match: "doubleclick.net", company: "Google DoubleClick", category: "advertising" },
  { match: "googlesyndication.com", company: "Google AdSense", category: "advertising" },
  { match: "googleadservices.com", company: "Google Ads", category: "advertising" },
  { match: "google.com/ads", company: "Google Ads", category: "advertising" },
  { match: "g.doubleclick", company: "Google DoubleClick", category: "advertising" },

  // Meta / Facebook
  { match: "connect.facebook.net", company: "Meta (Facebook) Pixel", category: "advertising" },
  { match: "facebook.com/tr", company: "Meta (Facebook) Pixel", category: "advertising" },
  { match: "fbevents.js", company: "Meta (Facebook) Pixel", category: "advertising" },

  // TikTok
  { match: "analytics.tiktok.com", company: "TikTok Pixel", category: "advertising" },
  { match: "tiktok.com/i18n/pixel", company: "TikTok Pixel", category: "advertising" },

  // Snapchat
  { match: "sc-static.net", company: "Snapchat Pixel", category: "advertising" },
  { match: "tr.snapchat.com", company: "Snapchat Pixel", category: "advertising" },

  // X / Twitter
  { match: "static.ads-twitter.com", company: "X (Twitter) Ads", category: "advertising" },
  { match: "analytics.twitter.com", company: "X (Twitter) Analytics", category: "analytics" },
  { match: "platform.twitter.com", company: "X (Twitter) Widgets", category: "social" },

  // LinkedIn
  { match: "snap.licdn.com", company: "LinkedIn Insight", category: "advertising" },
  { match: "px.ads.linkedin.com", company: "LinkedIn Ads", category: "advertising" },

  // Microsoft
  { match: "bat.bing.com", company: "Microsoft Bing Ads", category: "advertising" },
  { match: "clarity.ms", company: "Microsoft Clarity", category: "session_replay" },

  // Amazon
  { match: "amazon-adsystem.com", company: "Amazon Ads", category: "advertising" },

  // Analytics platforms
  { match: "hotjar.com", company: "Hotjar", category: "session_replay" },
  { match: "static.hotjar.com", company: "Hotjar", category: "session_replay" },
  { match: "mixpanel.com", company: "Mixpanel", category: "analytics" },
  { match: "cdn.segment.com", company: "Segment", category: "analytics" },
  { match: "segment.io", company: "Segment", category: "analytics" },
  { match: "fullstory.com", company: "FullStory", category: "session_replay" },
  { match: "mouseflow.com", company: "Mouseflow", category: "session_replay" },
  { match: "logrocket", company: "LogRocket", category: "session_replay" },
  { match: "amplitude.com", company: "Amplitude", category: "analytics" },
  { match: "matomo", company: "Matomo", category: "analytics" },
  { match: "plausible.io", company: "Plausible", category: "analytics" },
  { match: "heap.io", company: "Heap Analytics", category: "analytics" },
  { match: "heapanalytics.com", company: "Heap Analytics", category: "analytics" },
  { match: "quantserve.com", company: "Quantcast", category: "advertising" },
  { match: "scorecardresearch.com", company: "Comscore", category: "analytics" },
  { match: "yandex.ru/metrika", company: "Yandex Metrica", category: "analytics" },
  { match: "mc.yandex.ru", company: "Yandex Metrica", category: "analytics" },

  // Ad networks / DMP
  { match: "criteo.com", company: "Criteo", category: "advertising" },
  { match: "criteo.net", company: "Criteo", category: "advertising" },
  { match: "taboola.com", company: "Taboola", category: "advertising" },
  { match: "outbrain.com", company: "Outbrain", category: "advertising" },
  { match: "adroll.com", company: "AdRoll", category: "advertising" },
  { match: "pubmatic.com", company: "PubMatic", category: "advertising" },
  { match: "rubiconproject.com", company: "Magnite (Rubicon)", category: "advertising" },
  { match: "casalemedia.com", company: "Index Exchange", category: "advertising" },
  { match: "adnxs.com", company: "AppNexus (Xandr)", category: "advertising" },
  { match: "openx.net", company: "OpenX", category: "advertising" },
  { match: "bidswitch.net", company: "BidSwitch", category: "advertising" },

  // Customer messaging / CDP that track
  { match: "intercom.io", company: "Intercom", category: "analytics" },
  { match: "intercomcdn.com", company: "Intercom", category: "analytics" },
  { match: "js.driftt.com", company: "Drift", category: "analytics" },
  { match: "cdn.optimizely.com", company: "Optimizely", category: "analytics" },
  { match: "crazyegg.com", company: "Crazy Egg", category: "session_replay" },

  // Pinterest
  { match: "pintrk", company: "Pinterest Tag", category: "advertising" },
  { match: "ct.pinterest.com", company: "Pinterest Tag", category: "advertising" },
];

/**
 * Cookie consent banner / CMP signatures to detect consent mechanisms.
 */
export const CONSENT_SIGNATURES: string[] = [
  "cookieconsent",
  "cookie-consent",
  "cookiebanner",
  "cookie-banner",
  "cookiebot",
  "onetrust",
  "optanon",
  "trustarc",
  "truste",
  "usercentrics",
  "cookieyes",
  "termly",
  "didomi",
  "quantcast choice",
  "cmpbox",
  "gdpr",
  "iubenda",
  "klaro",
  "tarteaucitron",
  "borlabs-cookie",
  "moove_gdpr",
  "complianz",
  "نهتم بخصوصيتك",
  "ملفات تعريف الارتباط",
  "ملفات الارتباط",
  "الكوكيز",
  "نستخدم ملفات",
  "we use cookies",
  "this site uses cookies",
  "this website uses cookies",
  "accept cookies",
  "accept all cookies",
  "manage cookies",
  "cookie settings",
  "cookie preferences",
  "your privacy",
];

/**
 * Privacy policy link signatures.
 */
export const PRIVACY_SIGNATURES: string[] = [
  "privacy policy",
  "privacy-policy",
  "privacypolicy",
  "/privacy",
  "سياسة الخصوصية",
  "الخصوصية",
  "حماية البيانات",
  "data protection",
];

export const CATEGORY_LABELS_AR: Record<TrackerCategory, string> = {
  advertising: "إعلانات",
  analytics: "تحليلات",
  social: "شبكات اجتماعية",
  tagmanager: "مدير وسوم",
  fingerprinting: "بصمة الجهاز",
  session_replay: "تسجيل الجلسات",
};
