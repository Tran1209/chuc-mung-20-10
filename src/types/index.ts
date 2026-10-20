export interface MemoryCard {
  id: string;
  originalFileName: string;
  title: string;
  caption: string;
  dateStr: string;
  tag: string;
  sticker: string;
  rotationDeg: number;
  likes: number;
  imageUrl?: string;
  customImageData?: string;
}

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  icon: string;
  isRedeemed: boolean;
  color: string;
}

export interface ReasonLove {
  id: number;
  title: string;
  description: string;
  emoji: string;
  bgGradient: string;
}
