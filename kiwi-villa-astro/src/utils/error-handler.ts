// 全局錯誤處理工具

interface ErrorInfo {
  message: string;
  stack?: string;
  type: 'error' | 'unhandledRejection' | 'boundary' | 'network' | 'custom';
  url?: string;
  timestamp: string;
  userAgent: string;
  extra?: Record<string, any>;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorInfo[] = [];
  private maxQueueSize = 50;
  private flushInterval = 30000; // 30 秒
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupErrorListeners();
    this.startFlushTimer();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupErrorListeners() {
    // 捕獲全局錯誤
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        type: 'error',
        url: event.filename,
        extra: {
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        type: 'unhandledRejection',
      });
    });

    // 監聽網路錯誤
    window.addEventListener('offline', () => {
      this.logError({
        message: '網路連線中斷',
        type: 'network',
        extra: { online: false },
      });
    });

    // 監聽資源載入錯誤
    window.addEventListener('error', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.tagName) {
        this.logError({
          message: `資源載入失敗: ${target.tagName}`,
          type: 'error',
          extra: {
            tagName: target.tagName,
            src: (target as any).src || (target as any).href,
          },
        });
      }
    }, true);
  }

  logError(error: Partial<ErrorInfo>) {
    const errorInfo: ErrorInfo = {
      message: error.message || '未知錯誤',
      stack: error.stack,
      type: error.type || 'custom',
      url: error.url || window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      extra: {
        ...error.extra,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screen: {
          width: screen.width,
          height: screen.height,
        },
      },
    };

    // 在開發環境中直接輸出
    // @ts-ignore - Vite/Astro specific env var
    if (import.meta.env.DEV) {
      console.error('錯誤處理器:', errorInfo);
      return;
    }

    // 添加到錯誤隊列
    this.errorQueue.push(errorInfo);

    // 如果隊列滿了，立即發送
    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendErrors(errors);
    } catch (error) {
      // 如果發送失敗，將錯誤放回隊列（但限制重試次數）
      const retriableErrors = errors.slice(0, 10);
      this.errorQueue.unshift(...retriableErrors);
    }
  }

  private async sendErrors(errors: ErrorInfo[]) {
    // 在實際應用中，這裡應該發送到錯誤追蹤服務
    // 例如 Sentry、LogRocket 等
    
    // 示例：發送到自定義端點
    const response = await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors }),
    });

    if (!response.ok) {
      throw new Error('Failed to send errors');
    }
  }

  // 手動記錄錯誤
  static log(message: string, extra?: Record<string, any>) {
    ErrorHandler.getInstance().logError({
      message,
      type: 'custom',
      extra,
    });
  }

  // 清理資源
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// 導出單例
export const errorHandler = ErrorHandler.getInstance();

// 導出便捷方法
export const logError = ErrorHandler.log;

// 在頁面卸載時發送剩餘的錯誤
window.addEventListener('beforeunload', () => {
  errorHandler.destroy();
});