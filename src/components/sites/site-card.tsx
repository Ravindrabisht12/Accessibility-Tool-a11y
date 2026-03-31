"use client";

import { useTransition } from "react";
import type { SiteWithPageCount } from "@/types";
import { deleteSite, discoverPages, toggleSite } from "@/actions/sites";
import { triggerSiteScan } from "@/actions/scans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Trash2, ScanSearch, Network, Power } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

export function SiteCard({ site }: { site: SiteWithPageCount }) {
  const { toast } = useToast();
  const router = useRouter();

  const { execute: execDelete, isPending: deleting } = useAction(deleteSite, {
    onSuccess() {
      toast({ title: `Deleted ${site.name}` });
      router.refresh();
    },
    onError({ error }) {
      toast({ title: "Delete failed", description: error.serverError, variant: "destructive" });
    },
  });

  const { execute: execScan, isPending: scanning } = useAction(triggerSiteScan, {
    onSuccess({ data }) {
      toast({ title: `Scanning ${data?.siteName} — ${data?.totalPages} pages queued` });
      router.push("/scans");
    },
    onError({ error }) {
      toast({ title: "Scan failed", description: error.serverError, variant: "destructive" });
    },
  });

  const { execute: execDiscover, isPending: discovering } = useAction(discoverPages, {
    onSuccess({ data }) {
      toast({ title: `Discovered ${data?.discovered} pages on ${site.name}` });
      router.refresh();
    },
    onError({ error }) {
      toast({ title: "Discovery failed", description: error.serverError, variant: "destructive" });
    },
  });

  const { execute: execToggle } = useAction(toggleSite, {
    onSuccess() { router.refresh(); },
  });

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold">{site.name}</h3>
          <p className="text-sm text-muted-foreground truncate max-w-xs">{site.url}</p>
        </div>
        <Badge variant={site.enabled ? "default" : "secondary"}>
          {site.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{site._count.pages} page(s) configured</p>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={scanning}
          onClick={() => execScan({ siteId: site.id })}
        >
          <ScanSearch className="h-3.5 w-3.5" />
          {scanning ? "Scanning..." : "Scan Now"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={discovering}
          onClick={() => execDiscover({ siteId: site.id, maxPages: 100, maxDepth: 4 })}
        >
          <Network className="h-3.5 w-3.5" />
          {discovering ? "Crawling..." : "Discover Pages"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => execToggle({ siteId: site.id, enabled: !site.enabled })}
        >
          <Power className="h-3.5 w-3.5" />
          {site.enabled ? "Disable" : "Enable"}
        </Button>

        <Button
          size="sm"
          variant="destructive"
          disabled={deleting}
          onClick={() => {
            if (confirm(`Delete "${site.name}" and all its scan history?`)) {
              execDelete({ siteId: site.id });
            }
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
