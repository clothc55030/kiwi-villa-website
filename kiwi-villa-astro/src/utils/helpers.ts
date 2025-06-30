// 通用工具函數

/**
 * 格式化日期
 * @param date - 日期字串或 Date 物件
 * @param format - 格式化選項
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('zh-TW');
  }
  
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化價格
 * @param price - 價格數字
 * @param currency - 貨幣符號
 */
export function formatPrice(price: number, currency: string = 'NT$'): string {
  return `${currency} ${price.toLocaleString('zh-TW')}`;
}

/**
 * 生成 SEO 友善的 URL slug
 * @param text - 原始文字
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-\u4e00-\u9fa5]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-|\-$/g, '');
}

/**
 * 檢查是否為外部連結
 * @param url - URL 字串
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

/**
 * 延遲函數
 * @param ms - 毫秒數
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 節流函數
 * @param func - 要節流的函數
 * @param limit - 節流時間限制（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 防抖函數
 * @param func - 要防抖的函數
 * @param wait - 等待時間（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 計算閱讀時間
 * @param text - 文章內容
 * @param wordsPerMinute - 每分鐘閱讀字數
 */
export function calculateReadingTime(
  text: string,
  wordsPerMinute: number = 250
): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * 取得圖片尺寸字串
 * @param width - 寬度
 * @param height - 高度
 */
export function getImageDimensions(
  width: number,
  height: number
): { width: string; height: string; aspectRatio: string } {
  return {
    width: `${width}px`,
    height: `${height}px`,
    aspectRatio: `${width}/${height}`,
  };
}

/**
 * 生成圖片 srcset
 * @param basePath - 圖片基礎路徑（不含副檔名）
 * @param sizes - 尺寸陣列
 */
export function generateSrcSet(
  basePath: string,
  sizes: number[] = [640, 768, 1024, 1280, 1920]
): string {
  return sizes
    .map(size => `${basePath}-${size}w.jpg ${size}w`)
    .join(', ');
}