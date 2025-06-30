import { defineCollection, z, type SchemaContext } from 'astro:content';

// 房型資料結構
const roomsCollection = defineCollection({
  type: 'data',
  schema: ({ image }: SchemaContext) => z.object({
    // 基本資訊
    id: z.string(),
    name: z.string(),
    nameEn: z.string(),
    roomNumbers: z.array(z.string()),
    description: z.string(),
    capacity: z.number(),
    size: z.number(), // ㎡
    price: z.object({
      min: z.number(),
      max: z.number(),
    }),
    
    // 特色標籤
    features: z.array(z.string()),
    
    // 房間設施
    facilities: z.array(z.string()),
    
    // 圖片資料
    images: z.array(z.object({
      src: image(),
      alt: z.string(),
    })),
    
    // 其他資訊
    featured: z.boolean().default(false),
    sortOrder: z.number().default(999),
    
    // 床型資訊
    beds: z.array(z.object({
      type: z.string(),
      size: z.string(),
      count: z.number(),
    })),
  }),
});

export const collections = {
  rooms: roomsCollection,
};