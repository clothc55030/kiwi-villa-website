// 社交媒體連結配置
export const socialLinks = [
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
] as const;

// 聯絡資訊
export const contactInfo = {
  phone: '0933-636373',
  phoneLink: 'tel:+886933636373',
  email: 'kiwi.villa.penghu@gmail.com',
  address: '澎湖縣馬公市西衛里347號',
  addressLink: 'https://maps.app.goo.gl/QPv8Z8qdoQwAUNVB7',
  lineUrl: 'https://page.line.me/ucz4004x',
} as const;