import {Request, Response} from 'express';
import {UserRepository} from '../infrastructure/repositories/user.repository';
import {ApiResponse} from '../../../utils/api-response';

export class PreferencesController {
    private static userRepository = new UserRepository();

    static async getPreferences(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized');
            }

            const user = await PreferencesController.userRepository.findById(userId);
            if (!user) {
                return ApiResponse.error(res, 404, 'User not found');
            }

            res.status(200).json({
                preferences: user.preferences || []
            });
        } catch (error) {
            ApiResponse.error(res, 500, 'Internal server error', error as Error);
        }
    }

    static async updatePreferences(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized');
            }

            const {preferences} = req.body;
            if (!Array.isArray(preferences)) {
                return ApiResponse.error(res, 400, 'Preferences must be an array');
            }

            const updatedUser = await PreferencesController.userRepository.updatePreferences(
                userId,
                preferences
            );

            if (!updatedUser) {
                return ApiResponse.error(res, 404, 'User not found');
            }

            res.status(200).json({
                preferences: updatedUser.preferences
            });
        } catch (error) {
            ApiResponse.error(res, 500, 'Internal server error', error as Error);
        }
    }
}

