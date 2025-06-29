// 全域類型定義
declare global {
  interface Window {
    roomImages: Record<string, Array<{src: string; alt: string}>>;
  }
}

export {};