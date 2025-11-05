import { CacheService } from './cache.service';

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage?: string;
    publishedAt: string;
    source: {
        name: string;
    };
}

// NewsAPI.org response format
interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: NewsArticle[];
}

// NewsCatcher API response format
interface NewsCatcherResponse {
    status: string;
    total_hits: number;
    page: number;
    total_pages: number;
    articles: Array<{
        title: string;
        author: string;
        published_date: string;
        published_date_precision: string;
        link: string;
        clean_url: string;
        excerpt: string;
        summary: string;
        rights: string;
        rank: number;
        topic: string;
        country: string;
        language: string;
        authors: string[];
        media: string;
        is_opinion: boolean;
        twitter_account: string;
        _score: number;
    }>;
}

// GNews API response format
interface GNewsResponse {
    totalArticles: number;
    articles: Array<{
        title: string;
        description: string;
        content: string;
        url: string;
        image: string;
        publishedAt: string;
        source: {
            name: string;
            url: string;
        };
    }>;
}

// NewsAPI.ai response format
interface NewsApiAiResponse {
    status: string;
    totalResults: number;
    articles: Array<{
        title: string;
        description: string;
        url: string;
        image: string;
        publishedAt: string;
        source: {
            name: string;
            url: string;
        };
        author: string;
        language: string;
        category: string[];
    }>;
}

export class NewsApiService {
    private newsApiKey: string;
    private newsCatcherKey: string;
    private gNewsKey: string;
    private newsApiAiKey: string;
    private cacheService: CacheService;

    constructor() {
        this.newsApiKey = process.env.NEWS_API_KEY || '72bd1605f7da44e59a7799c782eb6306';
        this.newsCatcherKey = process.env.NEWSCATCHER_API_KEY || '';
        this.gNewsKey = process.env.GNEWS_API_KEY || '96f1c163c04d632ae31b90c51382e4f1';
        this.newsApiAiKey = process.env.NEWSAPI_AI_KEY || 'c9f3bda4-abf6-44ef-900f-d9cdcc7f75e1';
        this.cacheService = new CacheService();
    }

    // NewsAPI.org (newsapi.org)
    private async fetchNewsApi(category?: string, country: string = 'us'): Promise<NewsArticle[]> {
        if (!this.newsApiKey) {
            console.warn('NewsAPI.org key not configured');
            return [];
        }

        try {
            const params = new URLSearchParams({
                country,
                pageSize: '20'
            });
            
            if (category) {
                params.append('category', category);
            }

            const response = await fetch(`https://newsapi.org/v2/top-headlines?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': this.newsApiKey
                }
            });

            if (!response.ok) {
                throw new Error(`NewsAPI.org error: ${response.statusText}`);
            }

            const data = await response.json() as NewsApiResponse;
            
            if (data.status === 'error') {
                throw new Error(`NewsAPI.org error: ${(data as any).message || 'Unknown error'}`);
            }

            return data.articles.map(article => ({
                title: article.title,
                description: article.description || '',
                url: article.url,
                urlToImage: article.urlToImage,
                publishedAt: article.publishedAt,
                source: { name: article.source.name }
            }));
        } catch (error: any) {
            console.error('Error fetching from NewsAPI.org:', error.message);
            return [];
        }
    }

    // NewsCatcher API (newscatcher.com)
    private async fetchNewsCatcher(query: string): Promise<NewsArticle[]> {
        if (!this.newsCatcherKey) {
            console.warn('NewsCatcher API key not configured');
            return [];
        }

        try {
            const params = new URLSearchParams({
                q: query,
                lang: 'en',
                sort_by: 'relevancy',
                page_size: '20'
            });

            const response = await fetch(`https://api.newscatcher.com/v1/search?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'x-api-key': this.newsCatcherKey
                }
            });

            if (!response.ok) {
                throw new Error(`NewsCatcher error: ${response.statusText}`);
            }

            const data = await response.json() as NewsCatcherResponse;
            
