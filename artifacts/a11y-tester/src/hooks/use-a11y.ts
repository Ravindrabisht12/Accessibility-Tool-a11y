import { useState } from "react";
import { useRunAccessibilityScan } from "@workspace/api-client-react";
import type { ScanResult } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

/**
 * A wrapper hook around the generated API mutation to handle local state,
 * error handling, and toast notifications.
 */
export function useAccessibilityScan() {
  const { toast } = useToast();
  const [activeScanResult, setActiveScanResult] = useState<ScanResult | null>(null);

  const mutation = useRunAccessibilityScan({
    mutation: {
      onSuccess: (data) => {
        setActiveScanResult(data);
        toast({
          title: "Scan Complete",
          description: `Found ${data.summary.violationCount} violations across ${data.url}`,
          variant: data.summary.violationCount > 0 ? "destructive" : "default",
        });
      },
      onError: (error) => {
        console.error("Scan failed:", error);
        toast({
          title: "Scan Failed",
          description: error.message || "An unexpected error occurred during the scan.",
          variant: "destructive",
        });
      }
    }
  });

  return {
    ...mutation,
    activeScanResult,
    clearResult: () => setActiveScanResult(null)
  };
}
