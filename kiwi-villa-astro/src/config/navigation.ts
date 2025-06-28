// 網站導航配置
export const navigationItems = [
  { href: '/', label: '首頁' },
  { href: '/intro', label: '細說期遇' },
  { href: '/location', label: '地理資訊' },
  { href: '/rooms', label: '房型設施' },
  { href: '/reviews', label: '客戶評價' },
  { href: '/faq', label: '常見問題' },
  { href: '/policy', label: '訂房須知' },
] as const;

// 外部連結
export const bookingUrl = 'https://booking.owlting.com/kiwi-villa';