            return data.articles.map(article => ({
                title: article.title,
                description: article.summary || article.excerpt || '',
                url: article.link,
                urlToImage: article.media || undefined,
                publishedAt: article.published_date,
                source: { name: article.clean_url || 'Unknown' }
            }));
        } catch (error: any) {
            console.error('Error fetching from NewsCatcher:', error.message);
            return [];
        }
    }

    // GNews API (gnews.io)
    private async fetchGNews(query: string, category?: string): Promise<NewsArticle[]> {
        if (!this.gNewsKey) {
            console.warn('GNews API key not configured');
            return [];
        }

        try {
            const params = new URLSearchParams({
                q: query,
                token: this.gNewsKey,
                lang: 'en',
                max: '20'
            });
            
            if (category) {
                params.append('topic', category);
            }

            const response = await fetch(`https://gnews.io/api/v4/search?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`GNews error: ${response.statusText}`);
            }

            const data = await response.json() as GNewsResponse;
            
            return data.articles.map(article => ({
                title: article.title,
                description: article.description || '',
                url: article.url,
                urlToImage: article.image || undefined,
                publishedAt: article.publishedAt,
                source: { name: article.source.name }
            }));
        } catch (error: any) {
            console.error('Error fetching from GNews:', error.message);
            return [];
        }
    }

    // NewsAPI.ai (newsapi.ai)
    private async fetchNewsApiAi(query: string, category?: string): Promise<NewsArticle[]> {
        if (!this.newsApiAiKey) {
            console.warn('NewsAPI.ai key not configured');
            return [];
        }

        try {
            const params: Record<string, string> = {
                q: query,
                apiKey: this.newsApiAiKey,
                language: 'en',
                pageSize: '20'
            };
            
            if (category) {
                params.category = category;
            }

            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`https://newsapi.ai/api/v1/article/getArticles?${queryString}`);

            if (!response.ok) {
                throw new Error(`NewsAPI.ai error: ${response.statusText}`);
            }

            const data = await response.json() as NewsApiAiResponse;
            
            if (data.status === 'error') {
                throw new Error(`NewsAPI.ai error: ${(data as any).message || 'Unknown error'}`);
            }

            if (!data.articles || !Array.isArray(data.articles)) {
                return [];
            }

            return data.articles.map(article => ({
                title: article.title,
                description: article.description || '',
                url: article.url,
                urlToImage: article.image || undefined,
                publishedAt: article.publishedAt,
                source: { name: article.source.name }
            }));
        } catch (error: any) {
            console.error('Error fetching from NewsAPI.ai:', error.message);
            return [];
        }
    }

    // Map user preferences to API categories
    private getCategoryForPreference(preference: string): { category?: string; query: string } {
        const categoryMap: { [key: string]: string } = {
            'technology': 'technology',
            'business': 'business',
            'health': 'health',
            'science': 'science',
            'sports': 'sports',
            'entertainment': 'entertainment',
            'general': 'general'
        };

        const lowerPreference = preference.toLowerCase();
        const category = categoryMap[lowerPreference];
        
        return {
            category: category,
            query: category || preference
        };
    }

    async getNewsByPreferences(preferences: string[]): Promise<NewsArticle[]> {
        // Check cache first
        const cachedArticles = await this.cacheService.getCachedArticles(preferences);
        if (cachedArticles) {
            console.log('Returning cached articles');
            return cachedArticles;
        }

        console.log('Cache miss - fetching from APIs');
        const allArticles: NewsArticle[] = [];
        const seenUrls = new Set<string>();

        // If no preferences, fetch general news
        if (!preferences || preferences.length === 0) {
            const promises = [
                this.fetchNewsApi('general'),
                this.fetchNewsCatcher('general'),
                this.fetchGNews('general'),
                this.fetchNewsApiAi('general')
            ];

            const results = await Promise.allSettled(promises);
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    result.value.forEach(article => {
                        if (!seenUrls.has(article.url)) {
                            seenUrls.add(article.url);
                            allArticles.push(article);
                        }
                    });
                }
            });

            const sortedArticles = this.sortAndLimitArticles(allArticles);
            // Cache the results
            await this.cacheService.setCachedArticles(preferences, sortedArticles);
            return sortedArticles;
        }

        // Fetch news for each preference from all APIs
        for (const preference of preferences) {
            const { category, query } = this.getCategoryForPreference(preference);

            // Fetch from all APIs in parallel
            const promises = [
                category ? this.fetchNewsApi(category) : this.fetchNewsApi().then(() => []),
                this.fetchNewsCatcher(query),
                this.fetchGNews(query, category),
                this.fetchNewsApiAi(query, category)
            ];

            const results = await Promise.allSettled(promises);
            
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    result.value.forEach(article => {
                        if (!seenUrls.has(article.url)) {
                            seenUrls.add(article.url);
                            allArticles.push(article);
                        }
                    });
                }
            });
        }

        const sortedArticles = this.sortAndLimitArticles(allArticles);
        // Cache the results
        await this.cacheService.setCachedArticles(preferences, sortedArticles);
        return sortedArticles;
    }

    /**
     * Search articles by keyword (searches cached articles)
     */
    async searchArticles(keyword: string): Promise<NewsArticle[]> {
        const allCachedArticles = await this.cacheService.getAllCachedArticles();
        
        if (allCachedArticles.length === 0) {
            // If cache is empty, fetch general news first
            await this.getNewsByPreferences([]);
            return this.searchArticles(keyword); // Retry after populating cache
        }

        const lowerKeyword = keyword.toLowerCase();
        const matchedArticles = allCachedArticles.filter(article => {
            const titleMatch = article.title.toLowerCase().includes(lowerKeyword);
            const descriptionMatch = article.description.toLowerCase().includes(lowerKeyword);
            const sourceMatch = article.source.name.toLowerCase().includes(lowerKeyword);
            return titleMatch || descriptionMatch || sourceMatch;
        });

        return this.sortAndLimitArticles(matchedArticles);
    }

    /**
     * Get cache service instance for cache management
     */
    getCacheService(): CacheService {
        return this.cacheService;
    }

    private sortAndLimitArticles(articles: NewsArticle[]): NewsArticle[] {
        // Sort by published date (newest first)
        const sorted = articles.sort((a, b) => {
            const dateA = new Date(a.publishedAt).getTime();
            const dateB = new Date(b.publishedAt).getTime();
            return dateB - dateA;
        });

        // Limit to 100 articles total
        return sorted.slice(0, 100);
    }
}
