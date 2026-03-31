"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { SiteCrawler } from "@/scanner/site-crawler";

// ── Add Site ──────────────────────────────────────────────────────────────────
const addSiteSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.url("Must be a valid URL"),
  pages: z.array(z.string()).optional().default(["/"]),
});

export const addSite = actionClient
  .metadata({ actionName: "addSite" })
  .schema(addSiteSchema)
  .action(async ({ parsedInput }) => {
    const existing = await prisma.site.findUnique({ where: { url: parsedInput.url } });
    if (existing) throw new Error("A site with this URL already exists.");

    const site = await prisma.site.create({
      data: {
        name: parsedInput.name,
        url: parsedInput.url,
        pages: {
          create: parsedInput.pages.map((path) => ({ path })),
        },
      },
    });

    revalidatePath("/sites");
    return { siteId: site.id, name: site.name };
  });

// ── Delete Site ───────────────────────────────────────────────────────────────
const deleteSiteSchema = z.object({ siteId: z.string() });

export const deleteSite = actionClient
  .metadata({ actionName: "deleteSite" })
  .schema(deleteSiteSchema)
  .action(async ({ parsedInput }) => {
    await prisma.site.delete({ where: { id: parsedInput.siteId } });
    revalidatePath("/sites");
    return { success: true };
  });

// ── Toggle Site Enabled ───────────────────────────────────────────────────────
const toggleSiteSchema = z.object({
  siteId: z.string(),
  enabled: z.boolean(),
});

export const toggleSite = actionClient
  .metadata({ actionName: "toggleSite" })
  .schema(toggleSiteSchema)
  .action(async ({ parsedInput }) => {
    await prisma.site.update({
      where: { id: parsedInput.siteId },
      data: { enabled: parsedInput.enabled },
    });
    revalidatePath("/sites");
    return { success: true };
  });

// ── Discover Pages ────────────────────────────────────────────────────────────
const discoverPagesSchema = z.object({
  siteId: z.string(),
  maxPages: z.number().int().min(1).max(500).default(100),
  maxDepth: z.number().int().min(1).max(10).default(4),
});

export const discoverPages = actionClient
  .metadata({ actionName: "discoverPages" })
  .schema(discoverPagesSchema)
  .action(async ({ parsedInput }) => {
    const site = await prisma.site.findUniqueOrThrow({ where: { id: parsedInput.siteId } });
    const crawler = new SiteCrawler();
    const result = await crawler.discover(site.url, {
      maxPages: parsedInput.maxPages,
      maxDepth: parsedInput.maxDepth,
    });

    // Replace existing pages for this site
    await prisma.pages.deleteMany({ where: { siteId: parsedInput.siteId } });
    await prisma.pages.createMany({
      data: result.pages.map((path) => ({ siteId: parsedInput.siteId, path })),
    });

    revalidatePath("/sites");
    return { discovered: result.discovered, pages: result.pages };
  });
