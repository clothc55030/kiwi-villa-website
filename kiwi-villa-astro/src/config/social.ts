import type { SocialLink, ContactInfo } from '../types';

// 社交媒體連結配置
export const socialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/kiwivillage',
    icon: 'simple-icons:facebook',
    color: 'hover:bg-facebook hover:text-white',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/kiwi_villa',
    icon: 'simple-icons:instagram',
    color: 'hover:bg-gradient-to-br hover:from-instagram-start hover:to-instagram-end hover:text-white',
  },
  {
    name: 'LINE',
    url: 'https://lin.ee/MpA4oCQ',
    icon: 'simple-icons:line',
    color: 'hover:bg-line hover:text-white',
  },
];

// 聯絡資訊
export const contactInfoItems: ContactInfo[] = [
  {
    type: 'phone',
    label: '電話',
    value: '0933-636373',
    icon: 'heroicons:phone',
    href: 'tel:+886933636373',
  },
  {
    type: 'email',
    label: '電子郵件',
    value: 'kiwi.villa.penghu@gmail.com',
    icon: 'heroicons:envelope',
    href: 'mailto:kiwi.villa.penghu@gmail.com',
  },
  {
    type: 'line',
    label: 'LINE',
    value: '@ucz4004x',
    icon: 'simple-icons:line',
    href: 'https://page.line.me/ucz4004x',
  },
  {
    type: 'address',
    label: '地址',
    value: '澎湖縣馬公市西衛里347號',
    icon: 'heroicons:map-pin',
    href: 'https://maps.app.goo.gl/QPv8Z8qdoQwAUNVB7',
  },
];

// 保留原有的 contactInfo 物件以維持向後相容
export const contactInfo = {
  phone: '0933-636373',
  phoneLink: 'tel:+886933636373',
  email: 'kiwi.villa.penghu@gmail.com',
  address: '澎湖縣馬公市西衛里347號',
  addressLink: 'https://maps.app.goo.gl/QPv8Z8qdoQwAUNVB7',
  lineUrl: 'https://page.line.me/ucz4004x',
} as const;