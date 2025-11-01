import {Request, Response} from 'express';
import {UserRepository} from '../infrastructure/repositories/user.repository';
import bcrypt from 'bcrypt';

export class AuthController {
    private static userRepository = new UserRepository();

    static async register(req: Request, res: Response) {
        const {name, email, password} = req.body;
        try {
            const existingUser = await AuthController.userRepository.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({message: 'User already exists'});
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await AuthController.userRepository.create({name, email, password: hashedPassword});
            res.status(201).json({message: 'User registered successfully', user: newUser});
        } catch (error) {
            res.status(500).json({message: 'Internal server error'});
        }
    }

    static async login(req: Request, res: Response) {
        const {email, password} = req.body;
        try {
            const user = await AuthController.userRepository.findByEmail(email);
            if (!user) {
                return res.status(400).json({message: 'Invalid credentials'});
            }
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({message: 'Invalid credentials'});
            }
            res.status(200).json({message: 'Login successful', user: {id: user.id, name: user.name, email: user.email}});
        } catch (error) {
            res.status(500).json({message: 'Internal server error'});
        }
    }
}