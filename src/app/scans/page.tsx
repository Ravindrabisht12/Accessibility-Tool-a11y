import { prisma } from "@/lib/prisma";
import { ScansTable } from "@/components/scans/scans-table";

export const dynamic = "force-dynamic";

async function getScans() {
  return prisma.scan.findMany({
    orderBy: { startedAt: "desc" },
    take: 500,
    include: { site: true },
  });
}

export default async function ScansPage() {
  const scans = await getScans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scan History</h1>
        <p className="text-muted-foreground">All accessibility scans across your sites</p>
      </div>
      <ScansTable scans={scans} />
    </div>
  );
}
