import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [sites, recentScans] = await Promise.all([
    prisma.scan.count(),
    prisma.scan.count({
      where: { startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return NextResponse.json({
    totalScans: sites,
    recentScans,
    queueStatus: { queued: 0, running: 0 },
  });
}
