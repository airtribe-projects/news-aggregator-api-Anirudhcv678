import {Router, Request, Response, NextFunction} from 'express';
import {AuthController} from './auth.controller';

const router = Router();

// Wrapper to catch async errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

router.post('/signup', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));

export default router;