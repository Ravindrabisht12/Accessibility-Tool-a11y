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
import type { Violation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IMPACT_COLORS } from "@/lib/utils";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const columns: ColumnDef<Violation>[] = [
  {
    accessorKey: "impact",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
        Impact <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
          IMPACT_COLORS[row.original.impact] ?? "",
        )}
      >
        {row.original.impact}
      </span>
    ),
    sortingFn: (a, b) => {
      const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
      return (order[a.original.impact as keyof typeof order] ?? 4) -
             (order[b.original.impact as keyof typeof order] ?? 4);
    },
  },
  {
    accessorKey: "ruleId",
    header: "Rule",
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1 py-0.5 text-xs">{row.original.ruleId}</code>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm line-clamp-2">{row.original.description}</span>
    ),
  },
  {
    accessorKey: "help",
    header: "Help",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1">{row.original.help}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <a
        href={row.original.helpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        Docs <ExternalLink className="h-3 w-3" />
      </a>
    ),
  },
];

export function ViolationsTable({ violations }: { violations: Violation[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "impact", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: violations,
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
        placeholder="Search violations..."
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
                  {violations.length === 0 ? "No violations found — great job! 🎉" : "No matching violations"}
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
        {table.getFilteredRowModel().rows.length} of {violations.length} violations
      </p>
    </div>
  );
}
