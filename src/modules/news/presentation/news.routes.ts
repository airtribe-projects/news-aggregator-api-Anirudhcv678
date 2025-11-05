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

export default router;

