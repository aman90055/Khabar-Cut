import slugify from 'slugify';

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function generateUniqueSlug(text: string, existingSlugs: string[]): string {
  let slug = generateSlug(text);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(text)}-${counter}`;
    counter++;
  }

  return slug;
}

export function calculateWordCount(content: unknown): number {
  if (!content || typeof content !== 'object') return 0;

  const blocks = (content as { blocks?: Array<{ data?: { text?: string } }> })
    .blocks;
  if (!Array.isArray(blocks)) return 0;

  let totalWords = 0;
  for (const block of blocks) {
    if (block.data?.text) {
      const plainText = block.data.text.replace(/<[^>]*>/g, '');
      const words = plainText
        .trim()
        .split(/\s+/)
        .filter((word: string) => word.length > 0);
      totalWords += words.length;
    }
  }

  return totalWords;
}

export function calculateReadingTime(wordCount: number): number {
  const WORDS_PER_MINUTE = 200;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function hashIpAddress(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function serializeBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === 'bigint' ? Number(value) : value,
    ),
  ) as T;
}
