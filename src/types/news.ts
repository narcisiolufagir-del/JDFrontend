export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  slug: string;
  link: string;
  date: string;
  image_url: string | null;
  category: NewsCategory | null;
  author?: string | null;
}

export interface NewsListResponse {
  posts: NewsArticle[];
  total: number;
  total_pages: number;
  page: number;
}
