export enum DiagnostikTyp {
    VORLAGE,
    LAUFENDES_VERFAHREN
}
export type Diagnostik = {
    name: string,
    beschreibung: string,
    klasseId: number,
    format?: DiagnostikNumberFormat,
    vorlageId: number,
    typ: 'benutzerdefiniert' | 'Vorlage'
    obereGrenze?: number,
    untereGrenze?: number,
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
    obereGrenze?: number,
    hexFarbe: string
} 