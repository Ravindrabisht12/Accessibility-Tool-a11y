import type { Scan, Site, Violation, Pages } from "@prisma/client";

export type SiteWithPageCount = Site & { _count: { pages: number } };

export type ScanWithSite = Scan & { site: Site | null };

export type ScanWithViolations = Scan & {
  site: Site | null;
  violations: Violation[];
};

export type DashboardStats = {
  totalSites: number;
  totalScans: number;
  recentScans: number;
  violations: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  latestScan: ScanWithSite | null;
};

export type ScanQueueStatus = {
  queued: number;
  running: number;
  maxConcurrent: number;
};

export type AddSiteInput = {
  name: string;
  url: string;
  pages?: string[];
};

export type TriggerScanInput = {
  url: string;
  siteId?: string;
  pagePath?: string;
  wcagLevel?: "A" | "AA" | "AAA";
};

export type ScanResult = {
  scanId: string;
  url: string;
  durationMs: number;
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
};

export type { Site, Scan, Violation, Pages };
