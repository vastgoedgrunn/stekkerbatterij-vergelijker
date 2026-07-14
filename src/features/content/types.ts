export interface ContentBlock {
  type: "paragraph" | "heading";
  text: string;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
}

export interface Article extends ArticleListItem {
  body: ContentBlock[];
  coverImagePath: string | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}
