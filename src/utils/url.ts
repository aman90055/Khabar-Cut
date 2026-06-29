export function getArticleUrl(categorySlug: string, articleSlug: string): string {
  return `/${categorySlug}/${articleSlug}`;
}

export function getCategoryUrl(slug: string): string {
  return `/${slug}`;
}

export function getAuthorUrl(slug: string): string {
  return `/author/${slug}`;
}

export function getTagUrl(slug: string): string {
  return `/tag/${slug}`;
}

export function getStateUrl(slug: string): string {
  return `/state/${slug}`;
}

export function getDistrictUrl(slug: string): string {
  return `/district/${slug}`;
}

export function getAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  const str = queryParams.toString();
  return str ? `?${str}` : '';
}
