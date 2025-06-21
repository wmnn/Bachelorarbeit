export enum DiagnostikTyp {
    VORLAGE,
    LAUFENDES_VERFAHREN
}
export type Diagnostik = {
    id?: number,
    name: string,
    beschreibung: string,
    klasseId: number,
    format?: DiagnostikNumberFormat,
    erstellungsDatum?: string,
    vorlageId?: number,
    erstellungsTyp?: 'benutzerdefiniert' | 'Vorlage'
    speicherTyp: DiagnostikTyp,
    obereGrenze?: number | string,
    userId?: number,
    untereGrenze?: number | string,
    farbbereiche?: Farbbereich[],
    anhang?: any[],
    geeigneteKlassen?: string[],
    kategorien?: string[]
}

export enum DiagnostikNumberFormat {
    PROZENT = 'Prozent',
    NUMMER = 'Nummer'
} 
export interface Farbbereich {
    obereGrenze?: number | string,
    hexFarbe: string
} 