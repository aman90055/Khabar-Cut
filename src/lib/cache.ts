import { revalidateTag as nextRevalidateTag } from 'next/cache';

export class MemoryCache<T> {
  private store = new Map<string, { value: T; expiresAt: number }>();

  public get(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  public set(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  public has(key: string): boolean {
    const item = this.store.get(key);
    if (!item) return false;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }
}

export function revalidateTag(tag: string) {
  try {
    nextRevalidateTag(tag, 'max');
  } catch {
    // Fail silently in environments where nextRevalidateTag is not available (like browser)
  }
}
