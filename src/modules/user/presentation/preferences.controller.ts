import {Request, Response} from 'express';
import {UserRepository} from '../infrastructure/repositories/user.repository';
import {ApiResponse} from '../../../utils/api-response';
import {
    validateRequiredFields,
    validateFieldTypes,
    validatePreferences
} from '../../../utils/validators';

export class PreferencesController {
    private static userRepository = new UserRepository();

    static async getPreferences(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized - User authentication required');
            }

            const user = await PreferencesController.userRepository.findById(userId);
            if (!user) {
                return ApiResponse.error(res, 404, 'User not found');
            }

            ApiResponse.success(res, 200, 'Preferences retrieved successfully', {
                preferences: user.preferences || []
            });
        } catch (error) {
            console.error('Get preferences error:', error);
            ApiResponse.error(res, 500, 'Internal server error', error as Error);
        }
    }

    static async updatePreferences(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 401, 'Unauthorized - User authentication required');
            }

            // Validate request body structure
            if (!req.body || typeof req.body !== 'object') {
                return ApiResponse.error(res, 400, 'Request body must be a valid JSON object');
            }

            // Validate required fields
            const requiredFieldsValidation = validateRequiredFields(req.body, ['preferences']);
            if (!requiredFieldsValidation.isValid) {
                return ApiResponse.error(res, 400, requiredFieldsValidation.error || 'Preferences field is required');
            }

            // Validate field types
            const fieldTypesValidation = validateFieldTypes(req.body, {
                preferences: 'array'
            });
            if (!fieldTypesValidation.isValid) {
                return ApiResponse.error(res, 400, fieldTypesValidation.error || 'Preferences must be an array');
            }

            const {preferences} = req.body;

            // Validate preferences array structure and content
            const preferencesValidation = validatePreferences(preferences);
            if (!preferencesValidation.isValid) {
                return ApiResponse.error(res, 400, preferencesValidation.error || 'Invalid preferences format');
            }

            // Remove duplicates and trim whitespace
            const cleanedPreferences = [...new Set(preferences.map((p: string) => p.trim()))] as string[];

            const updatedUser = await PreferencesController.userRepository.updatePreferences(
                userId,
                cleanedPreferences
            );

            if (!updatedUser) {
                return ApiResponse.error(res, 404, 'User not found');
            }

            ApiResponse.success(res, 200, 'Preferences updated successfully', {
                preferences: updatedUser.preferences
            });
        } catch (error) {
            console.error('Update preferences error:', error);
            ApiResponse.error(res, 500, 'Internal server error', error as Error);
        }
    }
}

