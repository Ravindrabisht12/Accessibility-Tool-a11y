"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { getQueue } from "@/scanner/scanner-queue";

// ── Manual Scan ───────────────────────────────────────────────────────────────
const manualScanSchema = z.object({
  url: z.url("Must be a valid URL"),
  wcagLevel: z.enum(["A", "AA", "AAA"]).default("AA"),
});

export const triggerManualScan = actionClient
  .metadata({ actionName: "triggerManualScan" })
  .schema(manualScanSchema)
  .action(async ({ parsedInput }) => {
    const queue = await getQueue();

    // Run in background — don't await so action returns scan ID immediately
    const scanPromise = queue.addScan(parsedInput.url, {
      scanType: "MANUAL",
      wcagLevel: parsedInput.wcagLevel,
    });

    // Get the pending scan ID from DB (was created in AxeScanner.scanUrl)
    // We wait a tick for the scan record to be created
    await new Promise((r) => setTimeout(r, 200));
    const pendingScan = await prisma.scan.findFirst({
      where: { fullUrl: parsedInput.url, status: "RUNNING" },
      orderBy: { startedAt: "desc" },
    });

    // Don't block — let the scan continue in background
    scanPromise.catch((err: unknown) => {
      console.error("Background scan error:", err);
    });

    revalidatePath("/scans");
    return { scanId: pendingScan?.id ?? null };
  });

// ── Scan a full site ──────────────────────────────────────────────────────────
const scanSiteSchema = z.object({ siteId: z.string() });

export const triggerSiteScan = actionClient
  .metadata({ actionName: "triggerSiteScan" })
  .schema(scanSiteSchema)
  .action(async ({ parsedInput }) => {
    const site = await prisma.site.findUniqueOrThrow({
      where: { id: parsedInput.siteId },
      include: { pages: true },
    });

    const queue = await getQueue();
    const scanIds: string[] = [];

    for (const page of site.pages) {
      const fullUrl = `${site.url.replace(/\/$/, "")}${page.path}`;
      // Fire and forget — each scan writes to DB on its own
      const scanPromise = queue.addScan(fullUrl, {
        siteId: site.id,
        pagePath: page.path,
        scanType: "SITE",
      });
      scanPromise.catch((err: unknown) => console.error("Scan error:", err));
    }

    revalidatePath("/scans");
    return { siteId: site.id, siteName: site.name, totalPages: site.pages.length };
  });

// ── Delete Scan ───────────────────────────────────────────────────────────────
const deleteScanSchema = z.object({ scanId: z.string() });

export const deleteScan = actionClient
  .metadata({ actionName: "deleteScan" })
  .schema(deleteScanSchema)
  .action(async ({ parsedInput }) => {
    await prisma.scan.delete({ where: { id: parsedInput.scanId } });
    revalidatePath("/scans");
    return { success: true };
  });

// ── Dashboard stats (server-safe data loader) ─────────────────────────────────
export async function getDashboardStats() {
  const [totalSites, totalScans, recentScans, criticalCount, seriousCount, moderateCount, minorCount, latestScan] =
    await Promise.all([
      prisma.site.count(),
      prisma.scan.count(),
      prisma.scan.count({
        where: { startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.scan.aggregate({ _sum: { criticalCount: true } }),
      prisma.scan.aggregate({ _sum: { seriousCount: true } }),
      prisma.scan.aggregate({ _sum: { moderateCount: true } }),
      prisma.scan.aggregate({ _sum: { minorCount: true } }),
      prisma.scan.findFirst({
        orderBy: { startedAt: "desc" },
        where: { status: "COMPLETED" },
        include: { site: true },
      }),
    ]);

  return {
    totalSites,
    totalScans,
    recentScans,
    violations: {
      critical: criticalCount._sum.criticalCount ?? 0,
      serious: seriousCount._sum.seriousCount ?? 0,
      moderate: moderateCount._sum.moderateCount ?? 0,
      minor: minorCount._sum.minorCount ?? 0,
    },
    latestScan,
  };
}
