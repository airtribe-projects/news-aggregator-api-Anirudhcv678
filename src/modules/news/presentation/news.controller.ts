import { Request, Response } from 'express';
import { NewsApiService } from '../infrastructure/services/news-api.service';
import { UserRepository } from '../../user/infrastructure/repositories/user.repository';

export class NewsController {
    private static newsApiService = new NewsApiService();
    private static userRepository = new UserRepository();

    static async getNews(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Get user preferences
            const user = await NewsController.userRepository.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if at least one API key is configured
            if (!process.env.NEWS_API_KEY && !process.env.NEWSCATCHER_API_KEY && 
                !process.env.GNEWS_API_KEY && !process.env.NEWSAPI_AI_KEY) {
                return res.status(500).json({ 
                    error: 'No news API keys configured',
                    message: 'Please configure at least one of: NEWS_API_KEY, NEWSCATCHER_API_KEY, GNEWS_API_KEY, or NEWSAPI_AI_KEY'
                });
            }

            // Fetch news based on preferences
            const articles = await NewsController.newsApiService.getNewsByPreferences(
                user.preferences || []
            );

            res.status(200).json({
                news: articles,
                count: articles.length
            });
        } catch (error: any) {
            console.error('Error fetching news:', error);
            res.status(500).json({ 
                error: 'Failed to fetch news', 
                message: error.message || 'An unexpected error occurred'
            });
        }
    }
}

