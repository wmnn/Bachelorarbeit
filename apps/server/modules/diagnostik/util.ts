import { DiagnostikTyp, Sichtbarkeit } from "@thesis/diagnostik";
import { getDiagnostikStore } from "../../singleton";
import { Request } from "express";
import { Berechtigung, BerechtigungWert } from "@thesis/rollen";


export function getDiagnostikTyp (val?: string) {
    let speicherTyp = DiagnostikTyp.LAUFENDES_VERFAHREN;

    if (val) {
        const typ = parseInt(val); 
        if (!isNaN(typ)) {
            speicherTyp = typ as DiagnostikTyp;
        }
    }
    return speicherTyp
}

export const getDiagnostiken = async (req: Request, typ: DiagnostikTyp) => {

    const userId = req.userId
    if (!userId) {
        return {
            success: false,
            status: 403,
            data: []
        } 
    }

    const permission = req.permissions?.[Berechtigung.DiagnostikverfahrenRead]
    const allowed: BerechtigungWert<Berechtigung.DiagnostikverfahrenRead>[] = ['alle', 'eigene'] 
    if (!permission || !allowed.includes(permission)) {
        return {
            success: false,
            status: 403,
            data: []
        }
    }
    
    if (typ === DiagnostikTyp.GETEILT) {
        let query = await getDiagnostikStore().getDiagnostiken(DiagnostikTyp.LAUFENDES_VERFAHREN);
        if (!query.success || query.data == null) {
            return {
                success: false,
                status: 400,
                data: []
            }
        }
        let diagnostiken = query.data
        const shared = await getDiagnostikStore().getDiagnostikenGeteilt(userId ?? -1)
        if (!shared.success || shared.data == null) {
            return {
                success: false,
                status: 400,
                data: []
            }
        }
        return {
            success: true,
            status: 200,
            data: diagnostiken.filter(diagnostik => shared.data.includes(diagnostik.id ?? -1))
        }
    }

    let data = await getDiagnostikStore().getDiagnostiken(typ);
    if (permission == 'eigene' && typ === DiagnostikTyp.LAUFENDES_VERFAHREN) {
        data.data = data.data?.filter(o => o.userId == req.userId) ?? []
    }
    if (permission == 'eigene' && typ === DiagnostikTyp.VORLAGE) {
        data.data = data.data?.filter(o => o.sichtbarkeit == Sichtbarkeit.ÖFFENTLICH || o.userId == userId) ?? []
    }
    return {
        success: true,
        status: 200,
        data: data.data ?? []
    }
}