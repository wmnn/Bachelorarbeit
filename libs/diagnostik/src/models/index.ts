export enum DiagnostikTyp {
    VORLAGE,
    LAUFENDES_VERFAHREN,
    GETEILT
}
export enum Sichtbarkeit {
    PRIVAT,
    ÖFFENTLICH
}
export type Auswertungsgruppe = {
    name: string,
    schuelerIds: number[]
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
    kategorien?: string[],
    sichtbarkeit?: Sichtbarkeit,
    files?: string[],
    geteiltMit?: number[],
    auswertungsgruppen?: Auswertungsgruppe[]
}
export type UploadedFile = {
  name: string;
  mimetype: string;
  size: number;
  data: any;
};

export enum DiagnostikNumberFormat {
    PROZENT = 'Prozent',
    NUMMER = 'Nummer'
} 
export interface Farbbereich {
    obereGrenze?: number | string,
    hexFarbe: string
} 

export interface Ergebnis {
    schuelerId: number,
    ergebnis: string,
    datum?: string,
}

export interface Row {
    schuelerId: number,
    ergebnisse: Ergebnis[]
}