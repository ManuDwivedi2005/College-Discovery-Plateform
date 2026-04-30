import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        name: string;
    };
}
export declare function generateToken(user: {
    id: number;
    email: string;
    name: string;
}): string;
export declare function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
