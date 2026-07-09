import axios from "axios";
import type { NewsArticle, NewsCategory, NewsListResponse } from "@/types/news";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://jornaldestaque.bluesparkmz.com";

const newsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const newsAPI = {
  getPosts: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: number;
  }): Promise<NewsListResponse> =>
    newsApi.get("/news/posts", { params }).then((res) => res.data),

  getPost: (id: number): Promise<NewsArticle> =>
    newsApi.get(`/news/posts/${id}`).then((res) => res.data),

  getCategories: (): Promise<NewsCategory[]> =>
    newsApi.get("/news/categories").then((res) => res.data),
};

export function formatNewsDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export const categoryColors: Record<string, string> = {
  sociedade: "bg-blue-500",
  politica: "bg-red-500",
  mundo: "bg-emerald-500",
  economia: "bg-amber-500",
  desporto: "bg-purple-500",
  cultura: "bg-pink-500",
  tecnologia: "bg-cyan-500",
  saude: "bg-teal-500",
};

export function getCategoryColor(slug?: string): string {
  if (!slug) return "bg-gray-500";
  return categoryColors[slug] ?? "bg-gray-500";
}
