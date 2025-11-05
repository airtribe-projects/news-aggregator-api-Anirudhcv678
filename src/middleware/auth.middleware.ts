import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/api-response";

// Extend Express Request to include user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
            };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        
        // Check if authorization header exists
        if (!authHeader) {
            ApiResponse.error(res, 401, "Unauthorized - No authorization header provided");
            return;
        }

        // Check if authorization header starts with 'Bearer '
        if (!authHeader.startsWith("Bearer ")) {
            ApiResponse.error(res, 401, "Unauthorized - Invalid authorization header format. Expected 'Bearer <token>'");
            return;
        }

        const token = authHeader.split(" ")[1];
        
        // Check if token exists after 'Bearer '
        if (!token || token.trim().length === 0) {
            ApiResponse.error(res, 401, "Unauthorized - Token is missing or empty");
            return;
        }

        // Verify JWT token
        const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
        const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; name: string };
        
        // Validate decoded token structure
        if (!decoded || !decoded.id || !decoded.email || !decoded.name) {
            ApiResponse.error(res, 401, "Unauthorized - Invalid token payload");
            return;
        }

        // Attach user info to request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name
        };
        
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error instanceof jwt.TokenExpiredError) {
            ApiResponse.error(res, 401, "Unauthorized - Token has expired. Please login again");
            return;
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
            ApiResponse.error(res, 401, "Unauthorized - Invalid token signature");
            return;
        }

        if (error instanceof jwt.NotBeforeError) {
            ApiResponse.error(res, 401, "Unauthorized - Token not yet valid");
            return;
        }

        // Handle any other errors
        console.error('Auth middleware error:', error);
        ApiResponse.error(res, 401, "Unauthorized - Token verification failed");
        return;
    }
};

