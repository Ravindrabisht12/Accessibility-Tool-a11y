import { Link } from "wouter";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <ShieldAlert className="w-24 h-24 text-destructive mb-8 opacity-80" />
      
      <h1 className="text-6xl font-bold tracking-tighter mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-muted-foreground mb-8">Page not found</h2>
      
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved. 
        Let's get you back to testing.
      </p>

      <Link href="/" className="inline-block">
        <Button size="lg" className="rounded-xl font-semibold">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
