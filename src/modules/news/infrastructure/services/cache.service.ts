import { NewsArticle } from './news-api.service';

interface CacheEntry {
    articles: NewsArticle[];
    timestamp: number;
}

export class CacheService {
    private cache: Map<string, CacheEntry> = new Map();
    private readonly TTL: number = 15 * 60 * 1000; // 15 minutes in milliseconds

    /**
     * Generate a cache key from preferences array
     */
    private generateCacheKey(preferences: string[]): string {
        if (!preferences || preferences.length === 0) {
            return 'general';
        }
        return preferences.sort().join(',');
    }

    /**
     * Check if cache entry is still valid
     */
    private isCacheValid(entry: CacheEntry): boolean {
        const now = Date.now();
        return (now - entry.timestamp) < this.TTL;
    }

    /**
     * Get cached articles for given preferences
     */
    async getCachedArticles(preferences: string[]): Promise<NewsArticle[] | null> {
        const key = this.generateCacheKey(preferences);
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (!this.isCacheValid(entry)) {
            // Cache expired, remove it
            this.cache.delete(key);
            return null;
        }

        return entry.articles;
    }

    /**
     * Set cached articles for given preferences
     */
    async setCachedArticles(preferences: string[], articles: NewsArticle[]): Promise<void> {
        const key = this.generateCacheKey(preferences);
        this.cache.set(key, {
            articles,
            timestamp: Date.now()
        });
    }

    /**
     * Clear all cache entries
     */
    async clearCache(): Promise<void> {
        this.cache.clear();
    }

    /**
     * Clear expired cache entries
     */
    async clearExpiredEntries(): Promise<void> {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (!this.isCacheValid(entry)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get all cached articles (for search functionality)
     */
    async getAllCachedArticles(): Promise<NewsArticle[]> {
        const allArticles: NewsArticle[] = [];
        const seenUrls = new Set<string>();

        for (const entry of this.cache.values()) {
            if (this.isCacheValid(entry)) {
                for (const article of entry.articles) {
                    if (!seenUrls.has(article.url)) {
                        seenUrls.add(article.url);
                        allArticles.push(article);
                    }
                }
            }
        }

        return allArticles;
    }
}

