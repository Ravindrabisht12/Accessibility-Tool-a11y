import { Layout } from "@/components/layout";
import { ScanForm, type ScanFormValues } from "@/components/scan-form";
import { LoadingScreen } from "@/components/loading-screen";
import { ScanResults } from "@/components/scan-results";
import { useAccessibilityScan } from "@/hooks/use-a11y";

export default function Home() {
  const { mutate, isPending, activeScanResult, clearResult } = useAccessibilityScan();

  const handleScanSubmit = (values: ScanFormValues) => {
    mutate({ data: values });
  };

  return (
    <Layout>
      {/* Decorative background image - if generated, we place it subtly */}
      <div 
        className="fixed inset-0 z-[-1] opacity-[0.15] bg-cover bg-center pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-bg.png)` }}
      />
      
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10 min-h-[calc(100vh-140px)] flex flex-col justify-center">
        
        {!isPending && !activeScanResult && (
          <ScanForm onSubmit={handleScanSubmit} isLoading={isPending} />
        )}

        {isPending && (
          <LoadingScreen />
        )}

        {activeScanResult && !isPending && (
          <ScanResults 
            result={activeScanResult} 
            onRescan={clearResult} 
          />
        )}
        
      </div>
    </Layout>
  );
}
