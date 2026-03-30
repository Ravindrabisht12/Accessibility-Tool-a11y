import { motion } from "framer-motion";
import { Shield, Scan, Search, Globe, Code } from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  { icon: Globe, text: "Resolving target URL..." },
  { icon: Search, text: "Initializing headless browser..." },
  { icon: Code, text: "Injecting axe-core engine..." },
  { icon: Scan, text: "Evaluating DOM elements against WCAG..." },
  { icon: Shield, text: "Compiling accessibility report..." },
];

export function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-32 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-48 h-48 mb-12 flex items-center justify-center"
      >
        {/* Radar Background */}
        <div className="absolute inset-0 rounded-full border border-primary/20 bg-primary/5" />
        <div className="absolute inset-4 rounded-full border border-primary/20" />
        <div className="absolute inset-12 rounded-full border border-primary/20" />
        
        {/* Pulsing Core */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-20 rounded-full bg-primary/20 blur-md"
        />
        
        {/* Scanning Line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 70%, rgba(37, 99, 235, 0.4) 100%)",
            borderRight: "2px solid hsl(var(--primary))"
          }}
        />

        <Shield className="w-12 h-12 text-primary z-10" />
      </motion.div>

      <div className="max-w-md w-full glass-panel rounded-2xl p-6 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <h3 className="text-xl font-semibold mb-6 text-center">Running Analysis</h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isDone = index < currentStep;

            return (
              <div 
                key={index}
                className={`flex items-center gap-4 transition-all duration-300 ${
                  isActive ? "text-primary opacity-100 translate-x-2" :
                  isDone ? "text-muted-foreground opacity-50" :
                  "text-muted-foreground opacity-20"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive ? "bg-primary/10" : isDone ? "bg-muted" : "border border-white/5"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-8 animate-pulse">
          This process requires a full headless browser spin-up and may take up to 30 seconds.
        </p>
      </div>
    </div>
  );
}
