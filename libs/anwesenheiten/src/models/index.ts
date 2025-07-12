export enum Anwesenheitsstatus {
    ANWESEND,
    VERSPAETET,
    FEHLT_ENTSCHULDIGT,
    FEHLT_UNENTSCHULDIGT
}

export const ANWESENHEITEN = [
    Anwesenheitsstatus.ANWESEND,
    Anwesenheitsstatus.FEHLT_ENTSCHULDIGT,
    Anwesenheitsstatus.VERSPAETET,
    Anwesenheitsstatus.FEHLT_UNENTSCHULDIGT
]

export const AnwesenheitenLabels = {
    [Anwesenheitsstatus.ANWESEND] : 'anwesend',
    [Anwesenheitsstatus.VERSPAETET] : 'verspätet',
    [Anwesenheitsstatus.FEHLT_ENTSCHULDIGT] : 'fehlt entschuldigt',
    [Anwesenheitsstatus.FEHLT_UNENTSCHULDIGT] : 'fehlt unentschuldigt'
}
export enum Anwesenheitstyp {
    UNTERRICHT,
    GANZTAG
}
export const AnwesenheitTypLabel = {
    [Anwesenheitstyp.GANZTAG]: 'Ganztag',
    [Anwesenheitstyp.UNTERRICHT]: 'Unterricht',
}