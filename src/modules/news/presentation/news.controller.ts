import { Request, Response } from 'express';
import { NewsApiService } from '../infrastructure/services/news-api.service';
import { UserRepository } from '../../user/infrastructure/repositories/user.repository';
import { ApiResponse } from '../../../utils/api-response';

export class NewsController {
    private static newsApiService = new NewsApiService();
    private static userRepository = new UserRepository();

    static async getNews(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized - User authentication required');
            }

            // Get user preferences
            const user = await NewsController.userRepository.findById(userId);
            if (!user) {
                return ApiResponse.error(res, 404, 'User not found');
            }

            // Check if at least one API key is configured
            if (!process.env.NEWS_API_KEY && !process.env.NEWSCATCHER_API_KEY && 
                !process.env.GNEWS_API_KEY && !process.env.NEWSAPI_AI_KEY) {
                return ApiResponse.error(res, 500, 'No news API keys configured', {
                    message: 'Please configure at least one of: NEWS_API_KEY, NEWSCATCHER_API_KEY, GNEWS_API_KEY, or NEWSAPI_AI_KEY'
                });
            }

            // Fetch news based on preferences
            const articles = await NewsController.newsApiService.getNewsByPreferences(
                user.preferences || []
            );

            ApiResponse.success(res, 200, 'News retrieved successfully', {
                news: articles,
                count: articles.length
            });
        } catch (error) {
            console.error('Error fetching news:', error);
            ApiResponse.error(res, 500, 'Failed to fetch news', error as Error);
        }
    }

    static async markArticleAsRead(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized - User authentication required');
            }

            const articleUrl = decodeURIComponent(req.params.id);
            
            const user = await NewsController.userRepository.addReadArticle(userId, articleUrl);
            if (!user) {
                return ApiResponse.error(res, 404, 'User not found');
            }

            ApiResponse.success(res, 200, 'Article marked as read', {
                articleUrl
            });
        } catch (error) {
            console.error('Error marking article as read:', error);
            ApiResponse.error(res, 500, 'Failed to mark article as read', error as Error);
        }
    }

    static async markArticleAsFavorite(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized - User authentication required');
            }

            const articleUrl = decodeURIComponent(req.params.id);
            
            const user = await NewsController.userRepository.addFavoriteArticle(userId, articleUrl);
            if (!user) {
                return ApiResponse.error(res, 404, 'User not found');
            }

            ApiResponse.success(res, 200, 'Article marked as favorite', {
                articleUrl
            });
        } catch (error) {
            console.error('Error marking article as favorite:', error);
            ApiResponse.error(res, 500, 'Failed to mark article as favorite', error as Error);
        }
    }

    static async getReadArticles(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized - User authentication required');
            }

            const readArticleUrls = await NewsController.userRepository.getReadArticles(userId);
            
            // Get all cached articles to filter read ones
            const cacheService = NewsController.newsApiService.getCacheService();
            const allArticles = await cacheService.getAllCachedArticles();
            
            // Filter articles that are in read list
            const readArticles = allArticles.filter(article => 
                readArticleUrls.includes(article.url)
            );

            ApiResponse.success(res, 200, 'Read articles retrieved successfully', {
                articles: readArticles,
                count: readArticles.length
            });
        } catch (error) {
            console.error('Error fetching read articles:', error);
            ApiResponse.error(res, 500, 'Failed to fetch read articles', error as Error);
        }
    }

    static async getFavoriteArticles(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized - User authentication required');
            }

            const favoriteArticleUrls = await NewsController.userRepository.getFavoriteArticles(userId);
            
            // Get all cached articles to filter favorite ones
            const cacheService = NewsController.newsApiService.getCacheService();
            const allArticles = await cacheService.getAllCachedArticles();
            
            // Filter articles that are in favorites list
            const favoriteArticles = allArticles.filter(article => 
                favoriteArticleUrls.includes(article.url)
            );

            ApiResponse.success(res, 200, 'Favorite articles retrieved successfully', {
                articles: favoriteArticles,
                count: favoriteArticles.length
            });
        } catch (error) {
            console.error('Error fetching favorite articles:', error);
            ApiResponse.error(res, 500, 'Failed to fetch favorite articles', error as Error);
        }
    }

    static async searchNews(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized - User authentication required');
            }

            const keyword = req.params.keyword;
            if (!keyword) {
                return ApiResponse.error(res, 400, 'Keyword is required');
            }

            const articles = await NewsController.newsApiService.searchArticles(keyword);

            ApiResponse.success(res, 200, 'Search completed successfully', {
                articles,
                count: articles.length,
                keyword
            });
        } catch (error) {
            console.error('Error searching news:', error);
            ApiResponse.error(res, 500, 'Failed to search news', error as Error);
        }
    }
}

