import { describe, expect, it, vi, afterEach } from "vitest";
import { scanWebsite } from "./scanner";

// Helper to build a fake Response with controllable html + set-cookie headers.
function mockFetchResponse(opts: {
  html: string;
  setCookies?: string[];
  url?: string;
  ok?: boolean;
}) {
  const { html, setCookies = [], url = "https://example.com/", ok = true } = opts;

  const encoder = new TextEncoder();
  const bytes = encoder.encode(html);
  let sent = false;

  const body = {
    getReader() {
      return {
        async read() {
          if (sent) return { done: true, value: undefined };
          sent = true;
          return { done: false, value: bytes };
        },
        async cancel() {},
      };
    },
  };

  const headers = {
    get(name: string) {
      if (name.toLowerCase() === "set-cookie") {
        return setCookies.length ? setCookies[0] : null;
      }
      return null;
    },
    getSetCookie() {
      return setCookies;
    },
  };

  return {
    ok,
    status: ok ? 200 : 500,
    url,
    headers,
    body,
  } as unknown as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("scanWebsite", () => {
  it("detects known trackers in HTML", async () => {
    const html = `
      <html><head>
      <script src="https://www.googletagmanager.com/gtag/js?id=GA-XXX"></script>
      <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
      </head><body>hello</body></html>`;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse({ html })
    );

    const report = await scanWebsite("example.com");
    const companies = report.trackers.map(t => t.company);
    expect(companies).toContain("Google Tag Manager");
    expect(companies.some(c => c.includes("Meta"))).toBe(true);
    expect(report.trackerCount).toBeGreaterThanOrEqual(2);
  });

  it("detects cookies from set-cookie headers and marks third-party", async () => {
    const html = "<html><body>x</body></html>";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse({
        html,
        setCookies: [
          "session=abc; Path=/; HttpOnly",
          "_ga=GA1.2; Domain=.tracker.net; Path=/",
        ],
      })
    );

    const report = await scanWebsite("https://example.com");
    expect(report.cookieCount).toBe(2);
    const thirdParty = report.cookies.find(c => c.name === "_ga");
    expect(thirdParty?.thirdParty).toBe(true);
    const firstParty = report.cookies.find(c => c.name === "session");
    expect(firstParty?.thirdParty).toBe(false);
  });

  it("detects consent banner and privacy policy signatures", async () => {
    const html = `
      <html><body>
      <a href="/privacy-policy">Privacy Policy</a>
      <div class="cookieconsent">We use cookies</div>
      </body></html>`;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse({ html })
    );

    const report = await scanWebsite("example.com");
    expect(report.hasPrivacyPolicy).toBe(true);
    expect(report.hasConsentBanner).toBe(true);
  });

  it("gives a high score and compliant status to a clean privacy-friendly site", async () => {
    const html = `
      <html><body>
      <a href="/privacy">سياسة الخصوصية</a>
      <div class="cookiebanner">نستخدم ملفات تعريف الارتباط</div>
      </body></html>`;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse({ html })
    );

    const report = await scanWebsite("https://clean-site.com");
    expect(report.score).toBeGreaterThanOrEqual(75);
    expect(report.pdplStatus).toBe("compliant");
    expect(["A", "B"]).toContain(report.grade);
  });

  it("gives a poor score to a tracker-heavy site with no consent", async () => {
    const html = `
      <html><head>
      <script src="https://www.google-analytics.com/analytics.js"></script>
      <script src="https://connect.facebook.net/fbevents.js"></script>
      <script src="https://analytics.tiktok.com/i18n/pixel"></script>
      <script src="https://static.ads-twitter.com/uwt.js"></script>
      <script src="https://criteo.com/js"></script>
      <script src="https://taboola.com/loader.js"></script>
      </head><body>no policy here</body></html>`;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse({ html })
    );

    const report = await scanWebsite("https://tracker-heavy.com");
    expect(report.trackerCount).toBeGreaterThanOrEqual(5);
    expect(report.score).toBeLessThan(60);
    expect(report.pdplStatus).not.toBe("compliant");
  });

  it("handles fetch failure gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const report = await scanWebsite("https://unreachable.test");
    expect(report.fetchedOk).toBe(false);
    expect(report.grade).toBe("F");
    expect(report.pdplStatus).toBe("non_compliant");
  });

  it("normalizes a bare hostname into a full url", async () => {
    const html = "<html></html>";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse({ html })
    );

    const report = await scanWebsite("example.com");
    expect(report.url).toBe("https://example.com/");
    expect(report.hostname).toBe("example.com");
    expect(report.usesHttps).toBe(true);
  });
});
