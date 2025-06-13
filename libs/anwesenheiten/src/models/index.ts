export enum Anwesenheiten {
    ANWESEND,
    VERSPAETET,
    FEHLT_ENTSCHULDIGT,
    FEHLT_UNENTSCHULDIGT
}

export const ANWESENHEITEN = [
    Anwesenheiten.ANWESEND,
    Anwesenheiten.FEHLT_ENTSCHULDIGT,
    Anwesenheiten.VERSPAETET,
    Anwesenheiten.FEHLT_UNENTSCHULDIGT
]

export const AnwesenheitenLabels = {
    [Anwesenheiten.ANWESEND] : 'anwesend',
    [Anwesenheiten.VERSPAETET] : 'verspätet',
    [Anwesenheiten.FEHLT_ENTSCHULDIGT] : 'fehlt entschuldigt',
    [Anwesenheiten.FEHLT_UNENTSCHULDIGT] : 'fehlt unentschuldigt'
}
export enum AnwesenheitTyp {
    UNTERRICHT,
    GANZTAG
}