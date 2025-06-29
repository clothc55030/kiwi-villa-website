// 類型定義檔案

// 導航項目類型
export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

// 社交媒體類型
export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color: string;
}

// 聯絡資訊類型
export interface ContactInfo {
  type: 'phone' | 'email' | 'line' | 'address';
  label: string;
  value: string;
  icon: string;
  href?: string;
}

// 房型類型
export interface Room {
  id: string;
  name: string;
  type: 'double' | 'twin' | 'triple' | 'quad' | 'family';
  price: number;
  capacity: number;
  size: number;
  description: string;
  features: string[];
  images: RoomImage[];
  amenities: string[];
}

// 房型圖片類型
export interface RoomImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// 評論類型
export interface Review {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  platform: 'google' | 'booking' | 'agoda' | 'facebook';
  content: string;
  roomType?: string;
}

// FAQ 類型
export interface FAQ {
  id: string;
  category: 'booking' | 'facility' | 'location' | 'policy' | 'other';
  question: string;
  answer: string;
  order: number;
}

// 設施類型
export interface Facility {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'room' | 'public' | 'service';
}

// SEO 元數據類型
export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

// 圖片優化選項類型
export interface ImageOptimizationOptions {
  quality?: number;
  formats?: ('avif' | 'webp' | 'jpg')[];
  sizes?: string;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
  decoding?: 'sync' | 'async' | 'auto';
}

// Blurhash 數據類型
export interface BlurhashData {
  blurhash: string;
  width: number;
  height: number;
}

// 頁面配置類型
export interface PageConfig {
  seo: SEOMetadata;
  hero?: {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    cta?: {
      text: string;
      href: string;
      icon?: string;
    }[];
  };
}