import { Router, type IRouter } from "express";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { RunAccessibilityScanBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/a11y/scan", async (req, res) => {
  const parseResult = RunAccessibilityScanBody.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "INVALID_REQUEST",
      message: parseResult.error.message,
    });
    return;
  }

  const { url, wcagLevel = "AA", includeWcag22 = true, includeAaa = false } = parseResult.data;

  let browser = null;
  const startTime = Date.now();

  try {
    const tags = buildWcagTags(wcagLevel, includeWcag22, includeAaa);
    const disabledByDefaultRules = getDisabledByDefaultRules(includeWcag22, includeAaa);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    let axeBuilder = new AxeBuilder({ page }).withTags(tags);

    if (disabledByDefaultRules.length > 0) {
      axeBuilder = axeBuilder.options({
        rules: disabledByDefaultRules.reduce(
          (acc, ruleId) => {
            acc[ruleId] = { enabled: true };
            return acc;
          },
          {} as Record<string, { enabled: boolean }>,
        ),
      });
    }

    const results = await axeBuilder.analyze();
    const scanDuration = Date.now() - startTime;

    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? null,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target.map(String),
        failureSummary: n.failureSummary ?? null,
      })),
    }));

    const passes = results.passes.map((r) => ({
      id: r.id,
      description: r.description,
      help: r.help,
      helpUrl: r.helpUrl,
      tags: r.tags,
    }));

    const incomplete = results.incomplete.map((r) => ({
      id: r.id,
      description: r.description,
      help: r.help,
      helpUrl: r.helpUrl,
      tags: r.tags,
    }));

    const inapplicable = results.inapplicable.map((r) => ({
      id: r.id,
      description: r.description,
      help: r.help,
      helpUrl: r.helpUrl,
      tags: r.tags,
    }));

    const criticalCount = violations.filter((v) => v.impact === "critical").length;
    const seriousCount = violations.filter((v) => v.impact === "serious").length;
    const moderateCount = violations.filter((v) => v.impact === "moderate").length;
    const minorCount = violations.filter((v) => v.impact === "minor").length;

    res.json({
      url,
      scanDuration,
      timestamp: new Date().toISOString(),
      violations,
      passes,
      incomplete,
      inapplicable,
      summary: {
        violationCount: violations.length,
        passCount: passes.length,
        incompleteCount: incomplete.length,
        criticalCount,
        seriousCount,
        moderateCount,
        minorCount,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    req.log.error({ err }, "Accessibility scan failed");
    res.status(500).json({
      error: "SCAN_FAILED",
      message: errorMessage,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

function buildWcagTags(wcagLevel: string, includeWcag22: boolean, includeAaa: boolean): string[] {
  const tags: string[] = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];

  if (includeWcag22) {
    tags.push("wcag22a", "wcag22aa");
  }

  if (wcagLevel === "AAA" || includeAaa) {
    tags.push("wcag2aaa");
  }

  return tags;
}

function getDisabledByDefaultRules(includeWcag22: boolean, includeAaa: boolean): string[] {
  const rules: string[] = [];

  if (includeWcag22) {
    rules.push("target-size");
  }

  if (includeAaa) {
    rules.push("color-contrast-enhanced", "identical-links-same-purpose", "meta-refresh-no-exceptions");
  }

  return rules;
}

export default router;
