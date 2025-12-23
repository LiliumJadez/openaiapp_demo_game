// ============================================
// 请求队列管理器 - 避免并发请求过多导致连接错误
// ============================================

type QueuedRequest<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
};

class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private maxConcurrent = 3; // 最多同时3个请求
  private minInterval = 300; // 请求间最小间隔（毫秒）
  private lastRequestTime = 0;

  // 添加请求到队列
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  // 处理队列
  private async processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // 确保请求间隔
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      setTimeout(() => this.processQueue(), this.minInterval - timeSinceLastRequest);
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.activeRequests++;
    this.lastRequestTime = Date.now();

    try {
      const result = await request.fn();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      // 处理下一个请求
      setTimeout(() => this.processQueue(), this.minInterval);
    }
  }

  // 设置并发限制
  setMaxConcurrent(max: number) {
    this.maxConcurrent = Math.max(1, max);
  }

  // 设置请求间隔
  setMinInterval(interval: number) {
    this.minInterval = Math.max(0, interval);
  }

  // 获取队列状态
  getStatus() {
    return {
      pending: this.queue.length,
      active: this.activeRequests,
    };
  }
}

// 单例
export const requestQueue = new RequestQueue();

