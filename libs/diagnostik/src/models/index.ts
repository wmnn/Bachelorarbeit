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
    erstellungsTyp: 'benutzerdefiniert' | 'Vorlage'
    speicherTyp: DiagnostikTyp,
    obereGrenze?: number | string,
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