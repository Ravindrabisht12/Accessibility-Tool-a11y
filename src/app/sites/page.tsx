import { prisma } from "@/lib/prisma";
import type { SiteWithPageCount } from "@/types";
import { AddSiteDialog } from "@/components/sites/add-site-dialog";
import { SiteCard } from "@/components/sites/site-card";

export const dynamic = "force-dynamic";

async function getSites() {
  return prisma.site.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { pages: true } } },
  });
}

export default async function SitesPage() {
  const sites = await getSites();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground">Manage the websites you monitor</p>
        </div>
        <AddSiteDialog />
      </div>

      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
          <p className="text-lg font-medium">No sites yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first site to start monitoring accessibility</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site: SiteWithPageCount) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
