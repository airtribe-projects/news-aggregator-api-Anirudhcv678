import {Request, Response} from 'express';
import {UserRepository} from '../infrastructure/repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {ApiResponse} from '../../../utils/api-response';

export class AuthController {
    private static userRepository = new UserRepository();

    static async register(req: Request, res: Response) {
        const {name, email, password} = req.body;
        try {
            // Validate required fields
            if (!name || !email || !password) {
                return ApiResponse.error(res, 400, 'Name, email, and password are required');
            }
            
            const existingUser = await AuthController.userRepository.findByEmail(email);
            if (existingUser) {
                return ApiResponse.error(res, 400, 'User already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await AuthController.userRepository.create({name, email, password: hashedPassword});
            if(!newUser) {
                return ApiResponse.error(res, 400, 'Failed to register user');
            }
            const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
            const token = jwt.sign(
                {id: newUser._id.toString(), email: newUser.email, name: newUser.name}, 
                jwtSecret, 
                {expiresIn: '1h'}
            );
            res.status(200).json({
                token,
                user: {id: newUser._id.toString(), name: newUser.name, email: newUser.email}
            });
        } catch (error) {
            ApiResponse.error(res, 500, 'Internal server error', error as Error);
        }
    }

    static async login(req: Request, res: Response) {
        const {email, password} = req.body;
        try {
            const user = await AuthController.userRepository.findByEmail(email);
            if (!user) {
                return ApiResponse.error(res, 401, 'Invalid credentials');
            }
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return ApiResponse.error(res, 401, 'Invalid credentials');
            }
            const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
            const token = jwt.sign(
                {id: user._id.toString(), email: user.email, name: user.name}, 
                jwtSecret, 
                {expiresIn: '1h'}
            );
            res.status(200).json({
                token,
                user: {id: user._id.toString(), name: user.name, email: user.email}
            });
        } catch (error) {
            ApiResponse.error(res, 500, 'Internal server error', error as Error);
        }
    }
}