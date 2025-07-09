import { LOGIN_ENDPOINT, REGISTER_ENDPOINT } from "@thesis/config";
import { NextFunction, Request } from "express";

export const loggingMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    return next()
    if (!req.originalUrl.startsWith('/api')) {
        return next();
    }
    if (req.method === 'OPTIONS') {
        console.log(`[Preflight] ${req.method} ${req.originalUrl}`);
        return next();
    }

    // Don't log passwords
    if (req.originalUrl.endsWith(LOGIN_ENDPOINT) || req.originalUrl.endsWith(REGISTER_ENDPOINT) || req.originalUrl.endsWith('password')) {
        return next();
    }

    const logEntry = {
        time: new Date().toISOString(),
        method: req.method,
        endpoint: req.originalUrl,
        query: req.query,
        params: req.params,
        body: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '',
    };

    console.log('[Request Log]', JSON.stringify(logEntry, null, 2));
    next();
};