export enum NachrichtenTyp {
    KLASSE,
    SCHÜLER
}
export type Nachricht = {
    nachrichtId: number,
    id: number,
    typ: NachrichtenTyp,
    userId: number,
    versionen: NachrichtenVersion[]
}
export type NachrichtenVersion = {
    inhalt: string,
    zeitstempel?: string,
    lesestatus?: Lesestatus.GELESEN,
    nachrichtenversionId: number
}

export enum Lesestatus {
    GELESEN
}

export type NachrichtenVorlage = {
    id: number,
    typ: NachrichtenTyp,
    inhalt: string
}