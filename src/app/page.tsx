import { getDashboardStats } from "@/actions/scans";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ViolationsBreakdown } from "@/components/dashboard/violations-breakdown";
import { LatestScanCard } from "@/components/dashboard/latest-scan";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Accessibility monitoring overview</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <ViolationsBreakdown violations={stats.violations} />
        <LatestScanCard scan={stats.latestScan} />
      </div>
    </div>
  );
}
