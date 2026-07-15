import { createSupabasePublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logger } from "@/lib/observability/logger";
import type { Json } from "@/lib/db/database.types";
import type { Article, ArticleListItem, ContentBlock, Faq } from "./types";

function parseBody(body: Json): ContentBlock[] {
  if (!Array.isArray(body)) return [];
  const blocks: ContentBlock[] = [];
  for (const item of body) {
    if (
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      "type" in item &&
      "text" in item &&
      (item.type === "paragraph" || item.type === "heading") &&
      typeof item.text === "string"
    ) {
      blocks.push({ type: item.type, text: item.text });
    }
  }
  return blocks;
}

export async function getArticles(): Promise<ArticleListItem[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("content_articles")
    .select("id, title, slug, excerpt, cover_image_path, published_at")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .returns<
      {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        cover_image_path: string | null;
        published_at: string | null;
      }[]
    >();

  if (error) {
    logger.warn("Kon artikelen niet laden", { message: error.message });
    return [];
  }
  return (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    coverImagePath: a.cover_image_path,
    publishedAt: a.published_at,
  }));
}

export async function getArticleSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("content_articles")
    .select("slug")
    .eq("status", "published")
    .is("deleted_at", null)
    .returns<{ slug: string }[]>();
  if (error) return [];
  return (data ?? []).map((a) => a.slug);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("content_articles")
    .select("id, title, slug, excerpt, body, cover_image_path, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .limit(1)
    .returns<
      {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        body: Json;
        cover_image_path: string | null;
        published_at: string | null;
      }[]
    >();

  if (error) {
    logger.warn("Kon artikel niet laden", { message: error.message, slug });
    return null;
  }
  const article = data?.[0];
  if (!article) return null;

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    body: parseBody(article.body),
    coverImagePath: article.cover_image_path,
    publishedAt: article.published_at,
  };
}

export async function getFaqs(productId?: string): Promise<Faq[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("published", true)
    .order("sort_order");

  query = productId ? query.eq("product_id", productId) : query.is("product_id", null);

  const { data, error } = await query.returns<{ id: string; question: string; answer: string }[]>();
  if (error) {
    logger.warn("Kon FAQ niet laden", { message: error.message });
    return [];
  }
  return data ?? [];
}
