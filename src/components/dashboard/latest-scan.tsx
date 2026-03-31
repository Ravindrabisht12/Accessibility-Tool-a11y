import Link from "next/link";
import type { ScanWithSite } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration } from "@/lib/utils";
import { AlertCircle, CheckCircle, Loader, Clock } from "lucide-react";

const STATUS_ICON: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
  FAILED: <AlertCircle className="h-4 w-4 text-red-500" />,
  RUNNING: <Loader className="h-4 w-4 text-blue-500 animate-spin" />,
  QUEUED: <Clock className="h-4 w-4 text-yellow-500" />,
};

export function LatestScanCard({ scan }: { scan: ScanWithSite | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Scan</CardTitle>
      </CardHeader>
      <CardContent>
        {!scan ? (
          <p className="text-sm text-muted-foreground">No scans yet. Run your first scan to get started.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {STATUS_ICON[scan.status]}
              <span className="font-medium text-sm">{scan.site?.name ?? "Manual Scan"}</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{scan.fullUrl}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-muted-foreground">{formatDate(scan.startedAt)}</span>
              {scan.durationMs && (
                <span className="text-muted-foreground">· {formatDuration(scan.durationMs)}</span>
              )}
            </div>
            {scan.status === "COMPLETED" && (
              <div className="flex items-center gap-2">
                <Badge variant={scan.totalViolations > 0 ? "destructive" : "secondary"}>
                  {scan.totalViolations} violations
                </Badge>
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/scans/${scan.id}`}>View Details</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
