// Astro 元件的 Props 類型定義

// Layout 元件 Props
export interface LayoutProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: object;
  keywords?: string;
}

// Header 元件 Props
export interface HeaderProps {
  currentPath?: string;
}

// Footer 元件 Props
export interface FooterProps {
  showNewsletter?: boolean;
}

// BlurImage 元件 Props
export interface BlurImageProps {
  src: string;
  alt: string;
  class?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
}

// 動畫選項類型
export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}