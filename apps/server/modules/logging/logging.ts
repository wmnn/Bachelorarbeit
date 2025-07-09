import { NextFunction, Request } from "express";

export const loggingMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.originalUrl.startsWith('/api')) {
        return next();
    }
    if (req.method === 'OPTIONS') {
        console.log(`[Preflight] ${req.method} ${req.originalUrl}`);
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