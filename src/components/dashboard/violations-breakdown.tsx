import type { DashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const IMPACT_LEVELS = [
  { key: "critical", label: "Critical", bg: "bg-red-500", badge: "destructive" as const },
  { key: "serious", label: "Serious", bg: "bg-orange-500", badge: "outline" as const },
  { key: "moderate", label: "Moderate", bg: "bg-yellow-500", badge: "secondary" as const },
  { key: "minor", label: "Minor", bg: "bg-blue-400", badge: "outline" as const },
];

export function ViolationsBreakdown({ violations }: { violations: DashboardStats["violations"] }) {
  const total = Object.values(violations).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Violation Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {IMPACT_LEVELS.map(({ key, label, bg, badge }) => {
          const count = violations[key as keyof typeof violations];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={badge}>{label}</Badge>
                </div>
                <span className="font-medium">{count.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${bg} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {total === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No violations found. Run a scan to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
