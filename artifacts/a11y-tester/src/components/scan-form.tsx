import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe, Settings2, ShieldCheck, ArrowRight } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const scanFormSchema = z.object({
  url: z.string().url("Please enter a valid, absolute URL (e.g., https://example.com)"),
  wcagLevel: z.enum(["A", "AA", "AAA"]),
  includeWcag22: z.boolean(),
  includeAaa: z.boolean(),
});

export type ScanFormValues = z.infer<typeof scanFormSchema>;

interface Props {
  onSubmit: (values: ScanFormValues) => void;
  isLoading: boolean;
}

export function ScanForm({ onSubmit, isLoading }: Props) {
  const form = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      url: "",
      wcagLevel: "AA",
      includeWcag22: true,
      includeAaa: false,
    },
  });

  return (
    <div className="w-full max-w-3xl mx-auto z-10 relative">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-6 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
          Automated Accessibility Testing
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Ensure your web applications meet WCAG standards. Enter a URL to run a comprehensive end-to-end accessibility scan.
        </p>
      </div>

      <div className="glass-panel p-2 rounded-2xl glow-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Main Input Area */}
            <div className="relative flex items-center">
              <div className="absolute left-4 text-muted-foreground">
                <Globe className="w-6 h-6" />
              </div>
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        placeholder="https://your-website.com"
                        className="w-full h-16 pl-14 pr-32 bg-black/20 border-none text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="absolute right-2">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="h-12 px-6 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {isLoading ? "Scanning..." : "Scan Now"}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>

            {/* Error Message for URL */}
            {form.formState.errors.url && (
              <p className="text-sm font-medium text-destructive px-4">
                {form.formState.errors.url.message}
              </p>
            )}

            {/* Advanced Settings */}
            <Collapsible className="px-2 pb-2">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto mt-4 group">
                <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> 
                Advanced Scan Settings
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-black/40 rounded-xl border border-white/5">
                  
                  {/* WCAG Level */}
                  <FormField
                    control={form.control}
                    name="wcagLevel"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-foreground font-semibold">Target WCAG Level</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="A" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">Level A (Minimum)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="AA" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">Level AA (Standard)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="AAA" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">Level AAA (Strict)</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Toggles */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="includeWcag22"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">Include WCAG 2.2 Rules</FormLabel>
                            <p className="text-xs text-muted-foreground">Test against the latest WCAG criteria.</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="includeAaa"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">Include AAA Best Practices</FormLabel>
                            <p className="text-xs text-muted-foreground">Run optional rules for highest conformance.</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
              </CollapsibleContent>
            </Collapsible>
            
          </form>
        </Form>
      </div>
    </div>
  );
}
