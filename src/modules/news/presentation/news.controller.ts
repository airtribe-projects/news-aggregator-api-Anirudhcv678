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
}

