export interface Announcement {
  status: number;
  url: string;
  title?: string;
  viewsCount?: number;
  time?: string;
  date?: string;
  image?: string;
}

export type Categories = 'onemli-duyuru' | 'ogrencilerimizin-dikkatine';