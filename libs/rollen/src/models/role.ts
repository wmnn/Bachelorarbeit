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
    NachrichtenRead,
    NachrichtenUpdate,
    NachrichtenDelete,
}

export const BERECHTIGUNGEN_LABELS: Record<Berechtigung, string>= {
    [Berechtigung.KlasseCreate]: "Klasse erstellen",
    [Berechtigung.KlasseRead]: "Klassen Zugriff",
    [Berechtigung.KlasseUpdate]: "Klassen ändern",
    [Berechtigung.KlasseDelete]: "Klassen löschen",
    [Berechtigung.GanztagsangebotCreate]: "Ganztagsangebot erstellen",
    [Berechtigung.GanztagsangebotRead]: "Ganztangsangebot Zugriff",
    [Berechtigung.GanztagsangebotUpdate]: "Ganztagsangebot verändern",
    [Berechtigung.GanztagsangebotDelete]: "Ganztagsangebot löschen",
    [Berechtigung.SchuelerCreate]: "Schüler erstellen",
    [Berechtigung.SchuelerRead]: "Schüler einsehen",
    [Berechtigung.SchuelerUpdate]: "Schüler verändern",
    [Berechtigung.SchuelerDelete]: "Schüler löschen",
    [Berechtigung.AnwesenheitsstatusUpdate]: "Anwesenheitsstatus setzen",
    [Berechtigung.AnwesenheitsstatusRead]: "Anwesenheitsstatus einsehen",
    [Berechtigung.DiagnostikverfahrenRead]: "Diagnostikverfahren Zugriff",
    [Berechtigung.DiagnostikverfahrenDelete]: "Diagnostikverfahren löschen",
    [Berechtigung.RollenVerwalten]: "Rollen verwalten",
    [Berechtigung.NachrichtenvorlagenVerwalten]: "Nachrichtenvorlagen verwalten",
    [Berechtigung.NachrichtenRead]: "Nachrichten Zugriff",
    [Berechtigung.NachrichtenUpdate]: "Nachrichten bearbeiten",
    [Berechtigung.NachrichtenDelete]: "Nachrichten löschen",
}

export type Rolle = {
    rolle: string,
    berechtigungen: Berechtigungen
}

export type BerechtigungWert<T extends Berechtigung> = Berechtigungen[T];

export const BERECHTIGUNGEN_VALUES: Record<Berechtigung, Array<any>>= {
    [Berechtigung.KlasseCreate]: [true, false],
    [Berechtigung.KlasseRead]: ["alle", "eigene", "keine"],
    [Berechtigung.KlasseUpdate]: [true, false],
    [Berechtigung.KlasseDelete]: [true, false],
    [Berechtigung.GanztagsangebotCreate]: [true, false],
    [Berechtigung.GanztagsangebotRead]: ["alle", "eigene", "keine"],
    [Berechtigung.GanztagsangebotUpdate]: [true, false],
    [Berechtigung.GanztagsangebotDelete]: [true, false],
    [Berechtigung.SchuelerCreate]: [true, false],
    [Berechtigung.SchuelerRead]: [true, false],
    [Berechtigung.SchuelerUpdate]: [true, false],
    [Berechtigung.SchuelerDelete]: [true, false],
    [Berechtigung.AnwesenheitsstatusUpdate]: [true, false],
    [Berechtigung.AnwesenheitsstatusRead]: [true, false],
    [Berechtigung.DiagnostikverfahrenRead]: ["alle", "eigene", "keine"],
    [Berechtigung.DiagnostikverfahrenDelete]: [true, false],
    [Berechtigung.RollenVerwalten]: [true, false],
    [Berechtigung.NachrichtenvorlagenVerwalten]: [true, false],
    [Berechtigung.NachrichtenRead]: [true, false],
    [Berechtigung.NachrichtenUpdate]: [true, false],
    [Berechtigung.NachrichtenDelete]: [true, false],
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
    [Berechtigung.SchuelerRead]: true | false;
    [Berechtigung.SchuelerUpdate]: true | false;
    [Berechtigung.SchuelerDelete]: true | false;
    [Berechtigung.AnwesenheitsstatusUpdate]: true | false;
    [Berechtigung.AnwesenheitsstatusRead]: true | false;
    [Berechtigung.DiagnostikverfahrenRead]: "alle" | "eigene" | "keine";
    [Berechtigung.DiagnostikverfahrenDelete]: true | false;
    [Berechtigung.RollenVerwalten]: true | false;
    [Berechtigung.NachrichtenvorlagenVerwalten]: true | false;
    [Berechtigung.NachrichtenRead]: true | false,
    [Berechtigung.NachrichtenUpdate]: true | false,
    [Berechtigung.NachrichtenDelete]: true | false;
};