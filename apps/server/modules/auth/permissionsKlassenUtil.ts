import { Berechtigung, BerechtigungWert } from "@thesis/rollen"
import { Halbjahr, Klasse, Schuljahr } from "@thesis/schule"
import { Request } from "express"
import { getKlassenStore } from "../../singleton"


export async function canUserAccessClass(klasseId: number, req: Request, schuljahr: Schuljahr, halbjahr: Halbjahr, klasse?: Klasse): Promise<{
    success: boolean,
    klasse?: Klasse
}> {
    const userId = req.userId
    if (!userId) {
        return {
            success: false
        }
    }
    if (req.permissions?.[Berechtigung.KlasseRead] == 'keine') {
        return {
            success: false
        }
    }
    const canAccessAll = req.permissions?.[Berechtigung.KlasseRead] == 'alle'
    if (!klasse) {
        klasse = await getKlassenStore().getClass(schuljahr, halbjahr, klasseId)
    }
    if (!klasse) {
        return {
            success: false
        }
    }

    if (canAccessAll) {
        return {
            success: true,
            klasse
        }
    }

    if (klasse.klassenlehrer?.some(o => o.id === userId)) {
        return {
            success: true
        }
    }
   
    return {
        success: false
    }
}

export async function canUserEditClass(klasseId: number, req: Request, schuljahr: Schuljahr, halbjahr: Halbjahr, klasse?: Klasse): Promise<{
    success: boolean
}> {
    if (req.permissions?.[Berechtigung.KlasseUpdate] == true && await canUserAccessClass(klasseId, req, schuljahr, halbjahr, klasse)) {
        return {
            success: true,
        }
    }

    return {
        success: false
    }
}

export async function canUserDeleteClass(klasseId: number, req: Request, schuljahr: Schuljahr, halbjahr: Halbjahr, klasse?: Klasse): Promise<{
    success: boolean
}> {
    console.log(req.permissions?.[Berechtigung.KlasseDelete])
    if (req.permissions?.[Berechtigung.KlasseDelete] == true && await canUserAccessClass(klasseId, req, schuljahr, halbjahr, klasse)) {
        return {
            success: true,
        }
    }

    return {
        success: false
    }
}
