export enum Berechtigung {
    KlasseCreate,
    KlasseRead,
    KlasseUpdate,
    KlasseDelete,
    GanztagsangebotCreate,
    GanztagsangebotRead,
    GanztagsangebotUpdate,
    GanztagsangebotDelete,
    SchuelerCreate,
    SchuelerRead,
    SchuelerUpdate,
    SchuelerDelete,
    AnwesenheitsstatusUpdate,
    AnwesenheitsstatusRead,
    DiagnostikverfahrenRead,
    DiagnostikverfahrenDelete,
    RollenVerwalten,
    NachrichtenvorlagenVerwalten,
    NachrichtenDelete,
}

export type Rolle = {
    rolle: string,
    berechtigungen: Berechtigungen
}

export type Berechtigungen = {
    [Berechtigung.KlasseCreate]: true | false;
    [Berechtigung.KlasseRead]: "alle" | "eigene" | "keine";
    [Berechtigung.KlasseUpdate]: true | false;
    [Berechtigung.KlasseDelete]: true | false;
    [Berechtigung.GanztagsangebotCreate]: true | false;
    [Berechtigung.GanztagsangebotRead]: "alle" | "eigene" | "keine";
    [Berechtigung.GanztagsangebotUpdate]: true | false;
    [Berechtigung.GanztagsangebotDelete]: true | false;
    [Berechtigung.SchuelerCreate]: true | false;
    [Berechtigung.SchuelerRead]: "alle" | "eigene" | "keine";
    [Berechtigung.SchuelerUpdate]: true | false;
    [Berechtigung.SchuelerDelete]: true | false;
    [Berechtigung.AnwesenheitsstatusUpdate]: true | false;
    [Berechtigung.AnwesenheitsstatusRead]: true | false;
    [Berechtigung.DiagnostikverfahrenRead]: "alle" | "eigene" | "keine";
    [Berechtigung.DiagnostikverfahrenDelete]: true | false;
    [Berechtigung.RollenVerwalten]: true | false;
    [Berechtigung.NachrichtenvorlagenVerwalten]: true | false;
    [Berechtigung.NachrichtenDelete]: "alle" | "eigene";
};
