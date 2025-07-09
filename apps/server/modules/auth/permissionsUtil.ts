import { LoginRedirectAction } from "@thesis/auth";
import { Response } from "express";

export const getNoSessionResponse = (res: Response) => {
    return res.status(403).json({
        success: false,
        message: 'Es wurde keine Sitzung gefunden.',
        redirect: LoginRedirectAction.REDIRECT_TO_LOGIN
    })
} 
export const getNoPermissionResponse = (res: Response) => {
    return res.status(403).json({
            success: false,
            message: 'Du hast nicht die notwendigen Berechtigungen.'
    });
}
export const getErrorResponse = (res: Response) => {
    return res.status(400).json({
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
    });
}
export const getInternalErrorResponse = (res: Response) => {
    return res.status(500).json({
            success: false,
            message: 'Ein Fehler ist aufgetreten.'
    });
}