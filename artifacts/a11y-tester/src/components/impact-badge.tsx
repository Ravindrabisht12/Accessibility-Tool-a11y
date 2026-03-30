import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, AlertOctagon, Info } from "lucide-react";

export type ImpactLevel = "critical" | "serious" | "moderate" | "minor" | null | undefined;

export function ImpactBadge({ impact }: { impact: ImpactLevel }) {
  if (!impact) return null;

  const normalized = impact.toLowerCase();

  switch (normalized) {
    case "critical":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1.5 py-1">
          <AlertOctagon className="w-3.5 h-3.5" /> Critical
        </Badge>
      );
    case "serious":
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1.5 py-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Serious
        </Badge>
      );
    case "moderate":
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1.5 py-1">
          <AlertCircle className="w-3.5 h-3.5" /> Moderate
        </Badge>
      );
    case "minor":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 py-1">
          <Info className="w-3.5 h-3.5" /> Minor
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground gap-1.5 py-1">
          Unknown
        </Badge>
      );
  }
}
