// ============================================================
// KHABAR CUT — Supabase Database Types
// Auto-aligned with 25-table production schema
// ============================================================

export type ArticleStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived'
  | 'rejected';

export type Visibility = 'public' | 'members_only' | 'private';
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';
export type AdStatus = 'draft' | 'active' | 'paused' | 'expired';
export type MediaType = 'image' | 'video' | 'audio' | 'document';
export type ProfileStatus = 'active' | 'inactive' | 'suspended';
export type DeviceType = 'all' | 'desktop' | 'tablet' | 'mobile';

// ── Roles ────────────────────────────────────────────────────
export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// ── Permissions ──────────────────────────────────────────────
export interface Permission {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// ── Profiles ─────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  role_id: string | null;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
  // Joined
  role?: Role;
}

// ── Authors ──────────────────────────────────────────────────
export interface Author {
  id: string;
  profile_id: string | null;
  display_name: string;
  designation: string | null;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
  social_links: Record<string, string>;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  profile?: Profile;
}

// ── Categories ───────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  parent?: Category;
}

// ── States ───────────────────────────────────────────────────
export interface State {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  is_active: boolean;
  created_at: string;
}

// ── Districts ────────────────────────────────────────────────
export interface District {
  id: string;
  state_id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  // Joined
  state?: State;
}

// ── Media ────────────────────────────────────────────────────
export interface Media {
  id: string;
  file_name: string;
  file_path: string;
  public_url: string | null;
  media_type: MediaType;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  alt_text: string | null;
  caption: string | null;
  credit: string | null;
  source: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Tags ─────────────────────────────────────────────────────
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// ── Articles ─────────────────────────────────────────────────
export interface Article {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  excerpt: string | null;
  content: string;
  category_id: string | null;
  subcategory_id: string | null;
  author_id: string | null;
  editor_id: string | null;
  featured_image_id: string | null;
  status: ArticleStatus;
  visibility: Visibility;
  is_breaking: boolean;
  is_featured: boolean;
  is_trending: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  views: number;
  likes: number;
  shares: number;
  comments_count: number;
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  schema_type: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  subcategory?: Category;
  author?: Author;
  featured_image?: Media;
  tags?: Tag[];
}

// ── Comments ─────────────────────────────────────────────────
export interface Comment {
  id: string;
  article_id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

// ── Breaking News ────────────────────────────────────────────
export interface BreakingNews {
  id: string;
  article_id: string;
  headline: string;
  priority: number;
  is_active: boolean;
  start_at: string;
  end_at: string | null;
  created_at: string;
  article?: Article;
}

// ── Advertisements ───────────────────────────────────────────
export interface AdSlot {
  id: string;
  name: string;
  location: string;
  device: DeviceType;
  is_active: boolean;
  created_at: string;
}

export interface Advertisement {
  id: string;
  name: string;
  advertiser: string | null;
  image_url: string | null;
  target_url: string | null;
  slot_id: string | null;
  start_date: string | null;
  end_date: string | null;
  status: AdStatus;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
  slot?: AdSlot;
}

// ── Newsletter ───────────────────────────────────────────────
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'subscribed' | 'unsubscribed';
  subscribed_at: string;
  unsubscribed_at: string | null;
}

// ── Site Settings ────────────────────────────────────────────
export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  x_url: string | null;
  linkedin_url: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  maintenance_mode: boolean;
  updated_at: string;
}

// ── Audit Logs ───────────────────────────────────────────────
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Helper Types ─────────────────────────────────────────────
export type ArticleWithRelations = Article & {
  category: Category | null;
  author: Author | null;
  featured_image: Media | null;
  tags?: Tag[];
};

export type ArticleListItem = Pick<
  Article,
  | 'id'
  | 'title'
  | 'slug'
  | 'short_description'
  | 'excerpt'
  | 'published_at'
  | 'views'
  | 'reading_time'
  | 'is_breaking'
  | 'is_featured'
  | 'is_trending'
  | 'status'
> & {
  category: Pick<Category, 'name' | 'slug'> | null;
  author: Pick<Author, 'display_name'> | null;
  featured_image: Pick<Media, 'public_url' | 'alt_text'> | null;
};
