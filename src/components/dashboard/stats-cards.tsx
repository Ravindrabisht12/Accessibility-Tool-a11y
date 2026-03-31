import type { DashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ScanSearch, Clock, AlertTriangle } from "lucide-react";

const STAT_CONFIG = [
  { key: "totalSites", label: "Total Sites", icon: Globe, color: "text-blue-500" },
  { key: "totalScans", label: "Total Scans", icon: ScanSearch, color: "text-purple-500" },
  { key: "recentScans", label: "Last 7 Days", icon: Clock, color: "text-green-500" },
] as const;

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const totalViolations =
    stats.violations.critical +
    stats.violations.serious +
    stats.violations.moderate +
    stats.violations.minor;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[key].toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Violations</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalViolations.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
