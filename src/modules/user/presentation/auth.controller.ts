import {Request, Response} from 'express';
import {UserRepository} from '../infrastructure/repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {ApiResponse} from '../../../utils/api-response';
import {
    validateRequiredFields,
    validateFieldTypes,
    validateEmail,
    validatePassword,
    validateName,
    validatePreferences
} from '../../../utils/validators';

export class AuthController {
    private static userRepository = new UserRepository();

    static async register(req: Request, res: Response) {
        try {
            const {name, email, password, preferences} = req.body;

            // Validate request body structure
            if (!req.body || typeof req.body !== 'object') {
                return ApiResponse.error(res, 400, 'Request body must be a valid JSON object');
            }

            // Validate required fields
            const requiredFieldsValidation = validateRequiredFields(req.body, ['name', 'email', 'password']);
            if (!requiredFieldsValidation.isValid) {
                return ApiResponse.error(res, 400, requiredFieldsValidation.error || 'Validation failed');
            }

            // Validate field types
            const fieldTypesValidation = validateFieldTypes(req.body, {
                name: 'string',
                email: 'string',
                password: 'string'
            });
            if (!fieldTypesValidation.isValid) {
                return ApiResponse.error(res, 400, fieldTypesValidation.error || 'Invalid field types');
            }

            // Validate preferences if provided
            if (preferences !== undefined) {
                if (!Array.isArray(preferences)) {
                    return ApiResponse.error(res, 400, 'Preferences must be an array');
                }
                const preferencesValidation = validatePreferences(preferences);
                if (!preferencesValidation.isValid) {
                    return ApiResponse.error(res, 400, preferencesValidation.error || 'Invalid preferences format');
                }
            }

            // Validate name
            const nameValidation = validateName(name);
            if (!nameValidation.isValid) {
                return ApiResponse.error(res, 400, nameValidation.error || 'Invalid name');
            }

            // Validate email format
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
                return ApiResponse.error(res, 400, emailValidation.error || 'Invalid email');
            }

            // Validate password length
            const passwordValidation = validatePassword(password, 8);
            if (!passwordValidation.isValid) {
                return ApiResponse.error(res, 400, passwordValidation.error || 'Invalid password');
            }

            // Check if user already exists
            const existingUser = await AuthController.userRepository.findByEmail(email.trim().toLowerCase());
            if (existingUser) {
                return ApiResponse.error(res, 409, 'User with this email already exists');
            }

            // Prepare user data
            const userData: any = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: await bcrypt.hash(password, 10)
            };

            // Add preferences if provided
            if (preferences && Array.isArray(preferences)) {
                userData.preferences = [...new Set(preferences.map((p: string) => p.trim()))];
            }

            // Create user
            const newUser = await AuthController.userRepository.create(userData);

            if (!newUser) {
                return ApiResponse.error(res, 500, 'Failed to register user');
            }

            // Generate JWT token
            const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
            const token = jwt.sign(
                {id: newUser._id.toString(), email: newUser.email, name: newUser.name},
                jwtSecret,
                {expiresIn: '1h'}
            );

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser._id.toString(),
                    name: newUser.name,
                    email: newUser.email
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            ApiResponse.error(res, 500, 'Internal server error', error as Error);
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const {email, password} = req.body;

            // Validate request body structure
            if (!req.body || typeof req.body !== 'object') {
                return ApiResponse.error(res, 400, 'Request body must be a valid JSON object');
            }

            // Validate required fields
            const requiredFieldsValidation = validateRequiredFields(req.body, ['email', 'password']);
            if (!requiredFieldsValidation.isValid) {
                return ApiResponse.error(res, 400, requiredFieldsValidation.error || 'Email and password are required');
            }

            // Validate field types
            const fieldTypesValidation = validateFieldTypes(req.body, {
                email: 'string',
                password: 'string'
            });
            if (!fieldTypesValidation.isValid) {
                return ApiResponse.error(res, 400, fieldTypesValidation.error || 'Invalid field types');
            }

            // Validate email format
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
                return ApiResponse.error(res, 400, emailValidation.error || 'Invalid email format');
            }

            // Validate password is not empty
            if (!password || typeof password !== 'string' || password.length === 0) {
                return ApiResponse.error(res, 400, 'Password is required');
            }

            // Find user by email
            const user = await AuthController.userRepository.findByEmail(email.trim().toLowerCase());
            if (!user) {
                return ApiResponse.error(res, 401, 'Invalid email or password');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return ApiResponse.error(res, 401, 'Invalid email or password');
            }

            // Generate JWT token
            const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
            const token = jwt.sign(
                {id: user._id.toString(), email: user.email, name: user.name},
                jwtSecret,
                {expiresIn: '1h'}
            );

            res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            ApiResponse.error(res, 500, 'Internal server error', error as Error);
        }
    }
}