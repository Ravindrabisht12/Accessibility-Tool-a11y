"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { useQuery } from "@tanstack/react-query";
import { triggerManualScan } from "@/actions/scans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Link from "next/link";
import { Zap, Loader, CheckCircle, AlertCircle } from "lucide-react";

const schema = z.object({
  url: z.url("Must be a valid URL"),
  wcagLevel: z.enum(["A", "AA", "AAA"]),
});

type FormValues = z.infer<typeof schema>;

interface ScanStatusResponse {
  id: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  durationMs: number | null;
  errorMessage: string | null;
}

async function fetchScanStatus(scanId: string): Promise<ScanStatusResponse> {
  const res = await fetch(`/api/scans/${scanId}/status`);
  if (!res.ok) throw new Error("Failed to fetch scan status");
  return res.json() as Promise<ScanStatusResponse>;
}

export default function ManualScanPage() {
  const { toast } = useToast();
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { wcagLevel: "AA" },
  });

  const { execute, isPending } = useAction(triggerManualScan, {
    onSuccess({ data }) {
      if (data?.scanId) {
        setActiveScanId(data.scanId);
        toast({ title: "Scan started — monitoring progress below..." });
      } else {
        toast({ title: "Scan triggered — check Scan History for results" });
      }
    },
    onError({ error }) {
      toast({ title: "Scan failed to start", description: error.serverError, variant: "destructive" });
    },
  });

  // TanStack Query polls scan status every 3 seconds until done
  const { data: scanStatus } = useQuery({
    queryKey: ["scan-status", activeScanId],
    queryFn: () => fetchScanStatus(activeScanId!),
    enabled: !!activeScanId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "COMPLETED" || status === "FAILED" ? false : 3000;
    },
  });

  const isScanning = scanStatus?.status === "QUEUED" || scanStatus?.status === "RUNNING";
  const isDone = scanStatus?.status === "COMPLETED" || scanStatus?.status === "FAILED";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manual Scan</h1>
        <p className="text-muted-foreground">Scan any URL for accessibility violations instantly</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan a URL</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => {
              setActiveScanId(null);
              execute(values);
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="url">URL to scan</Label>
              <Input
                id="url"
                placeholder="https://example.com/page"
                {...register("url")}
              />
              {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wcagLevel">WCAG Level</Label>
              <select
                id="wcagLevel"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("wcagLevel")}
              >
                <option value="A">A — Minimum</option>
                <option value="AA">AA — Standard (Recommended)</option>
                <option value="AAA">AAA — Enhanced</option>
              </select>
            </div>

            <Button type="submit" disabled={isPending || isScanning} className="w-full">
              {isPending || isScanning ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {isScanning ? "Scanning..." : "Starting..."}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Run Scan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scan Progress */}
      {activeScanId && scanStatus && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Scan Progress</CardTitle>
            <Badge
              variant={
                scanStatus.status === "COMPLETED" ? "default" :
                scanStatus.status === "FAILED" ? "destructive" : "secondary"
              }
              className="gap-1"
            >
              {isScanning && <Loader className="h-3 w-3 animate-spin" />}
              {scanStatus.status === "COMPLETED" && <CheckCircle className="h-3 w-3" />}
              {scanStatus.status === "FAILED" && <AlertCircle className="h-3 w-3" />}
              {scanStatus.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {isScanning && (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full animate-pulse bg-primary rounded-full w-3/4" />
              </div>
            )}

            {scanStatus.status === "COMPLETED" && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Critical", count: scanStatus.criticalCount, color: "text-red-600" },
                    { label: "Serious", count: scanStatus.seriousCount, color: "text-orange-500" },
                    { label: "Moderate", count: scanStatus.moderateCount, color: "text-yellow-600" },
                    { label: "Minor", count: scanStatus.minorCount, color: "text-blue-500" },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="rounded-lg border p-3">
                      <div className={`text-xl font-bold ${color}`}>{count}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/scans/${activeScanId}`}>View Full Report →</Link>
                </Button>
              </div>
            )}

            {scanStatus.status === "FAILED" && (
              <p className="text-sm text-destructive">{scanStatus.errorMessage ?? "Scan failed"}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
