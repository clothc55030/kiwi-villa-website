// kiwi-villa-astro/src/types/global.d.ts
interface RoomImage {
  src: string;
  alt: string;
}

interface RoomData {
  id: string;
  images: RoomImage[];
  // 其他可能的房型資料屬性
}

declare global {
  interface Window {
    roomImages: Record<string, RoomImage[]>;
    roomImagesData: Record<string, RoomImage[]>;
    openLightbox: (images: RoomImage[], startIndex: number) => void;
    lazyImageLoader: {
      loaded: Set<string>;
      loadRoomImages: (roomId: string) => Promise<RoomImage[]>;
    };
    gtag?: (command: string, eventName: string, eventParams: object) => void;
  }
}

export {};