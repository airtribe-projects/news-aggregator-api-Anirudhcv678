import {Router} from 'express';
import {PreferencesController} from './preferences.controller';
import {authMiddleware} from '../../../middleware/auth.middleware';

const router = Router();

// Both routes require authentication
router.get('/preferences', authMiddleware, PreferencesController.getPreferences);
router.put('/preferences', authMiddleware, PreferencesController.updatePreferences);

export default router;

