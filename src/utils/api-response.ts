import { Response } from 'express';

interface SuccessResponse {
    success: boolean;
    status: number;
    message: string;
    data?: object | any[];
}

interface ErrorResponse {
    success: boolean;
    status: number;
    error: string;
    details?: {
        message?: string;
        stack?: string;
        [key: string]: any;
    };
}

export class ApiResponse {
    static success(res: Response, status: number, message: string, data?: object | any[]): void {
        const response: SuccessResponse = {
            success: true,
            status,
            message,
        };
        
        if (data !== undefined) {
            response.data = data;
        }
        
        res.status(status).json(response);
    }

    static error(
        res: Response, 
        status: number, 
        error: string, 
        errorDetails?: Error | { [key: string]: any }
    ): void {
        const isDevelopment = process.env.NODE_ENV === 'development';
        const response: ErrorResponse = {
            success: false,
            status,
            error,
        };
        // Add debugging details in development mode
        if (isDevelopment && errorDetails) {
            response.details = {};
            
            if (errorDetails instanceof Error) {
                response.details.message = errorDetails.message;
                response.details.stack = errorDetails.stack;
            } else {
                Object.assign(response.details, errorDetails);
            }
        }
        
        res.status(status).json(response);
    }
}

