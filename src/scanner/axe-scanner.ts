import { chromium, type Browser, type BrowserContext } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { prisma } from "@/lib/prisma";
import type { ScanResult } from "@/types";

interface ScanOptions {
  siteId?: string;
  pagePath?: string;
  scanType?: "MANUAL" | "SCHEDULED" | "SITE";
  wcagLevel?: "A" | "AA" | "AAA";
}

interface ViolationNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

interface AxeViolation {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: ViolationNode[];
}

export class AxeScanner {
  private browser: Browser | null = null;
  private readonly timeout: number;
  private readonly wcagLevel: string;

  constructor(options: { timeout?: number; wcagLevel?: string } = {}) {
    this.timeout = options.timeout ?? 30000;
    this.wcagLevel = options.wcagLevel ?? "AA";
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private getWCAGTags(): string[] {
    const base = ["wcag2a", "wcag2aa", "best-practice"];
    if (this.wcagLevel === "AAA") base.push("wcag2aaa");
    return base;
  }

  private processViolations(violations: AxeViolation[]) {
    const summary = { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 };

    for (const v of violations) {
      const impact = v.impact ?? "minor";
      summary.total++;
      if (impact in summary) {
        const key = impact as keyof typeof summary;
        summary[key] = (summary[key] ?? 0) + 1;
      }
    }

    return summary;
  }

  async scanUrl(url: string, options: ScanOptions = {}): Promise<ScanResult> {
    if (!this.browser) throw new Error("Scanner not initialized. Call initialize() first.");

    const scan = await prisma.scan.create({
      data: {
        siteId: options.siteId ?? null,
        pagePath: options.pagePath ?? "/",
        fullUrl: url,
        status: "RUNNING",
        scanType: options.scanType ?? "MANUAL",
        wcagLevel: options.wcagLevel ?? this.wcagLevel,
      },
    });

    const startTime = Date.now();
    let context: BrowserContext | null = null;

    try {
      context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: "AccessibilityMonitor/2.0 (Playwright)",
      });

      const page = await context.newPage();
      console.log(`Scanning: ${url}`);

      await page.goto(url, { waitUntil: "networkidle", timeout: this.timeout });

      const axeResults = await new AxeBuilder({ page }).withTags(this.getWCAGTags()).analyze();
      const violations = axeResults.violations as AxeViolation[];
      const summary = this.processViolations(violations);
      const durationMs = Date.now() - startTime;

      // Persist violations
      if (violations.length > 0) {
        await prisma.violation.createMany({
          data: violations.map((v) => ({
            scanId: scan.id,
            ruleId: v.id,
            impact: v.impact ?? "minor",
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes as object,
          })),
        });
      }

      await prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          durationMs,
          totalViolations: summary.total,
          criticalCount: summary.critical,
          seriousCount: summary.serious,
          moderateCount: summary.moderate,
          minorCount: summary.minor,
        },
      });

      console.log(`✅ Scan completed: ${summary.total} violations found`);

      return { scanId: scan.id, url, durationMs, summary };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const message = error instanceof Error ? error.message : "Unknown error";

      await prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          durationMs,
          errorMessage: message,
        },
      });

      console.error(`❌ Scan failed for ${url}:`, message);
      throw error;
    } finally {
      await context?.close();
    }
  }
}
