import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports/export?scanId=xxx&format=csv|json
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get("scanId");
  const format = searchParams.get("format") ?? "json";

  if (!scanId) {
    return NextResponse.json({ error: "scanId is required" }, { status: 400 });
  }

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { violations: true, site: true },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  if (format === "csv") {
    const headers = ["Rule ID", "Impact", "Description", "Help URL", "Nodes"];
    const rows = scan.violations.map((v: { ruleId: string; impact: string; description: string; helpUrl: string; nodes: unknown }) => [
      v.ruleId,
      v.impact,
      `"${v.description.replace(/"/g, '""')}"`,
      v.helpUrl,
      `"${JSON.stringify(v.nodes).replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="a11y-report-${scanId}.csv"`,
      },
    });
  }

  return NextResponse.json(scan, {
    headers: {
      "Content-Disposition": `attachment; filename="a11y-report-${scanId}.json"`,
    },
  });
}
