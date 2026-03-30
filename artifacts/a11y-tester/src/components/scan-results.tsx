import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { ScanResult } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ViolationCard } from "./violation-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

interface Props {
  result: ScanResult;
  onRescan: () => void;
}

export function ScanResults({ result, onRescan }: Props) {
  const [impactFilter, setImpactFilter] = useState<string>("all");
  
  const stats = [
    { name: "Critical", value: result.summary.criticalCount, color: "hsl(0 84% 60%)" },
    { name: "Serious", value: result.summary.seriousCount, color: "hsl(30 90% 55%)" },
    { name: "Moderate", value: result.summary.moderateCount, color: "hsl(45 93% 47%)" },
    { name: "Minor", value: result.summary.minorCount, color: "hsl(217 91% 60%)" }
  ].filter(s => s.value > 0);

  const filteredViolations = result.violations.filter(v => 
    impactFilter === "all" ? true : v.impact?.toLowerCase() === impactFilter
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-3">
            Scan Report
            {result.summary.violationCount === 0 ? (
              <span className="text-xs font-medium bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                Perfect Score
              </span>
            ) : (
              <span className="text-xs font-medium bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">
                Action Required
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <a href={result.url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono">
              {result.url}
            </a>
            <span>•</span>
            <span>{new Date(result.timestamp).toLocaleString()}</span>
            <span>•</span>
            <span>{(result.scanDuration / 1000).toFixed(2)}s</span>
          </div>
        </div>
        <Button onClick={onRescan} variant="outline" className="gap-2 shrink-0">
          <RefreshCw className="w-4 h-4" /> New Scan
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl col-span-1 md:col-span-3 grid grid-cols-3 gap-6 divide-x divide-white/5">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-4xl font-bold text-foreground mb-1">{result.summary.violationCount}</div>
            <div className="text-sm font-medium text-muted-foreground">Violations</div>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-4xl font-bold text-foreground mb-1">{result.summary.passCount}</div>
            <div className="text-sm font-medium text-muted-foreground">Passed Rules</div>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-4xl font-bold text-foreground mb-1">{result.summary.incompleteCount}</div>
            <div className="text-sm font-medium text-muted-foreground">Incomplete Checks</div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 w-full text-left">Severity Breakdown</h3>
          {stats.length > 0 ? (
            <div className="h-32 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-xl font-bold leading-none">{result.summary.violationCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              No violations found
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="violations" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-black/20 border border-white/5 rounded-xl p-1 mb-6">
          <TabsTrigger value="violations" className="rounded-lg data-[state=active]:bg-card px-6">
            Violations <span className="ml-2 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs">{result.summary.violationCount}</span>
          </TabsTrigger>
          <TabsTrigger value="passes" className="rounded-lg data-[state=active]:bg-card px-6">
            Passes <span className="ml-2 bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">{result.summary.passCount}</span>
          </TabsTrigger>
          <TabsTrigger value="incomplete" className="rounded-lg data-[state=active]:bg-card px-6">
            Incomplete <span className="ml-2 bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">{result.summary.incompleteCount}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-6 outline-none focus:ring-0">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All", count: result.summary.violationCount },
              { id: "critical", label: "Critical", count: result.summary.criticalCount },
              { id: "serious", label: "Serious", count: result.summary.seriousCount },
              { id: "moderate", label: "Moderate", count: result.summary.moderateCount },
              { id: "minor", label: "Minor", count: result.summary.minorCount },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setImpactFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  impactFilter === filter.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {filter.label} <span className="opacity-70 ml-1">({filter.count})</span>
              </button>
            ))}
          </div>

          {/* List */}
          <div className="grid gap-4">
            {filteredViolations.length > 0 ? (
              filteredViolations.map((violation, idx) => (
                <motion.div
                  key={violation.id + idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ViolationCard violation={violation} />
                </motion.div>
              ))
            ) : (
              <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No violations found</h3>
                <p className="text-muted-foreground">Great job! No issues matched the selected filter.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="passes">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Passed Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.passes.map(rule => (
                <div key={rule.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex flex-col">
                  <div className="font-mono text-xs text-muted-foreground mb-2">{rule.id}</div>
                  <div className="text-sm font-medium mb-3 flex-1">{rule.description}</div>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {rule.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="incomplete">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" /> Manual Review Needed
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              These rules could not be evaluated entirely automatically and require manual inspection.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.incomplete.map(rule => (
                <div key={rule.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex flex-col border-l-2 border-l-yellow-500/50">
                  <div className="font-mono text-xs text-muted-foreground mb-2">{rule.id}</div>
                  <div className="text-sm font-medium mb-3 flex-1">{rule.description}</div>
                  <a href={rule.helpUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-auto">
                    Learn more &rarr;
                  </a>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
