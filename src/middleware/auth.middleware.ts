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
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        ApiResponse.error(res, 401, "Unauthorized - No token provided");
        return;
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
        ApiResponse.error(res, 401, "Unauthorized - Invalid token format");
        return;
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
        const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; name: string };
        
        // Attach user info to request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name
        };
        
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            ApiResponse.error(res, 401, "Unauthorized - Token expired");
            return;
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
            ApiResponse.error(res, 401, "Unauthorized - Invalid token");
            return;
        }

        ApiResponse.error(res, 401, "Unauthorized - Token verification failed");
        return;
    }
};

