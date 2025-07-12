import { Anwesenheitsstatus, AnwesenheitenLabels } from "@thesis/anwesenheiten"

export function styleAnwesenheit(val: Anwesenheitsstatus) {
    let color = getColor(val)
    return <div className="flex justify-between w-full gap-4 items-center">
        <div className={`h-[8px] w-[8px] rounded-4xl ${color}`}/> 
        <p>
            {AnwesenheitenLabels[val]}
        </p>
    </div>
}
export function getColor(val: Anwesenheitsstatus): string | undefined {
    let color = undefined
    if (val === Anwesenheitsstatus.ANWESEND) {
        color = "bg-green-600"
    } else if (val === Anwesenheitsstatus.FEHLT_ENTSCHULDIGT) {
        color = "bg-yellow-300"
    } else if (val === Anwesenheitsstatus.FEHLT_UNENTSCHULDIGT) {
        color = "bg-red-600"
    } else if (val === Anwesenheitsstatus.VERSPAETET) {
        color = "bg-orange-400"
    }
    return color;
}