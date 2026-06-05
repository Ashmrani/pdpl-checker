import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { scanWebsite, type ScanReport } from "../scanner";
import { generateSummary } from "../summarize";
import { insertScan, getRecentScans } from "../db";

export const scanRouter = router({
  /**
   * Runs a full privacy + PDPL scan for a given URL.
   */
  run: publicProcedure
    .input(
      z.object({
        url: z
          .string()
          .min(3, "الرجاء إدخال رابط صحيح")
          .max(2048),
      })
    )
    .mutation(async ({ input }): Promise<ScanReport> => {
      const report = await scanWebsite(input.url);
      report.summary = await generateSummary(report);

      // Persist (best-effort, do not block on failure)
      try {
        await insertScan({
          url: report.url,
          hostname: report.hostname,
          grade: report.grade,
          score: report.score,
          cookieCount: report.cookieCount,
          trackerCount: report.trackerCount,
          pdplStatus: report.pdplStatus,
          report: report as unknown as Record<string, unknown>,
        });
      } catch (err) {
        console.warn("[scan.run] failed to persist scan:", err);
      }

      return report;
    }),

  /**
   * Returns the most recent public scans for the homepage showcase.
   */
  recent: publicProcedure.query(async () => {
    const rows = await getRecentScans(8);
    return rows.map(r => ({
      id: r.id,
      hostname: r.hostname,
      grade: r.grade,
      score: r.score,
      cookieCount: r.cookieCount,
      trackerCount: r.trackerCount,
      pdplStatus: r.pdplStatus,
      createdAt: r.createdAt,
    }));
  }),
});
