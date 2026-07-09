import axios from "axios";
import type { NewsArticle, NewsCategory, NewsListResponse } from "@/types/news";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://jornaldestaque.bluesparkmz.com";

const WP_API = "https://odestaque.co.mz/wp-json/wp/v2";

const newsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

function stripHtml(text: string): string {
  return (text || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#\d+;/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function decodeHtml(text: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

function normalizeWpPost(post: Record<string, unknown>): NewsArticle {
  const embedded = (post._embedded as Record<string, unknown>) || {};
  const media = (embedded["wp:featuredmedia"] as Record<string, unknown>[]) || [];
  const terms = (embedded["wp:term"] as Record<string, unknown>[][]) || [];
  const authors = (embedded.author as Record<string, unknown>[]) || [];

  const categoryList = terms[0] as Record<string, unknown>[] | undefined;
  const cat = categoryList?.[0];

  return {
    id: post.id as number,
    title: stripHtml((post.title as { rendered: string })?.rendered || ""),
    excerpt: stripHtml((post.excerpt as { rendered: string })?.rendered || ""),
    content: (post.content as { rendered: string })?.rendered || "",
    slug: post.slug as string,
    link: post.link as string,
    date: post.date as string,
    image_url: (media[0]?.source_url as string) || null,
    category: cat
      ? {
          id: cat.id as number,
          name: cat.name as string,
          slug: cat.slug as string,
        }
      : null,
    author: (authors[0]?.name as string) || "Redação",
  };
}

async function fetchFromWordPress(params: {
  page?: number;
  per_page?: number;
  search?: string;
  category?: number;
}): Promise<NewsListResponse> {
  const wpParams: Record<string, string | number> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 20,
    _embed: 1,
  };
  if (params.search) wpParams.search = params.search;
  if (params.category) wpParams.categories = params.category;

  const resp = await axios.get(`${WP_API}/posts`, { params: wpParams, timeout: 20000 });
  const posts = (resp.data as Record<string, unknown>[]).map(normalizeWpPost);

  return {
    posts,
    total: Number(resp.headers["x-wp-total"] || posts.length),
    total_pages: Number(resp.headers["x-wp-totalpages"] || 1),
    page: params.page ?? 1,
  };
}

async function fetchCategoriesFromWordPress(): Promise<NewsCategory[]> {
  const featuredSlugs = ["sociedade", "politica", "mundo", "economia"];
  const resp = await axios.get(`${WP_API}/categories`, {
    params: { per_page: 100, orderby: "count", order: "desc" },
    timeout: 15000,
  });
  const cats = resp.data as Record<string, unknown>[];
  return cats
    .filter((c) => featuredSlugs.includes(c.slug as string))
    .map((c) => ({
      id: c.id as number,
      name: c.name as string,
      slug: c.slug as string,
      count: c.count as number,
    }))
    .sort((a, b) => featuredSlugs.indexOf(a.slug) - featuredSlugs.indexOf(b.slug));
}

async function fetchPostFromWordPress(id: number): Promise<NewsArticle> {
  const resp = await axios.get(`${WP_API}/posts/${id}`, {
    params: { _embed: 1 },
    timeout: 20000,
  });
  return normalizeWpPost(resp.data);
}

export const newsAPI = {
  getPosts: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: number;
  }): Promise<NewsListResponse> => {
    try {
      return await newsApi.get("/news/posts", { params }).then((res) => res.data);
    } catch {
      return fetchFromWordPress(params ?? {});
    }
  },

  getPost: async (id: number): Promise<NewsArticle> => {
    try {
      return await newsApi.get(`/news/posts/${id}`).then((res) => res.data);
    } catch {
      return fetchPostFromWordPress(id);
    }
  },

  getCategories: async (): Promise<NewsCategory[]> => {
    try {
      return await newsApi.get("/news/categories").then((res) => res.data);
    } catch {
      return fetchCategoriesFromWordPress();
    }
  },
};

export function formatNewsDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function stripNewsHtml(html: string): string {
  return decodeHtml(stripHtml(html));
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
