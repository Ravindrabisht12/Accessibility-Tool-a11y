import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getQueue } from "@/scanner/scanner-queue";
import { sendScanReportEmail } from "@/lib/email";

// This route is triggered by a cron job or can be called manually
export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await prisma.site.findMany({
    where: { enabled: true },
    include: { pages: true },
  });

  if (sites.length === 0) {
    return NextResponse.json({ message: "No enabled sites to scan", scanned: 0 });
  }

  const queue = await getQueue();
  let totalScanned = 0;
  let totalViolations = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    sites.flatMap((site: { id: string; url: string; pages: Array<{ path: string }> }) =>
      site.pages.map((page: { path: string }) => {
        const url = `${site.url.replace(/\/$/, "")}${page.path}`;
        return queue.addScan(url, { siteId: site.id, pagePath: page.path, scanType: "SCHEDULED" });
      }),
    ),
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      totalScanned++;
      totalViolations += result.value.summary.total;
    } else {
      failed++;
    }
  }

  if (process.env.ENABLE_EMAIL === "true") {
    await sendScanReportEmail({
      subject: `[A11y Monitor] Scheduled Scan Report - ${new Date().toLocaleDateString()}`,
      results: { successful: totalScanned, totalSites: sites.length, failed, totalViolations },
    });
  }

  return NextResponse.json({ scanned: totalScanned, failed, totalViolations });
}
