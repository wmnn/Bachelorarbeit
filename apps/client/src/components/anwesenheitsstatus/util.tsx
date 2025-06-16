import { Anwesenheiten, AnwesenheitenLabels } from "@thesis/anwesenheiten"

export function styleAnwesenheit(val: Anwesenheiten) {
    let color = getColor(val)
    return <div className="flex justify-between w-full gap-4 items-center">
        <div className={`h-[8px] w-[8px] rounded-4xl ${color}`}/> 
        <p>
            {AnwesenheitenLabels[val]}
        </p>
    </div>
}
export function getColor(val: Anwesenheiten): string | undefined {
    let color = undefined
    if (val === Anwesenheiten.ANWESEND) {
        color = "bg-green-600"
    } else if (val === Anwesenheiten.FEHLT_ENTSCHULDIGT) {
        color = "bg-yellow-300"
    } else if (val === Anwesenheiten.FEHLT_UNENTSCHULDIGT) {
        color = "bg-red-600"
    } else if (val === Anwesenheiten.VERSPAETET) {
        color = "bg-orange-400"
    }
    return color;
}