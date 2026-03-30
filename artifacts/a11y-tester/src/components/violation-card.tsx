import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Code2 } from "lucide-react";
import type { A11yViolation } from "@workspace/api-client-react";
import { ImpactBadge } from "./impact-badge";
import { Badge } from "@/components/ui/badge";

interface Props {
  violation: A11yViolation;
}

export function ViolationCard({ violation }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine border color based on impact
  const borderColors = {
    critical: "border-l-red-500",
    serious: "border-l-orange-500",
    moderate: "border-l-yellow-500",
    minor: "border-l-blue-500",
    default: "border-l-muted-foreground"
  };
  
  const impactLevel = (violation.impact?.toLowerCase() || "default") as keyof typeof borderColors;
  const borderClass = borderColors[impactLevel] || borderColors.default;

  return (
    <div className={`glass-panel rounded-xl border-l-4 ${borderClass} overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-white/20`}>
      <div 
        className="p-5 cursor-pointer select-none flex items-start gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <ImpactBadge impact={violation.impact} />
            <span className="font-mono text-sm text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
              {violation.id}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              {violation.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal opacity-70">
                  {tag}
                </Badge>
              ))}
              {violation.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs font-normal opacity-70">
                  +{violation.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-1 leading-snug">
            {violation.help}
          </h3>
          <p className="text-sm text-muted-foreground">
            {violation.description}
          </p>
        </div>

        <button className="mt-1 p-2 rounded-full hover:bg-white/5 transition-colors">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  Affected Nodes ({violation.nodes.length})
                </h4>
                <a 
                  href={violation.helpUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Learn how to fix <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-4">
                {violation.nodes.map((node, idx) => (
                  <div key={idx} className="bg-background rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-mono text-xs text-muted-foreground">
                        Target: <span className="text-primary/80">{node.target.join(", ")}</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                      </div>
                      <pre className="text-xs bg-[#0d0d0f] p-4 pt-8 rounded-md overflow-x-auto text-blue-300 font-mono border border-white/5">
                        {node.html}
                      </pre>
                    </div>

                    {node.failureSummary && (
                      <div className="text-sm bg-red-500/5 border border-red-500/10 p-3 rounded-md text-red-200">
                        <span className="font-semibold block mb-1">Failure Summary:</span>
                        <div className="opacity-90 whitespace-pre-line">{node.failureSummary}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
