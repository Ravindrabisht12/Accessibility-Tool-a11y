import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ViolationsTable } from "@/components/scans/violations-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDuration, IMPACT_COLORS } from "@/lib/utils";
import { ArrowLeft, Download, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getScan(id: string) {
  return prisma.scan.findUnique({
    where: { id },
    include: { violations: true, site: true },
  });
}

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await getScan(id);

  if (!scan) notFound();

  const impactCounts = {
    critical: scan.criticalCount,
    serious: scan.seriousCount,
    moderate: scan.moderateCount,
    minor: scan.minorCount,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/scans">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold truncate">{scan.fullUrl}</h1>
          <p className="text-sm text-muted-foreground">
            {scan.site?.name ?? "Manual scan"} · {formatDate(scan.startedAt)}
            {scan.durationMs ? ` · ${formatDuration(scan.durationMs)}` : ""}
          </p>
        </div>
        {scan.status === "COMPLETED" && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/reports/export?scanId=${scan.id}&format=csv`} download>
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["critical", "serious", "moderate", "minor"] as const).map((impact) => (
          <Card key={impact}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground capitalize">{impact}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  impact === "critical" ? "text-red-600" :
                  impact === "serious" ? "text-orange-500" :
                  impact === "moderate" ? "text-yellow-600" : "text-blue-500",
                )}
              >
                {impactCounts[impact]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Violations ({scan.totalViolations})</CardTitle>
          <div className="flex items-center gap-2">
            {scan.status === "COMPLETED" && scan.totalViolations === 0 && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> No violations
              </span>
            )}
            {scan.status === "FAILED" && (
              <span className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {scan.errorMessage}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ViolationsTable violations={scan.violations} />
        </CardContent>
      </Card>
    </div>
  );
}
