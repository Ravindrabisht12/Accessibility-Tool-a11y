"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import Link from "next/link";
import type { ScanWithSite } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatDuration } from "@/lib/utils";
import { ArrowUpDown, Eye, Download, AlertCircle, CheckCircle, Loader, Clock } from "lucide-react";

const STATUS_BADGE: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; icon: React.ReactNode }> = {
  COMPLETED: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  FAILED: { variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  RUNNING: { variant: "secondary", icon: <Loader className="h-3 w-3 animate-spin" /> },
  QUEUED: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
};

const QUEUED_FALLBACK = STATUS_BADGE["QUEUED"]!;

const columns: ColumnDef<ScanWithSite>[] = [
  {
    accessorKey: "fullUrl",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
        URL <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs truncate max-w-xs block" title={row.original.fullUrl}>
        {row.original.fullUrl}
      </span>
    ),
  },
  {
    accessorFn: (row) => row.site?.name ?? "Manual",
    id: "site",
    header: "Site",
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = STATUS_BADGE[row.original.status] ?? QUEUED_FALLBACK;
      return (
        <Badge variant={s.variant} className="gap-1">
          {s.icon}
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalViolations",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
        Violations <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const count = row.original.totalViolations;
      return (
        <Badge variant={count > 0 ? "destructive" : "secondary"}>
          {count}
        </Badge>
      );
    },
  },
  {
    accessorKey: "startedAt",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
        Date <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.startedAt)}</span>,
    sortingFn: "datetime",
  },
  {
    accessorKey: "durationMs",
    header: "Duration",
    cell: ({ row }) =>
      row.original.durationMs ? (
        <span className="text-sm text-muted-foreground">{formatDuration(row.original.durationMs)}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/scans/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        {row.original.status === "COMPLETED" && (
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a href={`/api/reports/export?scanId=${row.original.id}&format=csv`} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    ),
  },
];

export function ScansTable({ scans }: { scans: ScanWithSite[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "startedAt", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: scans,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter scans..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  No scans found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} of {scans.length} scans
      </p>
    </div>
  );
}
