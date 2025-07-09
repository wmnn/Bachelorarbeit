import { Diagnostik, DiagnostikTyp, Sichtbarkeit } from "@thesis/diagnostik";
import { getDiagnostikStore } from "../../singleton";
import { Request } from "express";
import { Berechtigung, BerechtigungWert } from "@thesis/rollen";

export async function canUserCreateDiagnostik(req: Request): Promise<{
    success: boolean
}> {
    const permission = req.permissions?.[Berechtigung.DiagnostikverfahrenRead]
    const allowed: BerechtigungWert<Berechtigung.DiagnostikverfahrenRead>[] = ['alle', 'eigene']
    if (!permission || !allowed.includes(permission)) {
        return {
            success: false
        }
    }

    return {
        success: true
    }
}
export async function canUserUpdateSichtbarkeit(req: Request): Promise<{
    success: boolean
}> {
    const isAdmin = req.permissions?.[Berechtigung.DiagnostikverfahrenRead] == 'alle'
    if (!isAdmin) {
        return {
            success: false
        }
    }

    return {
        success: true
    }
}
export async function canUserDeleteDiagnostik(diagnostikId: string, req: Request): Promise<{
    success: boolean
}> {
    const permission = req.permissions?.[Berechtigung.DiagnostikverfahrenDelete]
    const allowed: BerechtigungWert<Berechtigung.DiagnostikverfahrenDelete>[] = [true]
    const isAdmin = req.permissions?.[Berechtigung.DiagnostikverfahrenRead] == 'alle'
    const diagnostik = await getDiagnostikStore().getDiagnostik(parseInt(diagnostikId))
    const isDiagnostikCreatedByUser = diagnostik?.userId != req.userId
    if (!permission || !allowed.includes(permission)) {
        return {
            success: false
        }
    }

    if (diagnostik?.speicherTyp == DiagnostikTyp.GETEILT) {
        return {
                success: false
        }
    }

    if (diagnostik?.speicherTyp == DiagnostikTyp.VORLAGE && !isAdmin) {
        return {
            success: false
        }
    }

    if (isDiagnostikCreatedByUser || isAdmin) { 
        return {
            success: true
        }
    }

    return {
        success: false
    }
}


export async function canEditDiagnostik(diagnostikId: string, req: Request): Promise<{
    success: boolean,
    diagnostik?: Diagnostik
}> {
    const diagnostik = await getDiagnostikStore().getDiagnostik(parseInt(diagnostikId))
    const isAdmin = req.permissions?.[Berechtigung.DiagnostikverfahrenRead] == 'alle'
    if (isAdmin) {
        return {
            success: true
        }
    } 

    if ((req.userId ?? -1) != (diagnostik?.userId ?? -1)) {
        return {
            success: false
        }
    }

    if (
        diagnostik?.sichtbarkeit == Sichtbarkeit.ÖFFENTLICH && 
        diagnostik.userId != req.userId
    ) {
        return {
            success: false
        }
    }

    return canUserAccessDiagnostik(diagnostikId, req)
}

export async function canUserAccessDiagnostik(diagnostikId: string, req: Request, diagnostik?: Diagnostik): Promise<{
    success: boolean,
    diagnostik?: Diagnostik
}> {

    if (!diagnostik) {
        diagnostik = await getDiagnostikStore().getDiagnostik(parseInt(diagnostikId))
    }
    
    if (diagnostik?.speicherTyp == DiagnostikTyp.VORLAGE) {
        const permission = req.permissions?.[Berechtigung.DiagnostikverfahrenRead]
        const allowed: BerechtigungWert<Berechtigung.DiagnostikverfahrenRead>[] = ['alle', 'eigene'] 
        if (!permission || !allowed.includes(permission)) {
            return {
                success: false
            }
        }

        // Private Vorlagen sind nur für Personen sichtbar, die sie erstellt haben
        if (diagnostik.sichtbarkeit !== undefined 
            && diagnostik.sichtbarkeit === Sichtbarkeit.PRIVAT 
        ) {
            if (diagnostik.userId != req.userId && permission !== 'alle') {
                return {
                    success: false
                }
            }
        }

        return {
            success: true,
            diagnostik
        }
    }

    const permission = req.permissions?.[Berechtigung.DiagnostikverfahrenRead]
    const allowed: BerechtigungWert<Berechtigung.DiagnostikverfahrenRead>[] = ['alle', 'eigene'] 
    if (!permission || !allowed.includes(permission)) {
        return {
            success: false
        }
    }

    if (diagnostik?.geteiltMit?.includes(req.userId ?? -1)) {
        return {
            success: true,
            diagnostik
        }
    }

    if (diagnostik?.speicherTyp == DiagnostikTyp.LAUFENDES_VERFAHREN) {
        if (permission == 'eigene' && diagnostik.userId != req.userId) {
            return {
                success: false // Der Nutzer ist kann nicht auf alle Zugreifen und versucht auf eine fremde Diagnostik zuzugreifen
            }
        }
        return {
            success: true,
            diagnostik
        }
    }

    return {
        success: false
    }
}