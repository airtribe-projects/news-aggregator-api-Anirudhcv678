import {Router, Request, Response, NextFunction} from 'express';
import {NewsController} from './news.controller';
import {authMiddleware} from '../../../middleware/auth.middleware';

const router = Router();

// Wrapper to catch async errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// GET /news - requires authentication
router.get('/', authMiddleware, asyncHandler(NewsController.getNews));

// GET /news/read - Get all read articles (must come before /:id/read)
router.get('/read', authMiddleware, asyncHandler(NewsController.getReadArticles));

// GET /news/favorites - Get all favorite articles (must come before /:id/favorite)
router.get('/favorites', authMiddleware, asyncHandler(NewsController.getFavoriteArticles));

// GET /news/search/:keyword - Search articles by keyword
router.get('/search/:keyword', authMiddleware, asyncHandler(NewsController.searchNews));

// POST /news/:id/read - Mark article as read
router.post('/:id/read', authMiddleware, asyncHandler(NewsController.markArticleAsRead));

// POST /news/:id/favorite - Mark article as favorite
router.post('/:id/favorite', authMiddleware, asyncHandler(NewsController.markArticleAsFavorite));

export default router;

