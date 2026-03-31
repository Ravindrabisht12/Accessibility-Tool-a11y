import { AxeScanner } from "./axe-scanner";
import type { ScanResult } from "@/types";

interface QueueJob {
  url: string;
  options: Record<string, unknown>;
  resolve: (result: ScanResult) => void;
  reject: (error: unknown) => void;
}

export class ScannerQueue {
  private readonly maxConcurrent: number;
  private queue: QueueJob[] = [];
  private running = 0;
  private scanner: AxeScanner | null = null;

  constructor(options: { maxConcurrent?: number } = {}) {
    this.maxConcurrent = options.maxConcurrent ?? 3;
  }

  async initialize(): Promise<void> {
    this.scanner = new AxeScanner();
    await this.scanner.initialize();
  }

  async addScan(url: string, options: Record<string, unknown> = {}): Promise<ScanResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      void this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return;
    const job = this.queue.shift();
    if (!job) return;
    this.running++;

    try {
      const result = await this.scanner!.scanUrl(job.url, job.options as Parameters<AxeScanner["scanUrl"]>[1]);
      job.resolve(result);
    } catch (error) {
      job.reject(error);
    } finally {
      this.running--;
      void this.processQueue();
    }
  }

  async close(): Promise<void> {
    await this.scanner?.close();
  }

  getStatus() {
    return { queued: this.queue.length, running: this.running, maxConcurrent: this.maxConcurrent };
  }
}

// Singleton queue for the app
let globalQueue: ScannerQueue | null = null;

export async function getQueue(): Promise<ScannerQueue> {
  if (!globalQueue) {
    globalQueue = new ScannerQueue({
      maxConcurrent: parseInt(process.env.MAX_CONCURRENT_SCANS ?? "3"),
    });
    await globalQueue.initialize();
  }
  return globalQueue;
}
