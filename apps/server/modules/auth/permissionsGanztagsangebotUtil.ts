import { Berechtigung } from "@thesis/rollen"
import { Ganztagsangebot, getGanztagsangebot, Halbjahr, Klasse, Schuljahr } from "@thesis/schule"
import { Request } from "express"


export async function canUserAccessGanztagsangebot(ganztagsangebotId: number, req: Request,schuljahr: Schuljahr, halbjahr: Halbjahr, ganztagsangebot?: Ganztagsangebot): Promise<{
    success: boolean,
    ganztagsangebot?: Ganztagsangebot
}> {
    const userId = req.userId
    if (!userId) {
        return {
            success: false
        }
    }
    if (req.permissions?.[Berechtigung.GanztagsangebotRead] == 'keine') {
        return {
            success: false
        }
    }
   

    if (!ganztagsangebot) {
        ganztagsangebot = await getGanztagsangebot(schuljahr, halbjahr, ganztagsangebotId)
    }
    if (req.permissions?.[Berechtigung.GanztagsangebotRead] == 'alle') {
        return {
            success: true,
            ganztagsangebot
        }
    }
  
    if (ganztagsangebot?.betreuer?.includes(userId)) {
        return {
            success: true,
            ganztagsangebot
        }
    }
   
    return {
        success: false
    }
}

export async function canUserEditGanztagsangebot(ganztagsangebotId: number, req: Request,schuljahr: Schuljahr, halbjahr: Halbjahr, ganztagsangebot?: Ganztagsangebot): Promise<{
    success: boolean
}> {
    if (req.permissions?.[Berechtigung.KlasseUpdate] == true && await canUserAccessGanztagsangebot(ganztagsangebotId, req, schuljahr, halbjahr, ganztagsangebot)) {
        return {
            success: true,
        }
    }

    return {
        success: false
    }
}

export async function canUserDeleteGanztagsangebot(ganztagsangebotId: number, req: Request,schuljahr: Schuljahr, halbjahr: Halbjahr, ganztagsangebot?: Ganztagsangebot): Promise<{
    success: boolean
}> {
    console.log(req.permissions?.[Berechtigung.KlasseDelete])
    if (req.permissions?.[Berechtigung.KlasseDelete] == true && await canUserAccessGanztagsangebot(ganztagsangebotId, req, schuljahr, halbjahr, ganztagsangebot)) {
        return {
            success: true,
        }
    }

    return {
        success: false
    }
}
