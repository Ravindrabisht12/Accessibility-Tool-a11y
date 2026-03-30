import { ReactNode } from "react";
import { Link } from "wouter";
import { Shield, Github, Twitter } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30 selection:text-primary-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">a11y<span className="text-primary">.test</span></span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
            <a href="#" className="hover:text-foreground transition-colors">WCAG Guidelines</a>
            <div className="h-4 w-px bg-border" />
            <a href="#" className="hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-foreground transition-colors"><Twitter className="w-5 h-5" /></a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-auto bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Accessibility Tester. Powered by axe-core.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
