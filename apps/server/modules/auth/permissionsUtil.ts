import { Response } from "express";

export const getNoSessionResponse = (res: Response) => {
    return res.status(403).json({
        success: false,
        message: 'Es wurde keine Sitzung gefunden.'
    })
} 