import AxeScanner from "./axe-scanner.js";

class ScannerQueue {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 3;
    this.queue = [];
    this.running = 0;
    this.scanner = null;
  }

  async initialize() {
    this.scanner = new AxeScanner();
    await this.scanner.initialize();
  }

  async addScan(url, options) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        url,
        options,
        resolve,
        reject,
      });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    this.running++;

    try {
      const result = await this.scanner.scanUrl(job.url, job.options);
      job.resolve(result);
    } catch (error) {
      job.reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  async close() {
    if (this.scanner) {
      await this.scanner.close();
    }
  }

  getStatus() {
    return {
      queued: this.queue.length,
      running: this.running,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

export default ScannerQueue;
